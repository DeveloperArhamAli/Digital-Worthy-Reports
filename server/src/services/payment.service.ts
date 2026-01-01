import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { Payment, IPayment, PaymentStatus, ReportType } from '../models/Payment.model';
import { logger } from '../utils/logger';

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
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
        metadata: {
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
              },
              unit_amount: price * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${payment._id}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?orderId=${payment._id}`,
        customer_email: customer.email,
        metadata: {
          orderId: payment._id.toString(),
          vin: vin.toUpperCase(),
          plan,
          transactionId
        },
      }, { apiKey: process.env.STRIPE_SECRET_KEY });

      console.log(session)

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
        const session = await this.stripe.checkout.sessions.retrieve(payment.stripeSessionId);
        
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
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.orderId;
          
          if (orderId) {
            logger.info(`Payment successful for order: ${orderId}`);
            
            // Update payment status
            await this.updatePaymentStatus(orderId, PaymentStatus.SUCCESS);
            
            // The report will be generated by the frontend polling
          }
          break;

        case 'checkout.session.expired':
          const expiredSession = event.data.object as Stripe.Checkout.Session;
          const expiredOrderId = expiredSession.metadata?.orderId;
          if (expiredOrderId) {
            await this.updatePaymentStatus(expiredOrderId, PaymentStatus.EXPIRED);
            logger.info(`Payment expired for order: ${expiredOrderId}`);
          }
          break;
      }
    } catch (error) {
      logger.error('Error handling Stripe webhook:', error);
      throw error;
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