import { Request, Response } from 'express';
import ReportService from '../services/report.service';
import { logger } from '../utils/logger';
import { Report } from '../models/Report.model';
import { Payment } from '../models/Payment.model';

class ReportController {
  async getReportPreview(req: Request, res: Response): Promise<void> {
    try {
      const { vin } = req.params;
      const preview = await ReportService.generateReportPreview(vin);

      if (!preview) {
        logger.error(`Failed to decode VIN ${vin}`);
        res.status(400).json({ error: 'Failed to decode VIN' });
      }

      res.status(200).json({ success: true, preview });
    } catch (error) {
      logger.error('Error getting report preview:', error);
      res.status(500).json({ error: 'Failed to get report preview' });
    }
  }
  
  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;

      const report = await ReportService.getReportById(reportId);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.json({
        success: true,
        report: {
          id: report._id,
          vin: report.vin,
          reportType: report.reportType,
          reportUrl: report.reportUrl,
          downloadCount: report.downloadCount,
          expiresAt: report.expiresAt,
          createdAt: report.createdAt,
        },
      });
    } catch (error) {
      logger.error('Error getting report:', error);
      res.status(500).json({ error: 'Failed to get report' });
    }
  }

  async downloadReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;

      const report = await ReportService.getReportById(reportId);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.redirect(report.reportUrl);
    } catch (error) {
      logger.error('Error downloading report:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  }

  async getReportByTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      const payment = await Payment.findOne({ transactionId });
      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      const report = await Report.findOne({ paymentId: payment._id });
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.json({
        success: true,
        report: {
          id: report._id,
          vin: report.vin,
          reportType: report.reportType,
          reportUrl: report.reportUrl,
          downloadCount: report.downloadCount,
          expiresAt: report.expiresAt,
          createdAt: report.createdAt,
        },
      });
    } catch (error) {
      logger.error('Error getting report by transaction:', error);
      res.status(500).json({ error: 'Failed to get report' });
    }
  }
}

export default new ReportController();