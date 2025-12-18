import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { Payment, IPayment, PaymentStatus, PaymentMethod, ReportType } from '../models/Payment.model';
import { Customer } from '../models/Customer.model';
import { TransactionLog } from '../models/TransactionLog.model';
import PayPalService, { PayPalOrder, PayPalCapture } from './paypal.service';
import { logger } from '../utils/logger';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface CreatePaymentInput {
  customerId: string;
  amount: number;
  currency: string;
  reportType: ReportType;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vin: string;
}

class PaymentService {
  async createPayment(input: CreatePaymentInput): Promise<IPayment> {
    try {
      // Find or create customer
      let customer = await Customer.findOne({ email: input.customerEmail });
      
      if (!customer) {
        customer = await Customer.create({
          email: input.customerEmail,
          name: input.customerName,
          phone: input.customerPhone,
        });
      }

      const transactionId = `TX-${Date.now()}-${uuidv4().slice(0, 8)}`;
      
      const payment = await Payment.create({
        customerId: customer._id,
        transactionId,
        amount: input.amount,
        currency: input.currency,
        reportType: input.reportType,
        paymentMethod: input.paymentMethod,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        vin: input.vin.toUpperCase(),
        status: PaymentStatus.PENDING,
        metadata: {},
      });

      await TransactionLog.create({
        transactionId: payment.transactionId,
        paymentId: payment._id,
        status: PaymentStatus.PENDING,
        action: 'payment_created',
        data: { input },
      });

      logger.info(`Payment created: ${payment.transactionId}`);
      return payment;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async createStripePaymentIntent(paymentId: string): Promise<string> {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');

      const amountInCents = Math.round(payment.amount * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: payment.currency.toLowerCase(),
        metadata: {
          paymentId: payment._id.toString(),
          transactionId: payment.transactionId,
          vin: payment.vin,
          reportType: payment.reportType,
          customerEmail: payment.customerEmail,
        },
        description: `Vehicle History Report - ${payment.reportType}`,
        shipping: {
          name: payment.customerName,
          address: {
            line1: 'Digital Delivery',
            city: 'Digital',
            state: 'DC',
            country: 'US',
            postal_code: '12345',
          },
        },
        receipt_email: payment.customerEmail,
      });

      payment.stripePaymentIntentId = paymentIntent.id;
      payment.metadata = {
        ...payment.metadata,
        stripeClientSecret: paymentIntent.client_secret,
      };
      
      await payment.save();

      return paymentIntent.client_secret!;
    } catch (error) {
      logger.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  }

  async createPayPalOrder(paymentId: string): Promise<PayPalOrder> {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');

      const order = await PayPalService.createOrder({
        amount: payment.amount,
        currency: payment.currency,
        description: `Vehicle History Report - ${payment.reportType}`,
        customId: payment._id.toString(),
        invoiceId: payment.transactionId,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        customerPhone: payment.customerPhone,
        returnUrl: `${process.env.FRONTEND_URL}/payment-success?transactionId=${payment.transactionId}`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment-cancelled?transactionId=${payment.transactionId}`,
      });

      payment.paypalOrderId = order.id;
      payment.metadata = {
        ...payment.metadata,
        paypalOrder: order,
        approvalUrl: order.links.find(link => link.rel === 'approve')?.href,
      };
      await payment.save();

      logger.info(`PayPal order created for payment ${payment.transactionId}: ${order.id}`);
      return order;
    } catch (error: any) {
      logger.error('Error creating PayPal order:', error);
      throw new Error(`Failed to create PayPal order: ${error.message}`);
    }
  }

  async capturePayPalOrder(orderId: string): Promise<PayPalCapture> {
    try {
      const captureResult = await PayPalService.captureOrder(orderId);

      const payment = await Payment.findOne({ paypalOrderId: orderId });
      if (!payment) throw new Error('Payment not found');

      // Get capture ID from the result
      const captureId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      
      if (!captureId) {
        throw new Error('No capture ID found in PayPal response');
      }

      payment.paypalCaptureId = captureId;
      payment.status = PaymentStatus.COMPLETED;
      payment.reportAccessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      payment.metadata = {
        ...payment.metadata,
        paypalCapture: captureResult,
      };
      await payment.save();

      await TransactionLog.create({
        transactionId: payment.transactionId,
        paymentId: payment._id,
        status: PaymentStatus.COMPLETED,
        action: 'paypal_capture_completed',
        data: { captureResult },
      });

      logger.info(`PayPal order captured for payment ${payment.transactionId}: ${captureId}`);
      return captureResult;
    } catch (error: any) {
      logger.error('Error capturing PayPal order:', error);
      throw new Error(`Failed to capture PayPal order: ${error.message}`);
    }
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus, metadata?: any): Promise<IPayment> {
    try {
      const updateData: any = { 
        status,
      };

      if (metadata) {
        updateData.$set = {
          'metadata': metadata,
        };
      }

      if (status === PaymentStatus.COMPLETED) {
        updateData.reportAccessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }

      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        updateData,
        { new: true }
      );

      if (!payment) throw new Error('Payment not found');

      await TransactionLog.create({
        transactionId: payment.transactionId,
        paymentId: payment._id,
        status,
        action: 'payment_status_updated',
        data: { status, metadata },
      });

      logger.info(`Payment ${payment.transactionId} status updated to ${status}`);
      return payment;
    } catch (error) {
      logger.error('Error updating payment status:', error);
      throw error;
    }
  }

  async handleStripeWebhook(signature: string, payload: Buffer): Promise<void> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleStripePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'charge.refunded':
          await this.handleStripeRefund(event.data.object as Stripe.Charge);
          break;
        
        default:
          logger.warn(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      logger.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  async handlePayPalWebhook(headers: any, body: any): Promise<void> {
    try {
      // Verify webhook signature
      const isValid = await PayPalService.verifyWebhookSignature(headers, body);
      if (!isValid) {
        throw new Error('Invalid PayPal webhook signature');
      }

      const eventType = body.event_type;
      const resource = body.resource;

      switch (eventType) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePayPalCaptureCompleted(resource);
          break;
        
        case 'PAYMENT.CAPTURE.DENIED':
          await this.handlePayPalCaptureDenied(resource);
          break;
        
        case 'PAYMENT.CAPTURE.REFUNDED':
          await this.handlePayPalCaptureRefunded(resource);
          break;
        
        default:
          logger.warn(`Unhandled PayPal event type: ${eventType}`);
      }
    } catch (error) {
      logger.error('Error handling PayPal webhook:', error);
      throw error;
    }
  }

  private async handleStripePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (!payment) return;

    await this.updatePaymentStatus(payment._id.toString(), PaymentStatus.COMPLETED, {
      stripePaymentIntent: paymentIntent.id,
      stripeChargeId: paymentIntent.latest_charge,
    });
  }

  private async handleStripePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (!payment) return;

    await this.updatePaymentStatus(payment._id.toString(), PaymentStatus.FAILED, {
      stripePaymentIntent: paymentIntent.id,
      error: paymentIntent.last_payment_error,
    });
  }

  private async handleStripeRefund(charge: Stripe.Charge): Promise<void> {
    const payment = await Payment.findOne({ stripePaymentIntentId: charge.payment_intent as string });
    if (!payment) return;

    await this.updatePaymentStatus(payment._id.toString(), PaymentStatus.REFUNDED, {
      stripeChargeId: charge.id,
      refunds: charge.refunds,
    });
  }

  private async handlePayPalCaptureCompleted(resource: any): Promise<void> {
    const captureId = resource.id;
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    
    let payment;
    
    if (orderId) {
      payment = await Payment.findOne({ paypalOrderId: orderId });
    }
    
    if (!payment && captureId) {
      payment = await Payment.findOne({ paypalCaptureId: captureId });
    }
    
    if (!payment) return;

    await this.updatePaymentStatus(payment._id.toString(), PaymentStatus.COMPLETED, {
      paypalCapture: resource,
      webhookEvent: 'PAYMENT.CAPTURE.COMPLETED',
    });
  }

  private async handlePayPalCaptureDenied(resource: any): Promise<void> {
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    if (!orderId) return;

    const payment = await Payment.findOne({ paypalOrderId: orderId });
    if (!payment) return;

    await this.updatePaymentStatus(payment._id.toString(), PaymentStatus.FAILED, {
      paypalCapture: resource,
      webhookEvent: 'PAYMENT.CAPTURE.DENIED',
    });
  }

  private async handlePayPalCaptureRefunded(resource: any): Promise<void> {
    const captureId = resource.id;
    if (!captureId) return;

    const payment = await Payment.findOne({ paypalCaptureId: captureId });
    if (!payment) return;

    await this.updatePaymentStatus(payment._id.toString(), PaymentStatus.REFUNDED, {
      paypalRefund: resource,
      webhookEvent: 'PAYMENT.CAPTURE.REFUNDED',
    });
  }

  async getPaymentByTransactionId(transactionId: string): Promise<IPayment | null> {
    try {
      return await Payment.findOne({ transactionId }).populate('customerId');
    } catch (error) {
      logger.error('Error getting payment:', error);
      throw error;
    }
  }

  async getPaymentsByEmail(email: string): Promise<IPayment[]> {
    try {
      return await Payment.find({ customerEmail: email })
        .sort({ createdAt: -1 })
        .populate('customerId');
    } catch (error) {
      logger.error('Error getting payments by email:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, reason?: string): Promise<void> {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Only completed payments can be refunded');
      }

      if (payment.paymentMethod === PaymentMethod.STRIPE && payment.stripePaymentIntentId) {
        const refund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: 'requested_by_customer'
        });

        await this.updatePaymentStatus(paymentId, PaymentStatus.REFUNDED, {
          stripeRefundId: refund.id,
          refundReason: reason,
        });
      } else if (payment.paymentMethod === PaymentMethod.PAYPAL && payment.paypalCaptureId) {
        // Refund PayPal capture
        await PayPalService.refundCapture(payment.paypalCaptureId);

        await this.updatePaymentStatus(paymentId, PaymentStatus.REFUNDED, {
          refundReason: reason,
          refundedAt: new Date(),
        });
      }
    } catch (error) {
      logger.error('Error refunding payment:', error);
      throw error;
    }
  }

  async validatePayment(paymentId: string): Promise<boolean> {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) return false;

      // Check if payment is completed
      if (payment.status !== PaymentStatus.COMPLETED) return false;

      // Check if report access hasn't expired
      if (payment.reportAccessExpiresAt && payment.reportAccessExpiresAt < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validating payment:', error);
      return false;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<{
    status: PaymentStatus;
    transactionId: string;
    amount: number;
    currency: string;
    reportType: ReportType;
    vin: string;
    reportUrl?: string;
    createdAt: Date;
    expiresAt?: Date;
  }> {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');

      return {
        status: payment.status,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        reportType: payment.reportType,
        vin: payment.vin,
        reportUrl: payment.reportUrl,
        createdAt: payment.createdAt,
        expiresAt: payment.reportAccessExpiresAt,
      };
    } catch (error) {
      logger.error('Error getting payment status:', error);
      throw error;
    }
  }
}

export default new PaymentService();