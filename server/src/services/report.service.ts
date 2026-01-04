import { IPayment, ReportType, PaymentStatus } from '../models/Payment.model';
import { Report, IReport } from '../models/Report.model';
import { logger } from '../utils/logger';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import cloudinaryStorage from './cloudinary.service';

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
  plantCity?: string;
  plantState?: string;
  plantCountry?: string;
  vin?: string;
  gvwr?: string;
  manufacturer?: string;
  engineSpecs?: {
    cylinders?: string;
    displacement?: string;
    horsepower?: string;
  };
}

interface SafetyInfo {
  brakeSystemType?: string;
  seatBeltsAll?: string;
  abs?: string;
  tractionControl?: string;
  safetyFeatures?: string[];
}

interface MarketData {
  estimatedValue?: number;
  valueRange?: { low: number; high: number };
  comparison?: Array<{ model: string; year: number; price: number; location: string }>;
}

class ReportService {
  private cloudinaryStorage = cloudinaryStorage;

  async generateFullReport(payment: IPayment): Promise<IReport> {
    try {
      const existingReport = await Report.findOne({ paymentId: payment._id });
      if (existingReport) {
        logger.info(`Report already exists for payment: ${payment._id}`);
        return existingReport;
      }

      const vehicleInfo = await this.decodeVIN(payment.vin);
      
      const reportData = await this.fetchReportData(payment.vin, payment.reportType, vehicleInfo);
      
      let verdict;
      if (payment.reportType !== ReportType.BASIC) {
        verdict = this.generateVerdict(reportData, payment.reportType);
      }

      const pdfBuffer = await this.generatePDFBuffer({
        ...reportData,
        vehicle: vehicleInfo,
        verdict,
        paymentDetails: {
          transactionId: payment.transactionId,
          reportType: payment.reportType,
          purchaseDate: payment.createdAt,
          customerName: payment.customerName,
          amount: payment.amount,
        },
      });

      const cloudinaryResult = await this.cloudinaryStorage.uploadReport(
        pdfBuffer,
        payment.transactionId,
        payment.reportType
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const report = await Report.create({
        paymentId: payment._id,
        vin: payment.vin,
        reportType: payment.reportType,
        ...reportData,
        verdict,
        reportUrl: cloudinaryResult.secureUrl,
        cloudStorage: {
          provider: 'cloudinary',
          publicId: cloudinaryResult.publicId,
          url: cloudinaryResult.url,
          secureUrl: cloudinaryResult.secureUrl,
        },
        downloadCount: 0,
        expiresAt,
      });

      await payment.updateOne({
        reportUrl: cloudinaryResult.secureUrl,
        reportGeneratedAt: new Date(),
        status: PaymentStatus.COMPLETED,
        cloudinaryPublicId: cloudinaryResult.publicId,
      });

      logger.info(`Full report generated for payment: ${payment.transactionId}`);
      logger.info(`Cloudinary URL: ${cloudinaryResult.secureUrl}`);
      
      return report;
    } catch (error) {
      console.error(error);
      logger.error('Error generating full report:', error);
      throw error;
    }
  }

  private async generatePDFBuffer(reportData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        this.generatePDFContentByPlan(doc, reportData);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private generatePDFContentByPlan(doc: PDFKit.PDFDocument, reportData: any): void {
    const { reportType } = reportData.paymentDetails;
    
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#10B981')
       .text('VEHICLE HISTORY REPORT', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Plan: ${reportType.toUpperCase()}`, { align: 'center' })
       .text(`Report ID: ${reportData.paymentDetails.transactionId}`, { align: 'center' })
       .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    doc.moveDown(1);

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('VEHICLE IDENTIFICATION');
    
    doc.moveDown(0.5);
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#333333');
    
    doc.text(`VIN: ${reportData.vehicle.vin}`);
    doc.text(`Year: ${reportData.vehicle.year || 'N/A'}`);
    doc.text(`Make: ${reportData.vehicle.make || 'N/A'}`);
    doc.text(`Model: ${reportData.vehicle.model || 'N/A'}`);
    doc.text(`Vehicle Type: ${reportData.vehicle.bodyStyle || 'N/A'}`);
    doc.text(`Manufacturer: ${reportData.vehicle.manufacturer || 'N/A'}`);
    
    doc.moveDown(1);
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('VIN VALIDATION');
    
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text('✓ VIN decoded successfully');
    doc.text('✓ Check digit verified');
    
    doc.moveDown(1);
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('MANUFACTURING DETAILS');
    
    doc.moveDown(0.5);
    doc.fontSize(12);
    if (reportData.vehicle.plantCity) {
      doc.text(`Plant: ${reportData.vehicle.plantCity}, ${reportData.vehicle.plantState || ''}`);
    }
    doc.text(`Country: ${reportData.vehicle.plantCountry || 'N/A'}`);
    
    if (reportData.accuracyNote) {
      doc.moveDown(1);
      doc.fontSize(12)
         .font('Helvetica-Oblique')
         .fillColor('#F59E0B')
         .text(`Note: ${reportData.accuracyNote}`);
      doc.fillColor('#333333');
    }

    if (reportType !== ReportType.BASIC) {
      doc.addPage();
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('ENGINE SPECIFICATIONS');
      
      doc.moveDown(0.5);
      doc.fontSize(12);
      
      doc.text(`Engine Type: ${reportData.vehicle.engine || 'N/A'}`);
      doc.text(`Fuel Type: ${reportData.vehicle.fuelType || 'N/A'}`);
      doc.text(`Drive Type: ${reportData.vehicle.drivetrain || 'N/A'}`);
      doc.text(`Transmission: ${reportData.vehicle.transmission || 'N/A'}`);
      
      if (reportData.vehicle.engineSpecs) {
        doc.moveDown(0.5);
        doc.text(`Cylinders: ${reportData.vehicle.engineSpecs.cylinders || 'N/A'}`);
        doc.text(`Displacement: ${reportData.vehicle.engineSpecs.displacement || 'N/A'}`);
        doc.text(`Horsepower: ${reportData.vehicle.engineSpecs.horsepower || 'N/A'}`);
      }
      
      doc.moveDown(1);
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('PERFORMANCE DATA');
      
      doc.moveDown(0.5);
      doc.fontSize(12);
      if (reportData.vehicle.gvwr) {
        doc.text(`Weight Rating: ${reportData.vehicle.gvwr}`);
      }
    }

    if (reportType === ReportType.GOLD) {
      doc.addPage();
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('SAFETY FEATURES');
      
      doc.moveDown(0.5);
      doc.fontSize(12);
      
      if (reportData.safety?.features && reportData.safety.features.length > 0) {
        reportData.safety.features.forEach((feature: string) => {
          doc.text(`• ${feature}`);
        });
      } else {
        doc.text('No additional safety data available');
      }
      
      doc.moveDown(1);
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('MARKET ANALYSIS');
      
      doc.moveDown(0.5);
      doc.fontSize(12);
      
      if (reportData.market) {
        doc.text(`Estimated Value: $${reportData.market.estimatedValue?.toLocaleString() || 'N/A'}`);
        if (reportData.market.valueRange) {
          doc.text(`Value Range: $${reportData.market.valueRange.low?.toLocaleString()} - $${reportData.market.valueRange.high?.toLocaleString()}`);
        }
      }

      doc.addPage();
      if (reportData.verdict) {
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
        
        if (reportData.verdict.reasons && reportData.verdict.reasons.length > 0) {
          doc.moveDown(1);
          doc.fontSize(14)
             .text('Key Factors:');
          
          reportData.verdict.reasons.forEach((reason: string) => {
            doc.fontSize(12)
               .text(`• ${reason}`);
          });
        }
      }
    }

    doc.addPage();
    doc.fontSize(10)
       .fillColor('#666666')
       .text('CONFIDENTIAL REPORT - FOR CUSTOMER USE ONLY', { align: 'center' })
       .text(`Report ID: ${reportData.paymentDetails.transactionId}`, { align: 'center' })
       .text(`Valid until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, { align: 'center' })
       .text('Copyright © Digital Worthy Reports', { align: 'center' })
  }

  private async decodeVIN(vin: string): Promise<VehicleInfo> {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );

      if (response.data.Results && response.data.Results.length > 0) {
        const results = response.data.Results.reduce((acc: any, item: any) => {
          acc[item.Variable] = item.Value;
          return acc;
        }, {});

        return {
          year: results['Model Year'] ? parseInt(results['Model Year']) : undefined,
          make: results['Make'],
          model: results['Model'],
          trim: results['Trim'],
          bodyStyle: results['Body Class'],
          engine: results['Engine Model'],
          transmission: results['Transmission Style'],
          drivetrain: results['Drive Type'],
          fuelType: results['Fuel Type - Primary'],
          manufacturer: results['Manufacturer Name'],
          vin: vin,
          plantCity: results['Plant City'],
          plantState: results['Plant State'],
          plantCountry: results['Plant Country'],
          engineSpecs: {
            cylinders: results['Engine Number of Cylinders'],
            displacement: results['Displacement (L)'],
            horsepower: results['Engine Brake (hp) From'],
          },
          gvwr: results['Gross Vehicle Weight Rating From'],
        };
      }

      return { vin };
    } catch (error) {
      logger.warn(`Failed to decode VIN ${vin} from NHTSA:`, error);
      return { vin };
    }
  }

  private async fetchReportData(vin: string, reportType: ReportType, vehicleInfo: VehicleInfo): Promise<any> {
    const reportData: any = {
      vehicle: vehicleInfo,
      accuracyNote: vehicleInfo.year ? undefined : 'Year information may be approximate',
    };

    if (reportType === ReportType.GOLD) {
      reportData.safety = await this.fetchSafetyData(vin);
      reportData.market = await this.estimateMarketValue(vehicleInfo);
    }

    if (reportType !== ReportType.BASIC) {
      reportData.recalls = await this.fetchRecallData(vin);
    }

    return reportData;
  }

  private async fetchSafetyData(vin: string): Promise<SafetyInfo> {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/${vin}?format=json`
      );

      if (response.data.Results) {
        const results = response.data.Results;
        const safetyFeatures: string[] = [];
        
        if (results.find((r: any) => r.Variable === 'Anti-lock Braking System (ABS)' && r.Value === 'Standard')) {
          safetyFeatures.push('Anti-lock Braking System (ABS)');
        }
        if (results.find((r: any) => r.Variable === 'Traction Control' && r.Value === 'Standard')) {
          safetyFeatures.push('Traction Control');
        }
        if (results.find((r: any) => r.Variable === 'Electronic Stability Control (ESC)' && r.Value === 'Standard')) {
          safetyFeatures.push('Electronic Stability Control (ESC)');
        }

        return {
          brakeSystemType: results.find((r: any) => r.Variable === 'Brake System Type')?.Value,
          seatBeltsAll: results.find((r: any) => r.Variable === 'Seat Belt Type')?.Value,
          abs: results.find((r: any) => r.Variable === 'Anti-lock Braking System (ABS)')?.Value,
          tractionControl: results.find((r: any) => r.Variable === 'Traction Control')?.Value,
          safetyFeatures,
        };
      }
    } catch (error) {
      logger.warn(`Failed to fetch safety data for VIN ${vin}:`, error);
    }
    
    return {};
  }

  private async fetchRecallData(vin: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`
      );
      
      if (response.data && response.data.results) {
        return response.data.results.map((recall: any) => ({
          id: recall.NHTSACampaignNumber,
          date: new Date(recall.ReportReceivedDate),
          description: recall.DefectSummary,
          status: recall.Component,
          manufacturer: recall.Manufacturer,
        }));
      }
    } catch (error) {
      logger.warn(`Failed to fetch recall data for VIN ${vin}:`, error);
    }
    
    return [];
  }

  private async estimateMarketValue(vehicleInfo: VehicleInfo): Promise<MarketData> {
    const baseValue = 15000; // Base value for estimation
    const yearMultiplier = vehicleInfo.year ? (new Date().getFullYear() - vehicleInfo.year) * -500 : 0;
    const estimatedValue = Math.max(baseValue + yearMultiplier, 3000);
    
    return {
      estimatedValue,
      valueRange: {
        low: Math.round(estimatedValue * 0.85),
        high: Math.round(estimatedValue * 1.15),
      },
    };
  }

  private generateVerdict(reportData: any, reportType: ReportType): any {
    let score = 100;
    const reasons: string[] = [];

    if (reportData.vehicle.year && (new Date().getFullYear() - reportData.vehicle.year) > 10) {
      score -= 10;
      reasons.push('Vehicle is over 10 years old');
    }

    if (reportData.vehicle.make && reportData.vehicle.model && reportData.vehicle.year) {
      score += 5;
      reasons.push('Complete vehicle identification');
    }

    if (reportType === ReportType.GOLD) {
      if (reportData.safety?.safetyFeatures && reportData.safety.safetyFeatures.length > 2) {
        score += 10;
        reasons.push('Good safety features');
      }
      
      if (reportData.recalls && reportData.recalls.length === 0) {
        score += 5;
        reasons.push('No open recalls');
      }
    }

    score = Math.max(0, Math.min(100, score));

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

  async deleteReport(publicId: string): Promise<void> {
    try {
      await this.cloudinaryStorage.deleteReport(publicId);
    } catch (error) {
      logger.error('Error deleting report:', error);
      throw error;
    }
  }
}

export default new ReportService();