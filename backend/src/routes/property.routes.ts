import { Router } from 'express';
import PropertyController from '../controllers/property.controller';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth';
import { propertyValidation } from '../middlewares/validation';
import validate from '../middlewares/validate';
import { UserRole } from '../types';
import { searchLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @route   POST /api/properties
 * @desc    Create a new property
 * @access  Private (Dealer only)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.DEALER),
  propertyValidation.create,
  validate,
  PropertyController.create
);

/**
 * @route   GET /api/properties
 * @desc    List properties with filters
 * @access  Public (with optional auth for dealer's drafts)
 */
router.get(
  '/',
  optionalAuth,
  searchLimiter,
  propertyValidation.list,
  validate,
  PropertyController.list
);

/**
 * @route   GET /api/properties/my-properties
 * @desc    Get dealer's properties
 * @access  Private (Dealer only)
 */
router.get(
  '/my-properties',
  authenticate,
  authorize(UserRole.DEALER),
  PropertyController.getDealerProperties
);

/**
 * @route   GET /api/properties/:id
 * @desc    Get property by ID
 * @access  Public (with optional auth)
 */
router.get(
  '/:id',
  optionalAuth,
  propertyValidation.get,
  validate,
  PropertyController.get
);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property
 * @access  Private (Dealer only - owner)
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.DEALER),
  propertyValidation.update,
  validate,
  PropertyController.update
);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete (archive) property
 * @access  Private (Dealer only - owner)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.DEALER),
  propertyValidation.delete,
  validate,
  PropertyController.delete
);

export default router;
