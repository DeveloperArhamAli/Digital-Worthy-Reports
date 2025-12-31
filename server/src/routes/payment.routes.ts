import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';
import ReportController from '../controllers/report.controller';
import StripeLinkController from '../controllers/stripeLink.controller';
import express from 'express';

const router = Router();

// Middleware for webhooks
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

// Stripe Link routes
router.post('/create-order', StripeLinkController.createOrder);
router.get('/verify-payment/:orderId', StripeLinkController.verifyPayment);
router.post('/process-payment-success', StripeLinkController.processPaymentSuccess);
router.get('/order-status/:orderId', StripeLinkController.getOrderStatus);
router.post('/webhook-callback', StripeLinkController.webhookCallback);

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