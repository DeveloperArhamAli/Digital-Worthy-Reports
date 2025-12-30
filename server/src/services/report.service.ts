import { IPayment, ReportType, PaymentStatus } from '../models/Payment.model';
import { Report, IReport } from '../models/Report.model';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

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
  async generateReportPreview(vin: string): Promise<any> {
    try {
      // Decode VIN
      const vehicleInfo = await this.decodeVIN(vin);
      
      // Get basic info from NHTSA API
      const nhtsaData = await this.fetchNHTSAData(vin);
      
      const preview = {
        vin,
        year: vehicleInfo.year || nhtsaData.Year,
        make: vehicleInfo.make || nhtsaData.Make,
        model: vehicleInfo.model || nhtsaData.Model,
        vehicleType: nhtsaData.VehicleType,
        manufacturer: nhtsaData.Manufacturer,
        country: nhtsaData.PlantCountry,
      };

      return preview;
    } catch (error) {
      logger.error('Error generating report preview:', error);
      throw error;
    }
  }

  async generateFullReport(payment: IPayment): Promise<IReport> {
    try {
      // Decode VIN
      const vehicleInfo = await this.decodeVIN(payment.vin);
      
      // Fetch additional data based on report type
      const reportData = await this.fetchReportData(payment.vin, payment.reportType);
      
      // Generate verdict for Silver and Gold reports
      let verdict;
      if (payment.reportType !== ReportType.Basic) {
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
      });

      logger.info(`Full report generated for payment: ${payment.transactionId}`);
      return report;
    } catch (error) {
      logger.error('Error generating full report:', error);
      throw error;
    }
  }

  private async decodeVIN(vin: string): Promise<VehicleInfo> {
    try {
      // Use NHTSA API for VIN decoding
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

  private async fetchNHTSAData(vin: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
      );
      return response.data.Results[0] || {};
    } catch (error) {
      logger.warn(`Failed to fetch NHTSA data for VIN ${vin}:`, error);
      return {};
    }
  }

  private async fetchReportData(vin: string, reportType: ReportType): Promise<Partial<IReport>> {
    // Mock data - in production, integrate with Carfax, AutoCheck, etc.
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
      service: {
        records: [
          {
            date: new Date('2020-06-15'),
            type: 'Oil Change',
            location: 'Honda Dealership',
            details: 'Synthetic oil change, tire rotation',
          },
          {
            date: new Date('2021-06-15'),
            type: 'Brake Service',
            location: 'AutoCare Center',
            details: 'Brake pad replacement, fluid flush',
          },
        ],
        lastService: new Date('2023-06-15'),
        nextService: new Date('2024-06-15'),
      },
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

    // Deduct points for accidents
    if (data.accidents && data.accidents.length > 0) {
      score -= data.accidents.length * 10;
      reasons.push(`${data.accidents.length} accident${data.accidents.length > 1 ? 's' : ''} reported`);
    }

    // Deduct points for incomplete recalls
    if (data.recalls && data.recalls.some(r => r.status !== 'Completed')) {
      score -= 15;
      reasons.push('Open recalls pending');
    }

    // Deduct points for salvage title
    if (data.title?.status === 'Salvage') {
      score -= 40;
      reasons.push('Salvage title');
    }

    // Add points for good service history
    if (data.service?.records && data.service.records.length >= 3) {
      score += 10;
      reasons.push('Good service history');
    }

    // Determine recommendation
    let recommendation: 'BUY' | 'AVOID' | 'CAUTION';
    if (score >= 80) {
      recommendation = 'BUY';
    } else if (score >= 60) {
      recommendation = 'CAUTION';
    } else {
      recommendation = 'AVOID';
    }

    return {
      score,
      recommendation,
      reasons,
    };
  }

  private async generatePDF(reportData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filename = `report-${uuidv4()}.pdf`;
        const filePath = path.join(__dirname, '../../public/reports', filename);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);

        // Header
        doc.fontSize(24).text('VEHICLE HISTORY REPORT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text(`VIN: ${reportData.vehicle.vin}`, { align: 'center' });
        doc.moveDown(2);

        // Vehicle Information
        doc.fontSize(16).text('VEHICLE INFORMATION', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Year: ${reportData.vehicle.year}`);
        doc.text(`Make: ${reportData.vehicle.make}`);
        doc.text(`Model: ${reportData.vehicle.model}`);
        doc.text(`Trim: ${reportData.vehicle.trim || 'N/A'}`);
        doc.text(`Body Style: ${reportData.vehicle.bodyStyle || 'N/A'}`);
        doc.text(`Engine: ${reportData.vehicle.engine || 'N/A'}`);
        doc.moveDown();

        // Title Information
        doc.fontSize(16).text('TITLE INFORMATION', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Status: ${reportData.title.status}`);
        doc.text(`State: ${reportData.title.state}`);
        if (reportData.title.issueDate) {
          doc.text(`Issue Date: ${new Date(reportData.title.issueDate).toLocaleDateString()}`);
        }
        doc.moveDown();

        // Accident History
        if (reportData.accidents && reportData.accidents.length > 0) {
          doc.fontSize(16).text('ACCIDENT HISTORY', { underline: true });
          doc.moveDown();
          reportData.accidents.forEach((accident: any, index: number) => {
            doc.fontSize(12).text(`Accident ${index + 1}:`);
            doc.text(`  Date: ${new Date(accident.date).toLocaleDateString()}`);
            doc.text(`  Severity: ${accident.severity}`);
            doc.text(`  Description: ${accident.description}`);
            doc.moveDown(0.5);
          });
          doc.moveDown();
        }

        // Service Records
        if (reportData.service?.records && reportData.service.records.length > 0) {
          doc.fontSize(16).text('SERVICE HISTORY', { underline: true });
          doc.moveDown();
          reportData.service.records.forEach((service: any, index: number) => {
            doc.fontSize(12).text(`Service ${index + 1}:`);
            doc.text(`  Date: ${new Date(service.date).toLocaleDateString()}`);
            doc.text(`  Type: ${service.type}`);
            doc.text(`  Location: ${service.location}`);
            doc.moveDown(0.5);
          });
          doc.moveDown();
        }

        // Market Value (for Silver/Gold reports)
        if (reportData.market) {
          doc.fontSize(16).text('MARKET ANALYSIS', { underline: true });
          doc.moveDown();
          doc.fontSize(12).text(`Estimated Value: $${reportData.market.value.toLocaleString()}`);
          doc.text(`Value Range: $${reportData.market.range.low.toLocaleString()} - $${reportData.market.range.high.toLocaleString()}`);
          doc.moveDown();
        }

        // Verdict (for Silver/Gold reports)
        if (reportData.verdict) {
          doc.fontSize(16).text('FINAL VERDICT', { underline: true });
          doc.moveDown();
          doc.fontSize(14).text(`Score: ${reportData.verdict.score}/100`);
          doc.text(`Recommendation: ${reportData.verdict.recommendation}`);
          doc.moveDown();
          doc.fontSize(12).text('Key Factors:');
          reportData.verdict.reasons.forEach((reason: string) => {
            doc.text(`  • ${reason}`);
          });
          doc.moveDown();
        }

        // Footer
        doc.fontSize(10)
          .text('Generated by DigitalWorthyReports.com', { align: 'center' })
          .text(`Report ID: ${reportData.paymentDetails.transactionId}`, { align: 'center' })
          .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          const publicUrl = `${process.env.API_URL}/reports/${filename}`;
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
        // Increment download count
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

  async getReportByPaymentId(paymentId: string): Promise<IReport | null> {
    try {
      return await Report.findOne({ paymentId }).populate('paymentId');
    } catch (error) {
      logger.error('Error getting report by payment ID:', error);
      throw error;
    }
  }

  async validateReportAccess(reportId: string): Promise<boolean> {
    try {
      const report = await Report.findById(reportId);
      if (!report) return false;
      
      // Check if report has expired
      if (report.expiresAt < new Date()) {
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error validating report access:', error);
      return false;
    }
  }
}

export default new ReportService();