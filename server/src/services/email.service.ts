import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOrderConfirmation(
    to: string,
    customerName: string,
    transactionId: string,
    plan: string,
    vin: string,
    paymentLink: string
  ): Promise<boolean> {
    const subject = 'Order Confirmation - Complete Your Payment';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: #39ff14; padding: 20px; text-align: center; }
          .content { background: #f4f4f4; padding: 30px; }
          .button { background: #39ff14; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { background: #333; color: #fff; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Your order for a ${plan} vehicle history report has been created.</p>
            <p><strong>Order ID:</strong> ${transactionId}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>VIN:</strong> ${vin}</p>
            <p><strong>Amount:</strong> $${plan === 'basic' ? '50' : plan === 'silver' ? '80' : '100'}</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentLink}" class="button">Complete Payment Now</a>
            </div>
            
            <p><strong>Important:</strong> Your payment link will expire in 30 minutes.</p>
            <p>After payment, your report will be generated and sent to this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} DigitalWorthyReports. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${options.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  async sendPaymentConfirmation(
    to: string,
    customerName: string,
    transactionId: string,
    amount: number,
    reportType: string,
    vin: string
  ): Promise<boolean> {
    const subject = 'Payment Confirmation - Digital Worthy Reports';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: #39ff14; padding: 20px; text-align: center; }
          .content { background: #f4f4f4; padding: 30px; }
          .button { background: #39ff14; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
          .footer { background: #333; color: #fff; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Your payment has been successfully processed.</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Report Type:</strong> ${reportType}</p>
            <p><strong>VIN:</strong> ${vin}</p>
            <p>Your vehicle history report is being generated and will be sent to you shortly.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Your Reports</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} DigitalWorthyReports. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendReportReady(
    to: string,
    customerName: string,
    reportUrl: string,
    vin: string,
    reportType: string
  ): Promise<boolean> {
    const subject = 'Your Vehicle History Report is Ready';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: #39ff14; padding: 20px; text-align: center; }
          .content { background: #f4f4f4; padding: 30px; }
          .button { background: #39ff14; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
          .footer { background: #333; color: #fff; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Report is Ready!</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Your ${reportType} vehicle history report for VIN <strong>${vin}</strong> is now available.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportUrl}" class="button">Download Your Report</a>
            </div>
            <p>The report will be available for download for 30 days.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} DigitalWorthyReports. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendProcessingNotification(
    to: string,
    customerName: string,
    vin: string
  ): Promise<boolean> {
    const subject = 'Your Report is Being Generated';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: #39ff14; padding: 20px; text-align: center; }
          .content { background: #f4f4f4; padding: 30px; }
          .footer { background: #333; color: #fff; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Processing Your Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>We're currently generating your vehicle history report for VIN <strong>${vin}</strong>.</p>
            <p>This process usually takes 2-3 minutes. You'll receive another email with your report download link once it's ready.</p>
            <p>Thank you for your patience!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} DigitalWorthyReports. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

export default new EmailService();