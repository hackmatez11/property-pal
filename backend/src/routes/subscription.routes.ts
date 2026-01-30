import { Router } from 'express';
import SubscriptionController from '../controllers/subscription.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { subscriptionValidation } from '../middlewares/validation';
import validate from '../middlewares/validate';
import { UserRole } from '../types';

const router = Router();

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private (Dealer only)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.DEALER),
  subscriptionValidation.create,
  validate,
  SubscriptionController.create
);

/**
 * @route   GET /api/subscriptions/me
 * @desc    Get current user's subscription
 * @access  Private (Dealer only)
 */
router.get(
  '/me',
  authenticate,
  authorize(UserRole.DEALER),
  SubscriptionController.get
);

/**
 * @route   DELETE /api/subscriptions/:id
 * @desc    Cancel subscription
 * @access  Private (Dealer only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.DEALER),
  subscriptionValidation.cancel,
  validate,
  SubscriptionController.cancel
);

/**
 * @route   POST /api/subscriptions/webhook
 * @desc    Handle Stripe webhooks
 * @access  Public (Stripe only)
 */
router.post('/webhook', SubscriptionController.webhook);

export default router;
