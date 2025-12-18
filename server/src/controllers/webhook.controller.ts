import { Request, Response } from 'express';
import PaymentService from '../services/payment.service';
import { logger } from '../utils/logger';

class WebhookController {
  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      if (!signature) {
        res.status(400).json({ error: 'Missing stripe signature' });
        return;
      }

      await PaymentService.handleStripeWebhook(signature, payload);

      res.json({ received: true });
    } catch (error) {
      logger.error('Error handling Stripe webhook:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  }
}

export default new WebhookController();