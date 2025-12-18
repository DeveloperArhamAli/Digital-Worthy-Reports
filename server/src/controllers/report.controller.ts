import { Request, Response } from 'express';
import ReportService from '../services/report.service';
import PaymentService from '../services/payment.service';
import { logger } from '../utils/logger';
import { Report } from '../models/Report.model';
import { Payment } from '../models/Payment.model';

class ReportController {
  async generatePreview(req: Request, res: Response): Promise<void> {
    try {
      const { vin } = req.body;

      if (!vin || vin.length !== 17) {
        res.status(400).json({ error: 'Valid 17-digit VIN required' });
        return;
      }

      const preview = await ReportService.generateReportPreview(vin);

      res.json({
        success: true,
        preview,
      });
    } catch (error) {
      logger.error('Error generating preview:', error);
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  }

  async generateFullReport(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, customer, reportType } = req.body;

      if (!transactionId) {
        res.status(400).json({ error: 'Transaction ID required' });
        return;
      }

      // Get payment
      const payment = await Payment.findOne({ transactionId });
      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      // Check if report already exists
      const existingReport = await Report.findOne({ paymentId: payment._id });
      if (existingReport) {
        res.json({
          success: true,
          reportUrl: existingReport.reportUrl,
          alreadyExists: true,
        });
        return;
      }

      // Generate report
      const report = await ReportService.generateFullReport(payment);

      res.json({
        success: true,
        reportUrl: report.reportUrl,
      });
    } catch (error) {
      logger.error('Error generating full report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
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

      // Check access
      const hasAccess = await ReportService.validateReportAccess(reportId);
      if (!hasAccess) {
        res.status(403).json({ error: 'Report access expired or invalid' });
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

      // Check access
      const hasAccess = await ReportService.validateReportAccess(reportId);
      if (!hasAccess) {
        res.status(403).json({ error: 'Report access expired' });
        return;
      }

      // Redirect to report URL (PDF file)
      res.redirect(report.reportUrl);
    } catch (error) {
      logger.error('Error downloading report:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  }

  async getReportByTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      // Find payment
      const payment = await Payment.findOne({ transactionId });
      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      // Find report
      const report = await Report.findOne({ paymentId: payment._id });
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      // Check access
      const hasAccess = await ReportService.validateReportAccess(report._id.toString());
      if (!hasAccess) {
        res.status(403).json({ error: 'Report access expired' });
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