import { IPayment, ReportType, PaymentStatus } from '../models/Payment.model';
import { Report, IReport } from '../models/Report.model';
import { logger } from '../utils/logger';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import cloudinaryStorage from './cloudinary.service';
import { resolve } from 'path';

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

type NhtsaDecodeRow = {
  Variable?: string;
  Value?: string;
  ValueId?: string;
  VariableId?: number | string;
  GroupName?: string; // present in decodevinextended
};

type DecodeVinResult = {
  vehicle: VehicleInfo;
  decodedResults: NhtsaDecodeRow[];
};

type DecodedRow = {
  group: string;
  element: string;
  value: string;
};

class ReportService {
  private cloudinaryStorage = cloudinaryStorage;

  private readonly brand = {
    purple: '#6D28D9',
    red: '#EF4444',
    blue: '#2563EB',
    green: '#10B981',
    text: '#111827',
    muted: '#6B7280',
    line: '#E5E7EB',
    soft: '#F9FAFB',
  };

  /**
   * Put these assets in: src/assets/report/
   * - logo.png
   * - circuit.png (optional)
   * - car-placeholder.png (optional)
   * - icons (optional): sales.png, mileage.png, recall.png, owners.png, photos.png, auction.png
   */
  private assetPath(...parts: string[]) {
    return resolve(process.cwd(), 'src', 'assets', 'report', ...parts);
  }

  // -----------------------------
  // Public API
  // -----------------------------

  async generateReportPreview(vin: string): Promise<VehicleInfo> {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );

      if (response.data.Results && response.data.Results.length > 0) {
        const results = response.data.Results.reduce((acc: any, item: any) => {
          acc[item.Variable] = item.Value;
          return acc;
        }, {})

        return {
          year: results['Model Year'] ? parseInt(results['Model Year']) : undefined,
          make: results['Make'],
          model: results['Model'],
          bodyStyle: results['Body Class'],
          manufacturer: results['Manufacturer Name'],
          vin: vin,
          plantCountry: results['Plant Country'],
        };
      }

      return { vin };
    } catch (error) {
      logger.warn(`Failed to decode VIN ${vin} from NHTSA:`, error);
      return { vin };
    }
  }

  async generateFullReport(payment: IPayment): Promise<IReport> {
    try {
      const existingReport = await Report.findOne({ paymentId: payment._id });
      if (existingReport) {
        logger.info(`Report already exists for payment: ${payment._id}`);
        return existingReport;
      }

      // ✅ NEW: get BOTH structured vehicle info + full raw decode rows
      const { vehicle: vehicleInfo, decodedResults } = await this.decodeVINWithRaw(payment.vin);

      // ✅ include decodedResults so the PDF table can render 1:1
      const reportData = await this.fetchReportData(
        payment.vin,
        payment.reportType,
        vehicleInfo,
        decodedResults
      );

      let verdict;
      if (payment.reportType !== ReportType.BASIC) {
        verdict = this.generateVerdict(reportData, payment.reportType);
      }

      const pdfBuffer = await this.generatePDFBuffer({
        ...reportData,
        vehicle: vehicleInfo,
        decodedResults, // ✅ pass through
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
        decodedResults, // ✅ store raw decode rows (optional but useful)
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

  // -----------------------------
  // PDF Generation (Template Style)
  // -----------------------------

  private async generatePDFBuffer(reportData: any): Promise<Buffer> {
    return new Promise((resolvePromise, reject) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolvePromise(Buffer.concat(chunks)));
        doc.on('error', reject);

        this.generatePDFContentTemplate(doc, reportData);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private generatePDFContentTemplate(doc: PDFKit.PDFDocument, reportData: any): void {
    const vin: string = reportData?.vehicle?.vin || 'N/A';
    const generatedAt = new Date();

    // ✅ NEW: if decodedResults exist, render them directly in table format (1:1)
    const reportRows: DecodedRow[] = this.buildDecodedTableRows(reportData);

    const rowsPerPage = 30;
    const tablePages = Math.max(1, Math.ceil(reportRows.length / rowsPerPage));
    const pageCount = 1 + 1 + tablePages + 1;

    let pageNo = 1;

    // Cover
    this.drawCoverPage(doc, reportData, vin, generatedAt);
    this.drawPageHeader(doc, vin, generatedAt);
    this.drawPageFooter(doc, pageNo, pageCount);

    // Other Information
    doc.addPage();
    pageNo += 1;
    this.drawPageHeader(doc, vin, generatedAt);
    this.drawOtherInformationPage(doc, reportData);
    this.drawPageFooter(doc, pageNo, pageCount);

    // Table pages
    for (let p = 0; p < tablePages; p++) {
      doc.addPage();
      pageNo += 1;

      this.drawPageHeader(doc, vin, generatedAt);
      const start = p * rowsPerPage;
      const end = start + rowsPerPage;

      this.drawDecodedTablePage(doc, reportRows.slice(start, end));
      this.drawPageFooter(doc, pageNo, pageCount);
    }

    // Contact page
    doc.addPage();
    pageNo += 1;
    this.drawPageHeader(doc, vin, generatedAt);
    this.drawContactPage(doc);
    this.drawPageFooter(doc, pageNo, pageCount);
  }

  private drawCoverPage(doc: PDFKit.PDFDocument, reportData: any, vin: string, generatedAt: Date) {
    doc.rect(0, 0, doc.page.width, 120).fill(this.brand.purple);

    const logoFile = this.assetPath('logo.png');
    try {
      doc.image(logoFile, 55, 28, { width: 70, height: 70 });
    } catch {}

    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#FFFFFF')
      .text('DIGITAL WORTHY', 140, 34, { align: 'left' });

    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#FFFFFF')
      .text('REPORT', 140, 64, { align: 'left' });

    const circuitFile = this.assetPath('circuit.png');
    try {
      doc.image(circuitFile, 360, 12, { width: 230 });
    } catch {}

    const contentTop = 135;

    const vinValue = vin || '—';
    const yearValue = reportData?.vehicle?.year ? String(reportData.vehicle.year) : 'N/A';

    this.drawInputField(doc, 'VIN:', vinValue, 55, contentTop, 190, 24);
    this.drawInputField(doc, 'Model Year:', yearValue, 55, contentTop + 55, 190, 24);

    const carImageFile = this.assetPath('car-placeholder.png');
    const midX = 270;
    const midY = contentTop + 2;
    try {
      doc.roundedRect(midX, midY, 160, 125, 8).strokeColor(this.brand.line).lineWidth(1).stroke();
      doc.image(carImageFile, midX + 8, midY + 8, { width: 144, height: 109 });
    } catch {
      doc.roundedRect(midX, midY, 160, 125, 8).strokeColor(this.brand.line).lineWidth(1).stroke();
      doc.font('Helvetica').fontSize(9).fillColor(this.brand.muted).text('Vehicle photo', midX, midY + 55, {
        width: 160,
        align: 'center',
      });
    }

    const rightX = 445;
    const rightY = contentTop + 10;
    const v = reportData?.vehicle || {};

    doc.font('Helvetica-Bold').fontSize(12).fillColor(this.brand.text);
    doc.text(`${v.year || 'N/A'} ${v.make || ''} ${v.model || ''}`.trim(), rightX, rightY, { width: 145 });

    doc.font('Helvetica').fontSize(10).fillColor(this.brand.text);
    doc.text(`VIN: ${vinValue}`, rightX, rightY + 20, { width: 145 });

    doc.fillColor(this.brand.muted);
    doc.text(`Country: ${v.plantCountry || 'N/A'}`, rightX, rightY + 40, { width: 145 });
    doc.text(`Engine: ${v.engine || 'N/A'}`, rightX, rightY + 56, { width: 145 });

    doc.fillColor(this.brand.text);
    doc.text(`Last mileage: ${reportData?.lastMileage || 'N/A'}`, rightX, rightY + 78, { width: 145 });
    doc.text(`Last price: ${reportData?.lastPrice || 'N/A'}`, rightX, rightY + 94, { width: 145 });

    const tilesTop = contentTop + 150;
    const tileW = 250;
    const tileH = 58;
    const gap = 12;

    const tileLeftX = 55;
    const tileRightX = 55 + tileW + gap;

    const hasRecalls = Array.isArray(reportData?.recalls) ? reportData.recalls.length : 0;
    const recallsText = hasRecalls > 0 ? `${hasRecalls} recalls found` : 'No recall data';

    const estimatedValue = reportData?.market?.estimatedValue;
    const marketText = typeof estimatedValue === 'number' ? `$${estimatedValue.toLocaleString()}` : 'N/A';

    const icons = {
      sales: this.assetPath('icons', 'sales.png'),
      mileage: this.assetPath('icons', 'mileage.png'),
      recall: this.assetPath('icons', 'recall.png'),
      owners: this.assetPath('icons', 'owners.png'),
      photos: this.assetPath('icons', 'photos.png'),
      auction: this.assetPath('icons', 'auction.png'),
    };

    this.drawStatTile(doc, tileLeftX, tilesTop, tileW, tileH, 'Sales', marketText, icons.sales);
    this.drawStatTile(doc, tileRightX, tilesTop, tileW, tileH, 'Last mileage', reportData?.lastMileage || 'N/A', icons.mileage);

    this.drawStatTile(doc, tileLeftX, tilesTop + tileH + gap, tileW, tileH, 'Safety Recalls', recallsText, icons.recall);
    this.drawStatTile(doc, tileRightX, tilesTop + tileH + gap, tileW, tileH, 'Owners', reportData?.ownersCount || 'N/A', icons.owners);

    this.drawStatTile(doc, tileLeftX, tilesTop + (tileH + gap) * 2, tileW, tileH, 'Photos', reportData?.photosCount || 'N/A', icons.photos);
    this.drawStatTile(doc, tileRightX, tilesTop + (tileH + gap) * 2, tileW, tileH, 'Auction sales', reportData?.auctionSalesCount || 'N/A', icons.auction);

    doc.font('Helvetica').fontSize(9).fillColor(this.brand.muted).text(`Generated: ${generatedAt.toLocaleString()}`, 55, 760, {
      align: 'left',
    });
  }

  private drawOtherInformationPage(doc: PDFKit.PDFDocument, reportData: any) {
    doc.font('Helvetica-Bold').fontSize(16).fillColor(this.brand.text).text('Other Information', 55, 70);

    const cardX = 55;
    const cardY = 105;
    const cardW = 490;
    const cardH = 360;

    this.drawCard(doc, cardX, cardY, cardW, cardH, 'Other Information');

    const v = reportData?.vehicle || {};
    let y = cardY + 50;

    const kv = (label: string, value: any) => {
      doc.font('Helvetica-Bold').fontSize(10).fillColor(this.brand.text).text(label, cardX + 16, y);
      doc.font('Helvetica').fontSize(10).fillColor(this.brand.text).text(value ? String(value) : 'N/A', cardX + 160, y, {
        width: 310,
      });
      y += 18;
    };

    kv('Plant City:', v.plantCity);
    kv('Plant Company Name:', v.manufacturer);
    kv('Plant State:', v.plantState);
    kv('Plant Country:', v.plantCountry);

    y += 6;

    doc.font('Helvetica-Bold').fontSize(11).fillColor(this.brand.text).text('Airbags:', cardX + 16, y);
    y += 18;

    // NOTE: If you want real airbags data, you’ll need to map those Variables from decodedResults.
    const airbags: string[] = [];
    airbags.push('Front airbags: N/A');
    airbags.push('Side airbags: N/A');
    airbags.push('Curtain airbags: N/A');

    doc.font('Helvetica').fontSize(10).fillColor(this.brand.text);
    for (const a of airbags) {
      doc.text(`• ${a}`, cardX + 22, y, { width: 450 });
      y += 16;
    }

    if (reportData?.accuracyNote) {
      y += 10;
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#F59E0B').text(`Note: ${reportData.accuracyNote}`, cardX + 16, y, {
        width: 460,
      });
    }
  }

  private drawDecodedTablePage(doc: PDFKit.PDFDocument, rows: DecodedRow[]) {
    doc.font('Helvetica-Bold').fontSize(14).fillColor(this.brand.text).text('Decoded Information', 55, 70);

    const x = 55;
    const yTop = 105;
    const w = 490;
    const rowH = 20;

    const col1 = 160;
    const col2 = 200;
    const col3 = w - col1 - col2;

    doc.rect(x, yTop, w, rowH).fill(this.brand.soft);

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(this.brand.text)
      .text('Group Name', x + 8, yTop + 5, { width: col1 - 16 })
      .text('Element', x + col1 + 8, yTop + 5, { width: col2 - 16 })
      .text('Value', x + col1 + col2 + 8, yTop + 5, { width: col3 - 16 });

    doc.rect(x, yTop, w, rowH).lineWidth(1).strokeColor(this.brand.line).stroke();

    let y = yTop + rowH;
    doc.font('Helvetica').fontSize(9).fillColor(this.brand.text);

    for (const r of rows) {
      doc.rect(x, y, w, rowH).lineWidth(1).strokeColor(this.brand.line).stroke();

      doc.moveTo(x + col1, y).lineTo(x + col1, y + rowH).strokeColor(this.brand.line).stroke();
      doc.moveTo(x + col1 + col2, y).lineTo(x + col1 + col2, y + rowH).strokeColor(this.brand.line).stroke();

      doc
        .fillColor(this.brand.text)
        .text(r.group || '', x + 8, y + 5, { width: col1 - 16, ellipsis: true })
        .text(r.element || '', x + col1 + 8, y + 5, { width: col2 - 16, ellipsis: true })
        .text(r.value || '', x + col1 + col2 + 8, y + 5, { width: col3 - 16, ellipsis: true });

      y += rowH;
    }
  }

  private drawContactPage(doc: PDFKit.PDFDocument) {
    doc.font('Helvetica-Bold').fontSize(18).fillColor(this.brand.text).text('More Information', 55, 90);

    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor(this.brand.text)
      .text('For more details about this report or additional services, please contact us.', 55, 130, {
        width: 490,
      });

    const x = 55;
    const y = 180;
    const w = 490;
    const h = 220;

    doc.roundedRect(x, y, w, h, 10).lineWidth(1).strokeColor(this.brand.line).stroke();

    doc.font('Helvetica-Bold').fontSize(14).fillColor(this.brand.purple).text('CONTACT US', x + 20, y + 18);

    const line = (label: string, value: string, yy: number) => {
      doc.font('Helvetica-Bold').fontSize(11).fillColor(this.brand.text).text(label, x + 20, yy);
      doc.font('Helvetica').fontSize(11).fillColor(this.brand.text).text(value, x + 140, yy, { width: 320 });
    };

    line('Website:', 'www.digitalworthyreports.com', y + 60);
    line('Email:', 'support@digitalworthyreports.com', y + 85);
    line('Phone:', '+1 (000) 000-0000', y + 110);
    line('Hours:', 'Mon–Fri, 9:00 AM – 5:00 PM', y + 135);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(this.brand.muted)
      .text('CONFIDENTIAL REPORT - FOR CUSTOMER USE ONLY', 55, 760, { width: 490, align: 'center' });
  }

  // Header / Footer
  private formatHeaderDate(d: Date) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}, ${hh}:${min}`;
  }

  private drawPageHeader(doc: PDFKit.PDFDocument, vin: string, generatedAt = new Date()) {
    const y = 22;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(this.brand.muted)
      .text(this.formatHeaderDate(generatedAt), 50, y, { align: 'left' })
      .text(`Results for: ${vin}`, 50, y, { align: 'right' });

    doc.moveTo(50, 45).lineTo(545, 45).lineWidth(0.7).strokeColor(this.brand.line).stroke();
  }

  private drawPageFooter(doc: PDFKit.PDFDocument, pageNo: number, pageCount: number) {
    const y = 805;
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(this.brand.muted)
      .text('www.digitalworthyreports.com', 50, y, { align: 'left' })
      .text(`${pageNo}/${pageCount}`, 50, y, { align: 'right' });
  }

  private drawInputField(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, w: number, h = 24) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(this.brand.text).text(label, x, y);

    const boxY = y + 14;

    doc.roundedRect(x + 72, boxY, w, h, 3).lineWidth(1).strokeColor('#D1D5DB').stroke();

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#4B5563')
      .text(value || '—', x + 80, boxY + 7, { width: w - 10, ellipsis: true });
  }

  private drawStatTile(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, title: string, value: string, iconFile?: string) {
    doc.rect(x, y, w, h).lineWidth(1).strokeColor(this.brand.line).stroke();

    if (iconFile) {
      try {
        doc.image(iconFile, x + 12, y + 18, { width: 18, height: 18 });
      } catch {}
    }

    const textX = iconFile ? x + 38 : x + 12;

    doc.font('Helvetica-Bold').fontSize(11).fillColor(this.brand.text).text(title, textX, y + 14);

    doc.font('Helvetica').fontSize(11).fillColor(this.brand.blue).text(value, textX, y + 32);
  }

  private drawCard(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, title: string) {
    doc.roundedRect(x, y, w, h, 6).lineWidth(1).strokeColor('#D1D5DB').stroke();

    doc.font('Helvetica-Bold').fontSize(12).fillColor(this.brand.text).text(title, x + 14, y + 12);

    doc.moveTo(x + 14, y + 34).lineTo(x + w - 14, y + 34).lineWidth(1).strokeColor(this.brand.line).stroke();
  }

  /**
   * ✅ 1:1 TABLE SOURCE
   * If `decodedResults` exists, this produces Group Name / Element / Value rows directly.
   * This is what you asked: "include raw response.data.Results as-is".
   */
  private buildDecodedTableRows(reportData: any): DecodedRow[] {
    const decodedResults: NhtsaDecodeRow[] = Array.isArray(reportData?.decodedResults) ? reportData.decodedResults : [];

    // ✅ Preferred: Use raw decodedResults (1:1)
    if (decodedResults.length > 0) {
      return decodedResults
        .filter((r) => r && r.Variable) // keep only valid rows
        .map((r) => ({
          group: (r.GroupName || '').trim(),
          element: String(r.Variable || '').trim(),
          value: String(r.Value ?? '').trim(),
        }));
    }

    // Fallback (should rarely happen now)
    const rows: DecodedRow[] = [];
    const v = reportData?.vehicle || {};
    const add = (group: string, element: string, value: any) => {
      const val = value === undefined || value === null ? '' : String(value);
      rows.push({ group: group || '', element, value: val });
    };

    add('General', 'Model Year', v.year || '');
    add('General', 'Make', v.make || '');
    add('General', 'Model', v.model || '');
    add('General', 'Trim', v.trim || '');
    add('General', 'Body Class', v.bodyStyle || '');
    add('General', 'Manufacturer Name', v.manufacturer || '');
    add('Powertrain', 'Engine Model', v.engine || '');
    add('Manufacturing', 'Plant City', v.plantCity || '');
    add('Manufacturing', 'Plant State', v.plantState || '');
    add('Manufacturing', 'Plant Country', v.plantCountry || '');

    return rows;
  }

  // -----------------------------
  // Data fetch / VIN decode
  // -----------------------------

  /**
   * ✅ NEW: decode VIN AND return the FULL raw Results array (with GroupName).
   * Using decodevinextended gives GroupName in results, which matches your table structure.
   */
  private async decodeVINWithRaw(vin: string): Promise<DecodeVinResult> {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/${vin}?format=json`
      );

      const decodedResults: NhtsaDecodeRow[] = Array.isArray(response.data?.Results) ? response.data.Results : [];

      // Build a quick lookup Variable -> Value (same as your previous reduce)
      const resultsMap = decodedResults.reduce((acc: any, item: any) => {
        if (item?.Variable) acc[item.Variable] = item.Value;
        return acc;
      }, {});

      const vehicle: VehicleInfo = {
        year: resultsMap['Model Year'] ? parseInt(resultsMap['Model Year']) : undefined,
        make: resultsMap['Make'],
        model: resultsMap['Model'],
        trim: resultsMap['Trim'],
        bodyStyle: resultsMap['Body Class'],
        engine: resultsMap['Engine Model'],
        transmission: resultsMap['Transmission Style'],
        drivetrain: resultsMap['Drive Type'],
        fuelType: resultsMap['Fuel Type - Primary'],
        manufacturer: resultsMap['Manufacturer Name'],
        vin,
        plantCity: resultsMap['Plant City'],
        plantState: resultsMap['Plant State'],
        plantCountry: resultsMap['Plant Country'],
        engineSpecs: {
          cylinders: resultsMap['Engine Number of Cylinders'],
          displacement: resultsMap['Displacement (L)'],
          horsepower: resultsMap['Engine Brake (hp) From'],
        },
        gvwr: resultsMap['Gross Vehicle Weight Rating From'],
      };

      return { vehicle, decodedResults };
    } catch (error) {
      logger.warn(`Failed to decode VIN ${vin} (extended) from NHTSA:`, error);
      return { vehicle: { vin }, decodedResults: [] };
    }
  }

  private async fetchReportData(
    vin: string,
    reportType: ReportType,
    vehicleInfo: VehicleInfo,
    decodedResults: NhtsaDecodeRow[]
  ): Promise<any> {
    const reportData: any = {
      vehicle: vehicleInfo,
      decodedResults, // ✅ attach raw results here
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
      const response = await axios.get(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`);

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
    const baseValue = 15000;
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

    if (reportData.vehicle.year && new Date().getFullYear() - reportData.vehicle.year > 10) {
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
    if (score >= 80) recommendation = 'BUY';
    else if (score >= 60) recommendation = 'CAUTION';
    else recommendation = 'AVOID';

    return { score, recommendation, reasons };
  }
}

export default new ReportService();