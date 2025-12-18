import { Request, Response } from 'express';
import PaymentService from '../services/payment.service';
import ReportService from '../services/report.service';
import EmailService from '../services/email.service';
import PayPalService from '../services/paypal.service';
import { logger } from '../utils/logger';
import { Payment, ReportType, PaymentMethod, PaymentStatus } from '../models/Payment.model';
import { Customer } from '../models/Customer.model';

class PaymentController {
  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const {
        amount,
        currency = 'USD',
        customer,
        reportType,
        vin,
      } = req.body;

      // Validate input
      if (!amount || !customer || !reportType || !vin) {
        res.status(400).json({ 
          success: false,
          error: 'Missing required fields: amount, customer, reportType, vin' 
        });
        return;
      }

      if (vin.length !== 17) {
        res.status(400).json({ 
          success: false,
          error: 'Invalid VIN length. Must be 17 characters.' 
        });
        return;
      }

      // Validate report type
      if (!Object.values(ReportType).includes(reportType)) {
        res.status(400).json({ 
          success: false,
          error: `Invalid report type. Must be one of: ${Object.values(ReportType).join(', ')}` 
        });
        return;
      }

      // Validate customer object
      if (!customer.name || !customer.email) {
        res.status(400).json({ 
          success: false,
          error: 'Customer name and email are required' 
        });
        return;
      }

      // Create payment record
      const payment = await PaymentService.createPayment({
        customerId: customer.email,
        amount: parseFloat(amount),
        currency,
        reportType: reportType as ReportType,
        paymentMethod: PaymentMethod.STRIPE,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        vin: vin.toUpperCase(),
      });

      // Create Stripe payment intent
      const clientSecret = await PaymentService.createStripePaymentIntent(payment._id.toString());

      res.json({
        success: true,
        payment: {
          id: payment._id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          reportType: payment.reportType,
          vin: payment.vin,
          status: payment.status,
          createdAt: payment.createdAt,
        },
        clientSecret,
      });
    } catch (error: any) {
      logger.error('Error creating payment intent:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create payment intent',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async createPayPalOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        amount,
        currency = 'USD',
        customer,
        reportType,
        vin,
      } = req.body;

      // Validate input
      if (!amount || !customer || !reportType || !vin) {
        res.status(400).json({ 
          success: false,
          error: 'Missing required fields: amount, customer, reportType, vin' 
        });
        return;
      }

      if (vin.length !== 17) {
        res.status(400).json({ 
          success: false,
          error: 'Invalid VIN length. Must be 17 characters.' 
        });
        return;
      }

      // Validate report type
      if (!Object.values(ReportType).includes(reportType)) {
        res.status(400).json({ 
          success: false,
          error: `Invalid report type. Must be one of: ${Object.values(ReportType).join(', ')}` 
        });
        return;
      }

      // Validate customer object
      if (!customer.name || !customer.email) {
        res.status(400).json({ 
          success: false,
          error: 'Customer name and email are required' 
        });
        return;
      }

      // Create payment record
      const payment = await PaymentService.createPayment({
        customerId: customer.email,
        amount: parseFloat(amount),
        currency,
        reportType: reportType as ReportType,
        paymentMethod: PaymentMethod.PAYPAL,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        vin: vin.toUpperCase(),
      });

      // Create PayPal order
      const paypalOrder = await PaymentService.createPayPalOrder(payment._id.toString());

      // Find approval URL
      const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

      res.json({
        success: true,
        payment: {
          id: payment._id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          reportType: payment.reportType,
          vin: payment.vin,
          status: payment.status,
          createdAt: payment.createdAt,
        },
        paypalOrder: {
          id: paypalOrder.id,
          status: paypalOrder.status,
          approvalUrl,
          links: paypalOrder.links,
        },
      });
    } catch (error: any) {
      logger.error('Error creating PayPal order:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create PayPal order',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async capturePayPalOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        res.status(400).json({ 
          success: false,
          error: 'Order ID required' 
        });
        return;
      }

      // Capture PayPal payment
      const captureResult = await PaymentService.capturePayPalOrder(orderId);

      // Get payment record
      const payment = await Payment.findOne({ paypalOrderId: orderId });
      if (!payment) {
        res.status(404).json({ 
          success: false,
          error: 'Payment not found' 
        });
        return;
      }

      // Send processing email
      await EmailService.sendProcessingNotification(
        payment.customerEmail,
        payment.customerName,
        payment.vin
      );

      // Generate report
      const report = await ReportService.generateFullReport(payment);

      // Send report ready email
      await EmailService.sendReportReady(
        payment.customerEmail,
        payment.customerName,
        report.reportUrl,
        payment.vin,
        payment.reportType
      );

      // Send payment confirmation email
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
        payment: {
          transactionId: payment.transactionId,
          status: payment.status,
          reportUrl: report.reportUrl,
          reportGeneratedAt: new Date(),
        },
        capture: {
          id: captureResult.id,
          status: captureResult.status,
        },
      });
    } catch (error: any) {
      logger.error('Error capturing PayPal order:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to capture payment',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async processPaymentSuccess(req: Request, res: Response): Promise<void> {
    try {
      const {
        paymentIntentId,
        transactionId,
      } = req.body;

      if (!paymentIntentId && !transactionId) {
        res.status(400).json({ 
          success: false,
          error: 'Payment Intent ID or Transaction ID required' 
        });
        return;
      }

      let payment;

      if (paymentIntentId) {
        // Stripe payment
        payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
        if (!payment) {
          res.status(404).json({ 
            success: false,
            error: 'Stripe payment not found' 
          });
          return;
        }

        // Update payment status for Stripe
        await PaymentService.updatePaymentStatus(
          payment._id.toString(),
          PaymentStatus.COMPLETED,
          { stripePaymentIntent: paymentIntentId }
        );
      } else if (transactionId) {
        // PayPal payment
        payment = await Payment.findOne({ transactionId });
        if (!payment) {
          res.status(404).json({ 
            success: false,
            error: 'Payment not found' 
          });
          return;
        }

        // Check if already completed
        if (payment.status === PaymentStatus.COMPLETED) {
          res.json({
            success: true,
            message: 'Payment already processed',
            payment: {
              transactionId: payment.transactionId,
              status: payment.status,
              reportUrl: payment.reportUrl,
            },
          });
          return;
        }
      }

      if (!payment) {
        res.status(404).json({ 
          success: false,
          error: 'Payment not found' 
        });
        return;
      }

      // Send processing email
      await EmailService.sendProcessingNotification(
        payment.customerEmail,
        payment.customerName,
        payment.vin
      );

      // Generate report
      const report = await ReportService.generateFullReport(payment);

      // Send report ready email
      await EmailService.sendReportReady(
        payment.customerEmail,
        payment.customerName,
        report.reportUrl,
        payment.vin,
        payment.reportType
      );

      // Send payment confirmation email
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
        payment: {
          transactionId: payment.transactionId,
          status: PaymentStatus.COMPLETED,
          reportUrl: report.reportUrl,
          reportGeneratedAt: new Date(),
        },
      });
    } catch (error: any) {
      logger.error('Error processing payment success:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to process payment',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        res.status(400).json({ 
          success: false,
          error: 'Transaction ID required' 
        });
        return;
      }

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
          currency: payment.currency,
          reportType: payment.reportType,
          vin: payment.vin,
          reportUrl: payment.reportUrl,
          createdAt: payment.createdAt,
          expiresAt: payment.reportAccessExpiresAt,
          paymentMethod: payment.paymentMethod,
        },
      });
    } catch (error: any) {
      logger.error('Error getting payment status:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get payment status',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getCustomerPayments(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({ 
          success: false,
          error: 'Email required' 
        });
        return;
      }

      const payments = await PaymentService.getPaymentsByEmail(email);
      
      res.json({
        success: true,
        payments: payments.map(payment => ({
          transactionId: payment.transactionId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          reportType: payment.reportType,
          vin: payment.vin,
          reportUrl: payment.reportUrl,
          createdAt: payment.createdAt,
          expiresAt: payment.reportAccessExpiresAt,
          paymentMethod: payment.paymentMethod,
        })),
      });
    } catch (error: any) {
      logger.error('Error getting customer payments:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get payments',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        res.status(400).json({ 
          success: false,
          error: 'Missing stripe signature' 
        });
        return;
      }

      // Pass raw body buffer
      await PaymentService.handleStripeWebhook(signature, req.body);

      res.json({ 
        success: true,
        received: true 
      });
    } catch (error: any) {
      logger.error('Error handling Stripe webhook:', error);
      res.status(400).json({ 
        success: false,
        error: 'Webhook error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async handlePayPalWebhook(req: Request, res: Response): Promise<void> {
    try {
      await PaymentService.handlePayPalWebhook(req.headers, req.body);

      res.json({ 
        success: true,
        received: true 
      });
    } catch (error: any) {
      logger.error('Error handling PayPal webhook:', error);
      res.status(400).json({ 
        success: false,
        error: 'Webhook error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId, reason } = req.body;

      if (!paymentId) {
        res.status(400).json({ 
          success: false,
          error: 'Payment ID required' 
        });
        return;
      }

      await PaymentService.refundPayment(paymentId, reason);

      res.json({
        success: true,
        message: 'Refund processed successfully',
      });
    } catch (error: any) {
      logger.error('Error processing refund:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to process refund',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        res.status(400).json({ 
          success: false,
          error: 'Payment ID required' 
        });
        return;
      }

      const isValid = await PaymentService.validatePayment(paymentId);

      res.json({
        success: true,
        isValid,
      });
    } catch (error: any) {
      logger.error('Error verifying payment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to verify payment',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getPaymentDetails(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        res.status(400).json({ 
          success: false,
          error: 'Payment ID required' 
        });
        return;
      }

      const paymentDetails = await PaymentService.getPaymentStatus(paymentId);

      res.json({
        success: true,
        payment: paymentDetails,
      });
    } catch (error: any) {
      logger.error('Error getting payment details:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get payment details',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new PaymentController();