import { Request, Response } from 'express';
import PaymentService from '../services/payment.service';
import ReportService from '../services/report.service';
import EmailService from '../services/email.service';
import { logger } from '../utils/logger';
import { Payment, PaymentStatus } from '../models/Payment.model';

class PaymentController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { plan, vin, customer } = req.body;

      if (!plan || !vin || !customer) {
        res.status(400).json({ 
          success: false,
          error: 'Missing required fields' 
        });
        return;
      }

      const result = await PaymentService.createOrder({ plan, vin, customer });

      // Send order confirmation email
      await EmailService.sendOrderConfirmation(
        customer.email,
        customer.name,
        result.orderId,
        plan,
        vin,
        result.stripeUrl
      );

      res.json({
        success: true,
        orderId: result.orderId,
        stripeUrl: result.stripeUrl,
        transactionId: result.transactionId
      });
    } catch (error: any) {
      logger.error('Error creating order:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create order'
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

      const result = await PaymentService.verifyPayment(orderId);

      res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      logger.error('Error verifying payment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to verify payment'
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

      // Get payment
      const payment = await PaymentService.getPaymentById(orderId);
      if (!payment) {
        res.status(404).json({ 
          success: false,
          error: 'Payment not found' 
        });
        return;
      }

      // If already processed, return report
      if (payment.reportUrl) {
        res.json({
          success: true,
          reportUrl: payment.reportUrl,
          alreadyExists: true
        });
        return;
      }

      // Update payment status
      await PaymentService.updatePaymentStatus(orderId, PaymentStatus.SUCCESS);

      // Generate report
      const report = await ReportService.generateFullReport(payment);

      // Send emails
      await EmailService.sendPaymentConfirmation(
        payment.customerEmail,
        payment.customerName,
        payment.transactionId,
        payment.amount,
        payment.reportType,
        payment.vin
      );

      await EmailService.sendReportReady(
        payment.customerEmail,
        payment.customerName,
        report.reportUrl,
        payment.vin,
        payment.reportType
      );

      res.json({
        success: true,
        reportUrl: report.reportUrl,
        message: 'Report generated successfully'
      });
    } catch (error: any) {
      logger.error('Error processing payment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to process payment'
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

      const status = await PaymentService.getOrderStatus(orderId);

      res.json({
        success: true,
        ...status
      });
    } catch (error: any) {
      logger.error('Error getting order status:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get order status'
      });
    }
  }

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;
    
    try {
      await PaymentService.handleStripeWebhook(signature, req.body);
      res.json({ received: true });
    } catch (error: any) {
      logger.error('Stripe webhook error:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  }

  async getPaymentByTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      const payment = await PaymentService.getPaymentByTransactionId(transactionId);
      if (!payment) {
        res.status(404).json({ 
          success: false,
          error: 'Payment not found' 
        });
        return;
      }

      res.json({
        success: true,
        payment: {
          transactionId: payment.transactionId,
          status: payment.status,
          amount: payment.amount,
          reportType: payment.reportType,
          vin: payment.vin,
          reportUrl: payment.reportUrl,
          createdAt: payment.createdAt,
          expiresAt: payment.reportAccessExpiresAt
        }
      });
    } catch (error: any) {
      logger.error('Error getting payment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get payment'
      });
    }
  }
}

export default new PaymentController();