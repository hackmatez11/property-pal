import { Response, NextFunction } from 'express';
import multer from 'multer';
import MediaService from '../services/media.service';
import { createSuccessResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

const upload = multer({ dest: 'uploads/' });

export class MediaController {
  async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No file uploaded' },
        });
      }

      MediaService.validateImageFile(req.file);

      const result = await MediaService.uploadImage(req.file);

      res.json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async uploadVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No file uploaded' },
        });
      }

      MediaService.validateVideoFile(req.file);

      const result = await MediaService.uploadVideo(req.file);

      res.json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getSignature(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { folder } = req.query;

      const signature = await MediaService.generateSignedUploadUrl(folder as string);

      res.json(createSuccessResponse(signature));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { publicId } = req.params;

      await MediaService.deleteMedia(publicId);

      res.json(createSuccessResponse({ message: 'Media deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }
}

export const uploadMiddleware = upload.single('file');
export default new MediaController();
