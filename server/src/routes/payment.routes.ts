import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';
import ReportController from '../controllers/report.controller';
import express from 'express';

const router = Router();

// Middleware for webhooks (raw body required)
const stripeWebhookMiddleware = express.raw({ type: 'application/json' });
const paypalWebhookMiddleware = express.json();

// Payment routes
router.post('/create-payment-intent', PaymentController.createPaymentIntent);
router.post('/create-paypal-order', PaymentController.createPayPalOrder);
router.post('/capture-paypal-order', PaymentController.capturePayPalOrder);
router.post('/process-payment-success', PaymentController.processPaymentSuccess);
router.get('/payment/:transactionId', PaymentController.getPaymentStatus);
router.get('/payments/:email', PaymentController.getCustomerPayments);
router.post('/refund', PaymentController.refundPayment);
router.get('/payment/verify/:paymentId', PaymentController.verifyPayment);
router.get('/payment/details/:paymentId', PaymentController.getPaymentDetails);

// Report routes
router.post('/generate-preview', ReportController.generatePreview);
router.post('/generate-report', ReportController.generateFullReport);
router.get('/report/:reportId', ReportController.getReport);
router.get('/report/download/:reportId', ReportController.downloadReport);
router.get('/report/transaction/:transactionId', ReportController.getReportByTransaction);

// Webhook routes
router.post('/webhook/stripe', stripeWebhookMiddleware, PaymentController.handleStripeWebhook);
router.post('/webhook/paypal', paypalWebhookMiddleware, PaymentController.handlePayPalWebhook);

export default router;