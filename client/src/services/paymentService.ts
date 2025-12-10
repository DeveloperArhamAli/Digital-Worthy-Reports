import axios from 'axios';
import { CustomerInfo } from '../types/payment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const paymentService = {
  // Create Stripe payment intent
  async createPaymentIntent(amount: number, currency: string, customer: CustomerInfo, reportType: string) {
    const response = await axios.post(`${API_URL}/create-payment-intent`, {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer,
      reportType,
      metadata: {
        vin: customer.vin,
        reportType,
        customerEmail: customer.email
      }
    });
    return response.data;
  },

  // Create PayPal order
  async createPayPalOrder(amount: number, currency: string, customer: CustomerInfo, reportType: string) {
    const response = await axios.post(`${API_URL}/create-paypal-order`, {
      amount,
      currency,
      customer,
      reportType,
      description: `Vehicle History Report - ${reportType}`
    });
    return response.data;
  },

  // Capture PayPal payment
  async capturePayPalOrder(orderId: string, customer: CustomerInfo, reportType: string) {
    const response = await axios.post(`${API_URL}/capture-paypal-order`, {
      orderId,
      customer,
      reportType
    });
    return response.data;
  },

  // Process payment success (backend webhook handler)
  async processPaymentSuccess(data: {
    paymentIntentId: string;
    amount: number;
    customer: CustomerInfo;
    reportType: string;
  }) {
    const response = await axios.post(`${API_URL}/process-payment-success`, data);
    return response.data;
  },

  // Generate report preview (free)
  async generatePreview(vin: string) {
    const response = await axios.post(`${API_URL}/generate-preview`, { vin });
    return response.data;
  },

  // Generate full report (after payment)
  async generateFullReport(transactionId: string, customer: CustomerInfo, reportType: string) {
    const response = await axios.post(`${API_URL}/generate-report`, {
      transactionId,
      customer,
      reportType
    });
    return response.data;
  }
};

export default paymentService;