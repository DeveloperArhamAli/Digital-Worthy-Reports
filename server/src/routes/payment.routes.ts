import express from 'express';
import PaymentController from '../controllers/payment.controller';
import ReportController from '../controllers/report.controller';
import { body, param } from 'express-validator';

const router = express.Router();

// Create order
router.post(
  '/create-order',
  [
    body('plan').isIn(['basic', 'silver', 'gold']).withMessage('Invalid plan type'),
    body('vin').isLength({ min: 17, max: 17 }).withMessage('VIN must be 17 characters'),
    body('customer.name').notEmpty().withMessage('Customer name is required'),
    body('customer.email').isEmail().withMessage('Valid email is required'),
    body('customer.phone').optional().isString()
  ],
  PaymentController.createOrder
);

// Verify payment
router.get(
  '/verify-payment/:orderId',
  [
    param('orderId').isMongoId().withMessage('Invalid order ID')
  ],
  PaymentController.verifyPayment
);

// Process payment success and generate report
router.post(
  '/process-payment',
  [
    body('orderId').isMongoId().withMessage('Invalid order ID')
  ],
  PaymentController.processPaymentSuccess
);

// Get order status
router.get(
  '/order-status/:orderId',
  [
    param('orderId').isMongoId().withMessage('Invalid order ID')
  ],
  PaymentController.getOrderStatus
);

// Get payment by transaction ID
router.get(
  '/payment/:transactionId',
  [
    param('transactionId').isString().notEmpty().withMessage('Transaction ID is required')
  ],
  PaymentController.getPaymentByTransaction
);

// Stripe webhook
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

// Report routes
router.get(
  '/report/:reportId',
  [
    param('reportId').isMongoId().withMessage('Invalid report ID')
  ],
  ReportController.getReport
);

router.get(
  '/report/download/:reportId',
  [
    param('reportId').isMongoId().withMessage('Invalid report ID')
  ],
  ReportController.downloadReport
);

router.get(
  '/report/transaction/:transactionId',
  [
    param('transactionId').isString().notEmpty().withMessage('Transaction ID is required')
  ],
  ReportController.getReportByTransaction
);

export default router;