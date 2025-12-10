import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const emailService = {
  // Send report email
  async sendReportEmail(
    to: string,
    customerName: string,
    vin: string,
    reportUrl: string,
    reportType: string
  ) {
    const response = await axios.post(`${API_URL}/send-report-email`, {
      to,
      customerName,
      vin,
      reportUrl,
      reportType,
      subject: `Your Vehicle History Report - ${vin}`,
      template: 'report-delivery'
    });
    return response.data;
  },

  // Send payment confirmation
  async sendPaymentConfirmation(
    to: string,
    customerName: string,
    amount: number,
    transactionId: string
  ) {
    const response = await axios.post(`${API_URL}/send-payment-confirmation`, {
      to,
      customerName,
      amount,
      transactionId,
      subject: 'Payment Confirmation - DigitalWorthyReports'
    });
    return response.data;
  },

  // Send report processing notification
  async sendProcessingNotification(
    to: string,
    customerName: string,
    vin: string,
    estimatedTime: string
  ) {
    const response = await axios.post(`${API_URL}/send-processing-notification`, {
      to,
      customerName,
      vin,
      estimatedTime,
      subject: 'Your Report is Being Generated'
    });
    return response.data;
  }
};

export default emailService;