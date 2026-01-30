import { Router } from 'express';
import MediaController, { uploadMiddleware } from '../controllers/media.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadLimiter } from '../middlewares/rateLimiter';
import { UserRole } from '../types';

const router = Router();

/**
 * @route   POST /api/media/upload/image
 * @desc    Upload image to Cloudinary
 * @access  Private (Dealer only)
 */
router.post(
  '/upload/image',
  authenticate,
  authorize(UserRole.DEALER),
  uploadLimiter,
  uploadMiddleware,
  MediaController.uploadImage
);

/**
 * @route   POST /api/media/upload/video
 * @desc    Upload video to Cloudinary
 * @access  Private (Dealer only)
 */
router.post(
  '/upload/video',
  authenticate,
  authorize(UserRole.DEALER),
  uploadLimiter,
  uploadMiddleware,
  MediaController.uploadVideo
);

/**
 * @route   GET /api/media/signature
 * @desc    Get signed upload URL for client-side uploads
 * @access  Private (Dealer only)
 */
router.get(
  '/signature',
  authenticate,
  authorize(UserRole.DEALER),
  MediaController.getSignature
);

/**
 * @route   DELETE /api/media/:publicId
 * @desc    Delete media from Cloudinary
 * @access  Private (Dealer only)
 */
router.delete(
  '/:publicId',
  authenticate,
  authorize(UserRole.DEALER),
  MediaController.delete
);

export default router;
