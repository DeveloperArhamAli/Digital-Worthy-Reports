import { Request, Response } from 'express';
import StripeLinkService from '../services/stripeLink.service';
import ReportService from '../services/report.service';
import EmailService from '../services/email.service';
import { logger } from '../utils/logger';

class StripeLinkController {
  async createOrder(req: Request, res: Response): Promise<void> {
    console.log("req receinved")
    try {
      const { plan, vin, customer } = req.body;

      console.log("Creating order with:", { plan, vin, customer });

      if (!plan || !vin || !customer) {
        res.status(400).json({ 
          success: false,
          error: 'Missing required fields: plan, vin, customer' 
        });
        return;
      }

      const result = await StripeLinkService.createOrder({ plan, vin, customer });

      await EmailService.sendOrderConfirmation(
        customer.email,
        customer.name,
        result.transactionId,
        plan,
        vin,
        result.stripeUrl
      );

      res.json(result);
    } catch (error: any) {
      logger.error('Error creating order:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create order',
        message: error.message 
      });
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({ 
          success: false,
          error: 'Order ID required' 
        });
        return;
      }

      const result = await StripeLinkService.verifyPayment(orderId);

      res.json(result);
    } catch (error: any) {
      logger.error('Error verifying payment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to verify payment',
        message: error.message 
      });
    }
  }

  async processPaymentSuccess(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        res.status(400).json({ 
          success: false,
          error: 'Order ID required' 
        });
        return;
      }

      const payment = await StripeLinkService.processSuccessfulPayment(orderId);

      await EmailService.sendProcessingNotification(
        payment.customerEmail,
        payment.customerName,
        payment.vin
      );

      const report = await ReportService.generateFullReport(payment);

      payment.reportUrl = report.reportUrl;
      await payment.save();

      await EmailService.sendReportReady(
        payment.customerEmail,
        payment.customerName,
        report.reportUrl,
        payment.vin,
        payment.reportType
      );

      await EmailService.sendPaymentConfirmation(
        payment.customerEmail,
        payment.customerName,
        payment.transactionId,
        payment.amount,
        payment.reportType,
        payment.vin
      );

      res.json({
        success: true,
        message: 'Payment processed successfully and report generated',
        payment: {
          transactionId: payment.transactionId,
          status: payment.status,
          reportUrl: report.reportUrl,
          reportGeneratedAt: new Date(),
        },
      });
    } catch (error: any) {
      logger.error('Error processing payment success:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to process payment',
        message: error.message 
      });
    }
  }

  async getOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({ 
          success: false,
          error: 'Order ID required' 
        });
        return;
      }

      const status = await StripeLinkService.getOrderStatus(orderId);

      res.json({
        success: true,
        status,
      });
    } catch (error: any) {
      logger.error('Error getting order status:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get order status',
        message: error.message 
      });
    }
  }

  async webhookCallback(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, status } = req.body;

      if (!orderId) {
        res.status(400).json({ 
          success: false,
          error: 'Order ID required' 
        });
        return;
      }

      if (status === 'success') {
        const payment = await StripeLinkService.processSuccessfulPayment(orderId);

        const report = await ReportService.generateFullReport(payment);

        payment.reportUrl = report.reportUrl;
        await payment.save();

        await EmailService.sendReportReady(
          payment.customerEmail,
          payment.customerName,
          report.reportUrl,
          payment.vin,
          payment.reportType
        );

        res.json({
          success: true,
          message: 'Payment processed via webhook',
          payment: {
            transactionId: payment.transactionId,
            status: payment.status,
            reportUrl: report.reportUrl,
          },
        });
      } else {
        res.json({
          success: true,
          message: 'Webhook received',
          status: 'pending'
        });
      }
    } catch (error: any) {
      logger.error('Error in webhook callback:', error);
      res.status(500).json({ 
        success: false,
        error: 'Webhook processing failed',
        message: error.message 
      });
    }
  }
}

export default new StripeLinkController();