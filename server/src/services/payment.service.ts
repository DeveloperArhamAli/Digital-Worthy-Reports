import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { Payment, IPayment, PaymentStatus, ReportType } from '../models/Payment.model';
import { logger } from '../utils/logger';
import reportService from './report.service';
import { COMPANY_NAME, FRONTEND_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '@utils/readDockerSecret';

interface CreateOrderParams {
  plan: string;
  vin: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}

class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }

  async createOrder(params: CreateOrderParams): Promise<{ orderId: string; stripeUrl: string; transactionId: string }> {
    try {
      const { plan, vin, customer } = params;
      
      // Determine price and report type
      const { price, reportType } = this.getPlanDetails(plan);
      
      // Create transaction ID
      const transactionId = `TXN-${uuidv4().split('-')[0].toUpperCase()}`;
      
      // Create payment record
      const payment = await Payment.create({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        vin: vin.toUpperCase(),
        reportType,
        amount: price,
        currency: 'USD',
        transactionId,
        status: PaymentStatus.PENDING,
        merchantTag: COMPANY_NAME,
        metadata: {
          source: COMPANY_NAME,
          merchant: COMPANY_NAME,
          plan,
          vinLength: vin.length,
          customerName: customer.name
        }
      });

      // Create Stripe Checkout Session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan.toUpperCase()} Vehicle History Report`,
                description: `VIN: ${vin.toUpperCase()}`,
                metadata: {
                  merchant: COMPANY_NAME!,
                  product_type: 'vehicle_history_report',
                }
              },
              unit_amount: price * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${FRONTEND_URL}/payment-success?orderId=${payment._id}`,
        cancel_url: `${FRONTEND_URL}/payment-cancel?orderId=${payment._id}`,
        customer_email: customer.email,
        metadata: {
          merchant: COMPANY_NAME!,
          source: COMPANY_NAME!,
          transaction_type: 'vehicle_history_report',
          orderId: payment._id.toString(),
          vin: vin.toUpperCase(),
          plan,
          transactionId
        },

        client_reference_id: payment._id.toString(),
      }, { apiKey: STRIPE_SECRET_KEY });

      // Update payment with Stripe session ID
      await Payment.findByIdAndUpdate(payment._id, {
        stripeSessionId: session.id,
        stripeUrl: session.url
      });

      logger.info(`Order created: ${payment._id}, Stripe Session: ${session.id}`);

      return {
        orderId: payment._id.toString(),
        stripeUrl: session.url!,
        transactionId
      };
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async verifyPayment(orderId: string): Promise<{ 
    status: PaymentStatus; 
    verified: boolean; 
    reportUrl?: string;
    transactionId?: string;
  }> {
    try {
      const payment = await Payment.findById(orderId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      // If already successful and report generated, return immediately
      if (payment.status === PaymentStatus.SUCCESS && payment.reportUrl) {
        return {
          status: PaymentStatus.SUCCESS,
          verified: true,
          reportUrl: payment.reportUrl,
          transactionId: payment.transactionId
        };
      }

      // Check Stripe session status
      if (payment.stripeSessionId) {
        const session = await this.stripe.checkout.sessions.retrieve(payment.stripeSessionId, { apiKey: STRIPE_SECRET_KEY });
        
        if (session.payment_status === 'paid') {
          // Update payment status
          await Payment.findByIdAndUpdate(orderId, {
            status: PaymentStatus.SUCCESS,
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent as string
          });

          return {
            status: PaymentStatus.SUCCESS,
            verified: true,
            transactionId: payment.transactionId
          };
        } else if (session.status === 'expired') {
          await Payment.findByIdAndUpdate(orderId, {
            status: PaymentStatus.EXPIRED
          });
          
          return {
            status: PaymentStatus.EXPIRED,
            verified: false
          };
        }
      }

      return {
        status: payment.status,
        verified: false
      };
    } catch (error) {
      logger.error('Error verifying payment:', error);
      throw error;
    }
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<IPayment> {
    try {
      const updateData: any = { status };
      
      if (status === PaymentStatus.SUCCESS) {
        updateData.paidAt = new Date();
      }

      const payment = await Payment.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true }
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      logger.info(`Payment ${orderId} status updated to: ${status}`);

      return payment;
    } catch (error) {
      logger.error('Error updating payment status:', error);
      throw error;
    }
  }

  async getPaymentById(orderId: string): Promise<IPayment | null> {
    try {
      return await Payment.findById(orderId);
    } catch (error) {
      logger.error('Error getting payment by ID:', error);
      throw error;
    }
  }

  async getPaymentByTransactionId(transactionId: string): Promise<IPayment | null> {
    try {
      return await Payment.findOne({ transactionId });
    } catch (error) {
      logger.error('Error getting payment by transaction ID:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId: string): Promise<{ 
    status: PaymentStatus; 
    reportUrl?: string;
    message?: string;
    transactionId?: string;
  }> {
    try {
      const payment = await Payment.findById(orderId);
      
      if (!payment) {
        return {
          status: PaymentStatus.FAILED,
          message: 'Order not found'
        };
      }

      let statusMessage = '';
      switch (payment.status) {
        case PaymentStatus.PENDING:
          statusMessage = 'Waiting for payment';
          break;
        case PaymentStatus.SUCCESS:
          statusMessage = payment.reportUrl ? 'Report ready' : 'Payment successful, generating report';
          break;
        case PaymentStatus.FAILED:
          statusMessage = 'Payment failed';
          break;
        case PaymentStatus.EXPIRED:
          statusMessage = 'Payment expired';
          break;
        case PaymentStatus.COMPLETED:
          statusMessage = 'Report generated and ready';
          break;
      }

      return {
        status: payment.status,
        reportUrl: payment.reportUrl,
        message: statusMessage,
        transactionId: payment.transactionId
      };
    } catch (error) {
      logger.error('Error getting order status:', error);
      throw error;
    }
  }

async handleStripeWebhook(signature: string, payload: any): Promise<void> {
  try {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const metadata = session.metadata || {};
      
      if (metadata.merchant === COMPANY_NAME) {
        await this.processYourTransaction(session);
        return;
      }
      
      if (metadata.source === COMPANY_NAME) {
        await this.processYourTransaction(session);
        return;
      }
      
      if (metadata.transaction_type === 'vehicle_report') {
        await this.processYourTransaction(session);
        return;
      }
      
      logger.info(`Ignoring transaction from other merchant: ${session.id}`);
    }
  } catch (error) {
    logger.error('Webhook error:', error);
    throw error;
  }
}

private async processYourTransaction(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const orderId = metadata.internal_order_id;
  
  if (!orderId) {
    logger.error('No order ID in metadata for session:', session.id);
    return;
  }
  
  logger.info(`✅ Processing YOUR transaction: ${session.id}`);
  logger.info(`   Order ID: ${orderId}`);
  logger.info(`   Plan: ${metadata.plan}`);
  logger.info(`   VIN: ${metadata.vin}`);
  logger.info(`   Amount: $${session.amount_total! / 100}`);
  
  // Update your database
  await Payment.findByIdAndUpdate(orderId, {
    status: PaymentStatus.SUCCESS,
    paidAt: new Date(),
    stripePaymentIntentId: session.payment_intent as string,
    metadata: {
      ...metadata,
      stripeSessionId: session.id,
      stripeAmount: session.amount_total! / 100,
      stripeCurrency: session.currency
    }
  });
  
  // Generate report
  const payment = await Payment.findById(orderId);
  if (payment) {
    await reportService.generateFullReport(payment);
  }
}

  private getPlanDetails(plan: string): { price: number; reportType: ReportType } {
    switch (plan.toLowerCase()) {
      case 'basic':
        return { price: 50, reportType: ReportType.BASIC };
      case 'silver':
        return { price: 80, reportType: ReportType.SILVER };
      case 'gold':
        return { price: 100, reportType: ReportType.GOLD };
      default:
        throw new Error(`Invalid plan: ${plan}`);
    }
  }
}

export default new PaymentService();