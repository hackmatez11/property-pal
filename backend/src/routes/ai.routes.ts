import { Router } from 'express';
import AIController from '../controllers/ai.controller';
import { aiSearchValidation } from '../middlewares/validation';
import validate from '../middlewares/validate';
import { searchLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @route   POST /api/ai/search
 * @desc    Natural language property search
 * @access  Public
 */
router.post(
  '/search',
  searchLimiter,
  aiSearchValidation.search,
  validate,
  AIController.search
);

/**
 * @route   GET /api/ai/suggestions
 * @desc    Get search suggestions
 * @access  Public
 */
router.get(
  '/suggestions',
  AIController.suggestions
);

export default router;
