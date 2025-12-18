import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

interface PayPalOrder {
  id: string;
  status: string;
  create_time: string;
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    payee: {
      email_address: string;
      merchant_id: string;
    };
    shipping: any;
    payments: any;
  }>;
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id: string;
    phone?: {
      phone_number: {
        national_number: string;
      };
    };
  };
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalCapture {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        seller_protection: any;
        seller_receivable_breakdown: any;
        links: Array<{
          href: string;
          rel: string;
          method: string;
        }>;
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
  payer: any;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

class PayPalService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID!;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
    this.baseUrl = process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    
    logger.info(`PayPal initialized in ${process.env.PAYPAL_MODE} mode`);
  }

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/v1/oauth2/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        data: 'grant_type=client_credentials',
      });

      if (!response.data.access_token) {
        throw new Error('No access token received from PayPal');
      }

      return response.data.access_token;
    } catch (error: any) {
      logger.error('Error getting PayPal access token:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Failed to get PayPal access token: ${error.message}`);
    }
  }

  async createOrder(params: {
    amount: number;
    currency: string;
    description: string;
    customId: string;
    invoiceId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: params.currency,
              value: params.amount.toString(),
            },
            description: params.description,
            custom_id: params.customId,
            invoice_id: params.invoiceId,
            soft_descriptor: 'DigitalWorthyReports',
            shipping: {
              name: {
                full_name: params.customerName,
              },
              email_address: params.customerEmail,
              phone_number: params.customerPhone ? {
                national_number: params.customerPhone.replace(/\D/g, ''),
              } : undefined,
            },
          },
        ],
        application_context: {
          brand_name: 'DigitalWorthyReports',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
          shipping_preference: 'NO_SHIPPING',
        },
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'DigitalWorthyReports',
              locale: 'en-US',
              landing_page: 'LOGIN',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: params.returnUrl,
              cancel_url: params.cancelUrl,
            },
          },
        },
      };

      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/v2/checkout/orders`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': uuidv4(),
        },
        data: orderData,
      });

      logger.info(`PayPal order created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error creating PayPal order:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.config?.data,
      });
      throw new Error(`Failed to create PayPal order: ${error.message}`);
    }
  }

  async captureOrder(orderId: string): Promise<PayPalCapture> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': uuidv4(),
          'Prefer': 'return=representation',
        },
      });

      logger.info(`PayPal order captured: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error capturing PayPal order:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Failed to capture PayPal order: ${error.message}`);
    }
  }

  async getOrderDetails(orderId: string): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error getting PayPal order details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Failed to get PayPal order details: ${error.message}`);
    }
  }

  async refundCapture(captureId: string, amount?: number, currency?: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const refundData: any = {};
      if (amount && currency) {
        refundData.amount = {
          value: amount.toString(),
          currency_code: currency,
        };
      }

      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': uuidv4(),
        },
        data: refundData,
      });

      logger.info(`PayPal capture refunded: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Error refunding PayPal capture:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Failed to refund PayPal capture: ${error.message}`);
    }
  }

  async verifyWebhookSignature(headers: any, body: any): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;

      if (!webhookId) {
        logger.warn('PAYPAL_WEBHOOK_ID not configured, skipping webhook verification');
        return true;
      }

      const verificationData = {
        transmission_id: headers['paypal-transmission-id'],
        transmission_time: headers['paypal-transmission-time'],
        cert_url: headers['paypal-cert-url'],
        auth_algo: headers['paypal-auth-algo'],
        transmission_sig: headers['paypal-transmission-sig'],
        webhook_id: webhookId,
        webhook_event: body,
      };

      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: verificationData,
      });

      const verificationStatus = response.data.verification_status;
      return verificationStatus === 'SUCCESS';
    } catch (error: any) {
      logger.error('Error verifying PayPal webhook signature:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false;
    }
  }
}

export default new PayPalService();
export type { PayPalOrder, PayPalCapture };