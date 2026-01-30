import { Router } from 'express';
import LeadController from '../controllers/lead.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { leadValidation } from '../middlewares/validation';
import validate from '../middlewares/validate';
import { UserRole } from '../types';

const router = Router();

/**
 * @route   POST /api/leads
 * @desc    Submit a lead inquiry
 * @access  Public
 */
router.post(
  '/',
  leadValidation.create,
  validate,
  LeadController.create
);

/**
 * @route   GET /api/leads
 * @desc    Get dealer's leads
 * @access  Private (Dealer only)
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.DEALER),
  leadValidation.list,
  validate,
  LeadController.list
);

/**
 * @route   PUT /api/leads/:id/status
 * @desc    Update lead status
 * @access  Private (Dealer only)
 */
router.put(
  '/:id/status',
  authenticate,
  authorize(UserRole.DEALER),
  LeadController.updateStatus
);

/**
 * @route   GET /api/leads/analytics
 * @desc    Get lead analytics
 * @access  Private (Dealer only - Premium+)
 */
router.get(
  '/analytics',
  authenticate,
  authorize(UserRole.DEALER),
  LeadController.getAnalytics
);

export default router;
