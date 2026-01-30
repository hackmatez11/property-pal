import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { authValidation } from '../middlewares/validation';
import validate from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (dealer or guest)
 * @access  Public
 */
router.post(
  '/signup',
  authLimiter,
  authValidation.signUp,
  validate,
  AuthController.signUp
);

/**
 * @route   POST /api/auth/signin
 * @desc    Sign in user
 * @access  Public
 */
router.post(
  '/signin',
  authLimiter,
  authValidation.signIn,
  validate,
  AuthController.signIn
);

/**
 * @route   GET /api/auth/status
 * @desc    Get current auth status
 * @access  Private
 */
router.get(
  '/status',
  authenticate,
  AuthController.getAuthStatus
);

/**
 * @route   GET /api/auth/features
 * @desc    Get feature flags for current user
 * @access  Private
 */
router.get(
  '/features',
  authenticate,
  AuthController.getFeatureFlags
);

export default router;
