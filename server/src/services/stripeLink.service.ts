import Stripe from 'stripe';
import { Payment, IPayment, PaymentStatus, PaymentMethod, ReportType } from '../models/Payment.model';
import { Customer } from '../models/Customer.model';
import { TransactionLog } from '../models/TransactionLog.model';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables if not already loaded
if (!process.env.STRIPE_SECRET_KEY) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

// Initialize Stripe only if key exists, otherwise create a mock
let stripe: Stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not found in environment variables');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
  console.log('Stripe initialized successfully');
} catch (error) {
  console.warn('Stripe initialization failed, using mock mode:', error instanceof Error ? error.message : String(error));
  // Create a mock stripe object for development
  stripe = {} as Stripe;
}

interface CreateOrderInput {
  plan: 'basic' | 'silver' | 'gold';
  vin: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface StripeLinkResponse {
  success: boolean;
  stripeUrl: string;
  orderId: string;
  transactionId: string;
  expiresAt: Date;
}

class StripeLinkService {
  private planPrices = {
    basic: 50,
    silver: 80,
    gold: 100
  };

  private planStripeLinks: {
    basic: string;
    silver: string;
    gold: string;
  };

  constructor() {
    this.planStripeLinks = this.loadStripeLinks();
  }

  private loadStripeLinks() {
    // For development/testing, use fallback values if environment variables are not set
    const links = {
      basic: process.env.STRIPE_LINK_BASIC || 'price_basic_fallback',
      silver: process.env.STRIPE_LINK_SILVER || 'price_silver_fallback',
      gold: process.env.STRIPE_LINK_GOLD || 'price_gold_fallback'
    };

    return links;
  }

  private getReportType(plan: string): ReportType {
    switch(plan.toLowerCase()) {
      case 'basic': return ReportType.Basic;
      case 'silver': return ReportType.SILVER;
      case 'gold': return ReportType.GOLD;
      default: return ReportType.Basic;
    }
  }

  async createOrder(input: CreateOrderInput): Promise<StripeLinkResponse> {
    try {
      // Validate VIN
      if (!input.vin || input.vin.length !== 17) {
        throw new Error('Valid 17-digit VIN required');
      }

      // Validate plan
      if (!['basic', 'silver', 'gold'].includes(input.plan)) {
        throw new Error('Invalid plan. Must be basic, silver, or gold');
      }

      // Validate customer
      if (!input.customer.name || !input.customer.email) {
        throw new Error('Customer name and email are required');
      }

      // Validate environment variables
      if (!process.env.FRONTEND_URL) {
        console.warn('FRONTEND_URL not set, using default');
      }

      // Find or create customer
      let customer = await Customer.findOne({ email: input.customer.email });
      
      if (!customer) {
        customer = await Customer.create({
          email: input.customer.email,
          name: input.customer.name,
          phone: input.customer.phone,
        });
      }

      // Generate transaction ID
      const transactionId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Create payment record with PENDING status
      const payment = await Payment.create({
        customerId: customer._id,
        transactionId,
        amount: this.planPrices[input.plan],
        currency: 'USD',
        reportType: this.getReportType(input.plan),
        paymentMethod: PaymentMethod.STRIPE,
        status: PaymentStatus.PENDING,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerPhone: input.customer.phone,
        vin: input.vin.toUpperCase(),
        metadata: {
          plan: input.plan,
          originalVin: input.vin,
          customerIp: 'pending',
          orderCreatedAt: new Date(),
        },
      });

      // Log the transaction
      await TransactionLog.create({
        transactionId: payment.transactionId,
        paymentId: payment._id,
        status: PaymentStatus.PENDING,
        action: 'order_created',
        data: { input },
      });

      // Get the Stripe payment link for the selected plan
      const stripeUrl = this.getStripePaymentLink(input.plan, payment._id.toString());
      console.log(stripeUrl)

      logger.info(`Order created: ${payment.transactionId} for VIN: ${input.vin}`);

      return {
        success: true,
        stripeUrl,
        orderId: payment._id.toString(),
        transactionId: payment.transactionId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };
    } catch (error: any) {
      logger.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  private getStripePaymentLink(plan: string, orderId: string): string {
    console.log(`Getting Stripe link for plan: ${plan}`);
    console.log(`Available plans:`, Object.keys(this.planStripeLinks));
    console.log(`Selected plan link:`, this.planStripeLinks[plan as keyof typeof this.planStripeLinks]);

    // Check if plan exists
    if (!(plan in this.planStripeLinks)) {
      throw new Error(`Invalid plan: ${plan}. Must be basic, silver, or gold`);
    }

    const baseUrl = this.planStripeLinks[plan as keyof typeof this.planStripeLinks];
    
    console.log(`Base URL for ${plan}: ${baseUrl}`);

    if (!baseUrl || baseUrl.includes('_fallback')) {
      console.warn(`Using fallback URL for plan: ${plan}. Please set STRIPE_LINK_${plan.toUpperCase()} in .env file`);
    }

    try {
      // If it's a fallback URL, return it directly
      if (baseUrl.includes('_fallback')) {
        return baseUrl;
      }

      // Otherwise, build the full Stripe URL
      const url = new URL(baseUrl);
      url.searchParams.append('client_reference_id', orderId);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      url.searchParams.append('success_url', `${frontendUrl}/payment-success?order_id=${orderId}`);
      url.searchParams.append('cancel_url', `${frontendUrl}/payment-cancel?order_id=${orderId}`);

      const finalUrl = url.toString();
      console.log(`Final Stripe URL for order ${orderId}: ${finalUrl}`);
      
      return finalUrl;
    } catch (error: any) {
      console.error('Error building Stripe URL:', error);
      // Return a simple URL if URL parsing fails
      return `https://checkout.stripe.com/pay/${baseUrl}?client_reference_id=${orderId}`;
    }
  }

  async verifyPayment(orderId: string): Promise<{
    success: boolean;
    payment: IPayment | null;
    status: PaymentStatus;
    verified: boolean;
  }> {
    try {
      const payment = await Payment.findById(orderId);
      
      if (!payment) {
        return {
          success: false,
          payment: null,
          status: PaymentStatus.FAILED,
          verified: false,
        };
      }

      if (payment.status === PaymentStatus.COMPLETED) {
        return {
          success: true,
          payment,
          status: PaymentStatus.COMPLETED,
          verified: true,
        };
      }

      // In development mode, auto-verify for testing
      if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY) {
        console.log('Development mode: Auto-verifying payment for testing');
        return {
          success: true,
          payment,
          status: PaymentStatus.COMPLETED,
          verified: true,
        };
      }

      return {
        success: true,
        payment,
        status: payment.status,
        verified: false,
      };
    } catch (error: any) {
      logger.error('Error verifying payment:', error);
      return {
        success: false,
        payment: null,
        status: PaymentStatus.FAILED,
        verified: false,
      };
    }
  }

  async processSuccessfulPayment(orderId: string): Promise<IPayment> {
    try {
      const payment = await Payment.findById(orderId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      payment.status = PaymentStatus.COMPLETED;
      payment.reportAccessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      await payment.save();

      await TransactionLog.create({
        transactionId: payment.transactionId,
        paymentId: payment._id,
        status: PaymentStatus.COMPLETED,
        action: 'payment_verified',
        data: { verifiedAt: new Date() },
      });

      logger.info(`Payment verified and completed: ${payment.transactionId}`);

      return payment;
    } catch (error: any) {
      logger.error('Error processing successful payment:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId: string): Promise<{
    status: PaymentStatus;
    transactionId: string;
    plan: string;
    amount: number;
    customerEmail: string;
    vin: string;
    reportGenerated: boolean;
    reportUrl?: string;
    createdAt: Date;
    expiresAt?: Date;
  }> {
    try {
      const payment = await Payment.findById(orderId);
      
      if (!payment) {
        throw new Error('Order not found');
      }

      return {
        status: payment.status,
        transactionId: payment.transactionId,
        plan: payment.reportType,
        amount: payment.amount,
        customerEmail: payment.customerEmail,
        vin: payment.vin,
        reportGenerated: !!payment.reportUrl,
        reportUrl: payment.reportUrl,
        createdAt: payment.createdAt,
        expiresAt: payment.reportAccessExpiresAt,
      };
    } catch (error: any) {
      logger.error('Error getting order status:', error);
      throw error;
    }
  }

  // Helper method to check if Stripe is properly configured
  isStripeConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY && 
           !this.planStripeLinks.basic.includes('_fallback') &&
           !this.planStripeLinks.silver.includes('_fallback') &&
           !this.planStripeLinks.gold.includes('_fallback');
  }

  // Method to get current configuration status
  getConfigStatus() {
    return {
      stripeConfigured: this.isStripeConfigured(),
      frontendUrl: process.env.FRONTEND_URL || 'Not set',
      stripeLinks: this.planStripeLinks,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

// Export singleton instance
const stripeLinkService = new StripeLinkService();
export default stripeLinkService;