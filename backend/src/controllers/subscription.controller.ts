import { Response, NextFunction } from 'express';
import SubscriptionService from '../services/subscription.service';
import { createSuccessResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { config } from '../config';
import stripe from '../config/stripe';

export class SubscriptionController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { plan, paymentMethodId } = req.body;

      const subscription = await SubscriptionService.createSubscription(
        userId,
        plan,
        paymentMethodId
      );

      res.status(201).json(createSuccessResponse(subscription));
    } catch (error) {
      next(error);
    }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const subscription = await SubscriptionService.getSubscription(userId);

      res.json(createSuccessResponse(subscription));
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await SubscriptionService.cancelSubscription(userId, id);

      res.json(createSuccessResponse({ message: 'Subscription cancelled successfully' }));
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'] as string;

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          config.stripe.webhookSecret
        );
      } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      await SubscriptionService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}

export default new SubscriptionController();
