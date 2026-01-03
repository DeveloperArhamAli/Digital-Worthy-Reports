import { IPayment, ReportType, PaymentStatus } from '../models/Payment.model';
import { Report, IReport } from '../models/Report.model';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { BACKEND_URL } from '@utils/readDockerSecret';

interface VehicleInfo {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  bodyStyle?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
}

class ReportService {
  async generateFullReport(payment: IPayment): Promise<IReport> {
    try {
      // Check if report already exists for this payment
      const existingReport = await Report.findOne({ paymentId: payment._id });
      if (existingReport) {
        logger.info(`Report already exists for payment: ${payment._id}`);
        return existingReport;
      }

      // Decode VIN
      const vehicleInfo = await this.decodeVIN(payment.vin);
      
      // Fetch report data
      const reportData = await this.fetchReportData(payment.vin, payment.reportType);
      
      // Generate verdict for Silver and Gold reports
      let verdict;
      if (payment.reportType !== ReportType.BASIC) {
        verdict = this.generateVerdict(reportData);
      }

      // Generate PDF report
      const pdfUrl = await this.generatePDF({
        ...reportData,
        vehicle: {
          ...vehicleInfo,
          vin: payment.vin,
        },
        verdict,
        paymentDetails: {
          transactionId: payment.transactionId,
          reportType: payment.reportType,
          purchaseDate: payment.createdAt,
          customerName: payment.customerName,
          amount: payment.amount,
        },
      });

      // Calculate expiry date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create report document
      const report = await Report.create({
        paymentId: payment._id,
        vin: payment.vin,
        reportType: payment.reportType,
        ...reportData,
        verdict,
        reportUrl: pdfUrl,
        downloadCount: 0,
        expiresAt,
      });

      // Update payment with report URL
      await payment.updateOne({
        reportUrl: pdfUrl,
        reportGeneratedAt: new Date(),
        status: PaymentStatus.COMPLETED
      });

      logger.info(`Full report generated for payment: ${payment.transactionId}`);
      return report;
    } catch (error) {
      console.error(error)
      logger.error('Error generating full report:', error);
      throw error;
    }
  }

  private async decodeVIN(vin: string): Promise<VehicleInfo> {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );

      if (response.data.Results) {
        const results = response.data.Results;
        return {
          year: parseInt(results.find((r: any) => r.Variable === 'Model Year')?.Value) || undefined,
          make: results.find((r: any) => r.Variable === 'Make')?.Value,
          model: results.find((r: any) => r.Variable === 'Model')?.Value,
          trim: results.find((r: any) => r.Variable === 'Trim')?.Value,
          bodyStyle: results.find((r: any) => r.Variable === 'Body Style')?.Value,
          engine: results.find((r: any) => r.Variable === 'Engine Model')?.Value,
          transmission: results.find((r: any) => r.Variable === 'Transmission Style')?.Value,
          drivetrain: results.find((r: any) => r.Variable === 'Drive Type')?.Value,
          fuelType: results.find((r: any) => r.Variable === 'Fuel Type - Primary')?.Value,
        };
      }

      return {};
    } catch (error) {
      logger.warn(`Failed to decode VIN ${vin}:`, error);
      return {};
    }
  }

  private async fetchReportData(vin: string, reportType: ReportType): Promise<Partial<IReport>> {
    const data = axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/${vin}?format=json`);
    const mockData: Partial<IReport> = {
      vehicle: {
        year: 2020,
        make: 'Honda',
        model: 'Accord',
        trim: 'EX-L',
        bodyStyle: 'Sedan',
        engine: '2.0L 4-cylinder',
        transmission: 'Automatic',
        drivetrain: 'FWD',
        fuelType: 'Gasoline',
      },
      title: {
        status: 'Clean',
        issueDate: new Date('2020-01-15'),
        state: 'CA',
      },
      odometer: {
        lastReading: 45230,
        unit: 'miles',
        readings: [
          { date: new Date('2020-06-01'), reading: 12000, unit: 'miles' },
          { date: new Date('2021-06-01'), reading: 25000, unit: 'miles' },
          { date: new Date('2022-06-01'), reading: 38000, unit: 'miles' },
          { date: new Date('2023-06-01'), reading: 45230, unit: 'miles' },
        ],
      },
      accidents: [
        {
          date: new Date('2021-03-15'),
          severity: 'Minor',
          description: 'Rear bumper damage - police report filed',
          reportedBy: 'Police Report',
        },
      ],
      recalls: [
        {
          id: 'RCL-2022-001',
          date: new Date('2022-03-01'),
          description: 'Airbag sensor replacement',
          status: 'Completed',
        },
      ],
      theft: {
        isStolen: false,
      },
    };

    // Add market data for Silver and Gold reports
    if (reportType === ReportType.SILVER || reportType === ReportType.GOLD) {
      mockData.market = {
        value: 25000,
        range: { low: 23000, high: 27000 },
        comparison: [
          { vin: '1HGCM82633A123457', price: 25500, location: 'Los Angeles, CA' },
          { vin: '1HGCM82633A123458', price: 24800, location: 'San Diego, CA' },
        ],
      };
    }

    return mockData;
  }

  private generateVerdict(data: Partial<IReport>): IReport['verdict'] {
    let score = 100;
    const reasons: string[] = [];

    if (data.accidents && data.accidents.length > 0) {
      score -= data.accidents.length * 10;
      reasons.push(`${data.accidents.length} accident${data.accidents.length > 1 ? 's' : ''} reported`);
    }

    if (data.recalls && data.recalls.some(r => r.status !== 'Completed')) {
      score -= 15;
      reasons.push('Open recalls pending');
    }

    if (data.title?.status === 'Salvage') {
      score -= 40;
      reasons.push('Salvage title');
    }

    if (data.service?.records && data.service.records.length >= 3) {
      score += 10;
      reasons.push('Good service history');
    }

    let recommendation: 'BUY' | 'AVOID' | 'CAUTION';
    if (score >= 80) {
      recommendation = 'BUY';
    } else if (score >= 60) {
      recommendation = 'CAUTION';
    } else {
      recommendation = 'AVOID';
    }

    return { score, recommendation, reasons };
  }

  private async generatePDF(reportData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filename = `report-${uuidv4()}.pdf`;
        const reportsDir = path.join(__dirname, '../../public/reports');
        const filePath = path.join(reportsDir, filename);
        
        // Ensure directory exists
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);

        // Header


        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#10B981')
           .text('VEHICLE HISTORY REPORT', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#333333')
           .text(`Report ID: ${reportData.paymentDetails.transactionId}`, { align: 'center' })
           .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
        
        doc.moveDown(1);

        // Vehicle Information
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('VEHICLE INFORMATION');
        
        doc.moveDown(0.5);
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#333333');
        
        doc.text(`VIN: ${reportData.vehicle.vin}`);
        doc.text(`Year: ${reportData.vehicle.year || 'N/A'}`);
        doc.text(`Make: ${reportData.vehicle.make || 'N/A'}`);
        doc.text(`Model: ${reportData.vehicle.model || 'N/A'}`);
        doc.text(`Trim: ${reportData.vehicle.trim || 'N/A'}`);
        doc.moveDown(1);

        // Title Information
        if (reportData.title) {
          doc.fontSize(16)
             .font('Helvetica-Bold')
             .text('TITLE HISTORY');
          
          doc.moveDown(0.5);
          doc.fontSize(12)
             .font('Helvetica')
             .text(`Status: ${reportData.title.status}`);
          
          if (reportData.title.state) {
            doc.text(`State: ${reportData.title.state}`);
          }
          doc.moveDown(1);
        }

        // Accident History
        if (reportData.accidents && reportData.accidents.length > 0) {
          doc.fontSize(16)
             .font('Helvetica-Bold')
             .text('ACCIDENT HISTORY');
          
          doc.moveDown(0.5);
          reportData.accidents.forEach((accident: any, index: number) => {
            doc.fontSize(12)
               .text(`Accident ${index + 1}: ${new Date(accident.date).toLocaleDateString()} - ${accident.severity}`);
            doc.fontSize(10)
               .text(`   ${accident.description}`);
            doc.moveDown(0.5);
          });
          doc.moveDown(1);
        }

        // Service Records
        if (reportData.service?.records && reportData.service.records.length > 0) {
          doc.addPage();
          doc.fontSize(16)
             .font('Helvetica-Bold')
             .text('SERVICE HISTORY');
          
          doc.moveDown(0.5);
          reportData.service.records.forEach((service: any, index: number) => {
            doc.fontSize(12)
               .text(`${new Date(service.date).toLocaleDateString()}: ${service.type}`);
            doc.fontSize(10)
               .text(`   Location: ${service.location}`);
            doc.moveDown(0.5);
          });
          doc.moveDown(1);
        }

        // Verdict
        if (reportData.verdict) {
          doc.addPage();
          doc.fontSize(18)
             .font('Helvetica-Bold')
             .fillColor('#10B981')
             .text('FINAL ASSESSMENT', { align: 'center' });
          
          doc.moveDown(1);
          doc.fontSize(36)
             .fillColor(reportData.verdict.score >= 80 ? '#10B981' : 
                       reportData.verdict.score >= 60 ? '#F59E0B' : '#EF4444')
             .text(`${reportData.verdict.score}/100`, { align: 'center' });
          
          doc.moveDown(1);
          doc.fontSize(20)
             .fillColor('#000000')
             .text(`Recommendation: ${reportData.verdict.recommendation}`, { align: 'center' });
          
          doc.moveDown(1);
          doc.fontSize(14)
             .text('Key Factors:');
          
          reportData.verdict.reasons.forEach((reason: string) => {
            doc.fontSize(12)
               .text(`• ${reason}`);
          });
        }

        // Footer
        doc.addPage();
        doc.fontSize(10)
           .fillColor('#666666')
           .text('CONFIDENTIAL REPORT - FOR CUSTOMER USE ONLY', { align: 'center' })
           .text(`Report ID: ${reportData.paymentDetails.transactionId}`, { align: 'center' })
           .text(`Valid until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, { align: 'center' })
           .text('© Digital Worthy Reports', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          const publicUrl = `${BACKEND_URL || 'http://localhost:5000'}/reports/${filename}`;
          resolve(publicUrl);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getReportById(reportId: string): Promise<IReport | null> {
    try {
      const report = await Report.findById(reportId).populate('paymentId');
      if (report) {
        report.downloadCount += 1;
        report.lastAccessed = new Date();
        await report.save();
      }
      return report;
    } catch (error) {
      logger.error('Error getting report:', error);
      throw error;
    }
  }

  async validateReportAccess(reportId: string): Promise<boolean> {
    try {
      const report = await Report.findById(reportId);
      if (!report) return false;
      
      return report.expiresAt > new Date();
    } catch (error) {
      logger.error('Error validating report access:', error);
      return false;
    }
  }
}

export default new ReportService();