import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOrderConfirmation(
    to: string,
    name: string,
    orderId: string,
    plan: string,
    vin: string,
    paymentUrl: string
  ): Promise<void> {
    try {
      const subject = `Order Confirmation - Vehicle History Report #${orderId}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
            <h1>Order Confirmation</h1>
            <p>Vehicle History Report</p>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2>Hi ${name},</h2>
            <p>Thank you for your order! Your vehicle history report request has been received.</p>
            
            <div style="background-color: white; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Package:</strong> ${plan.toUpperCase()}</p>
              <p><strong>VIN:</strong> ${vin.toUpperCase()}</p>
              <p><strong>Status:</strong> Awaiting Payment</p>
            </div>
            
            <p>To complete your purchase and generate your report, please click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Complete Payment Now
              </a>
            </div>
            
            <p>Best regards,<br>The Digital Worthy Reports Team</p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"Digital Worthy Reports" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });

      logger.info(`Order confirmation sent to ${to}`);
    } catch (error) {
      logger.error('Error sending order confirmation:', error);
    }
  }

  async sendPaymentConfirmation(
    to: string,
    name: string,
    transactionId: string,
    amount: number,
    reportType: string,
    vin: string
  ): Promise<void> {
    try {
      const subject = `Payment Confirmed - Report #${transactionId}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
            <h1>Payment Confirmed!</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <div style="background-color: #D1FAE5; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0;">
              <h3 style="margin: 0; color: #065F46;">✓ Payment Successful</h3>
            </div>
            
            <h2>Hi ${name},</h2>
            <p>Thank you for your payment! We're now generating your vehicle history report.</p>
            
            <div style="background-color: white; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
              <h3>Payment Details</h3>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Amount:</strong> $${amount}</p>
              <p><strong>Package:</strong> ${reportType.toUpperCase()}</p>
              <p><strong>VIN:</strong> ${vin.toUpperCase()}</p>
            </div>
            
            <p>Your report will be sent to this email address within minutes.</p>
            
            <p>Best regards,<br>The Digital Worthy Reports Team</p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"Digital Worthy Reports" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });

      logger.info(`Payment confirmation sent to ${to}`);
    } catch (error) {
      logger.error('Error sending payment confirmation:', error);
    }
  }

  async sendReportReady(
    to: string,
    name: string,
    reportUrl: string,
    vin: string,
    reportType: string
  ): Promise<void> {
    try {
      const subject = `Your Vehicle History Report is Ready!`;
      const reportId = reportUrl.split('/').pop()?.replace('.pdf', '') || 'N/A';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
            <h1>Your Report is Ready!</h1>
            <p>Vehicle History Report #${reportId}</p>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2>Hi ${name},</h2>
            <p>Your comprehensive vehicle history report has been generated and is ready for download.</p>
            
            <div style="background-color: white; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
              <h3>Report Details</h3>
              <p><strong>Report ID:</strong> ${reportId}</p>
              <p><strong>VIN:</strong> ${vin.toUpperCase()}</p>
              <p><strong>Package:</strong> ${reportType.toUpperCase()}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Expires:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Download Your Report
              </a>
            </div>
            
            <p>This report will be available for 30 days. Please download and save a copy for your records.</p>
            
            <p>Best regards,<br>The Digital Worthy Reports Team</p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"Digital Worthy Reports" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });

      logger.info(`Report ready email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending report ready email:', error);
    }
  }
}

export default new EmailService();