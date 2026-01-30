import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/response';
import { CloudinaryUploadResult } from '../types';

export class MediaService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'properties'
  ): Promise<CloudinaryUploadResult> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `real-estate/${folder}`,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        eager: [
          { width: 300, height: 300, crop: 'fill', gravity: 'auto', quality: 'auto:low' },
          { width: 800, height: 600, crop: 'fill', gravity: 'auto', quality: 'auto:good' },
        ],
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        thumbnail_url: result.eager[0].secure_url,
        standard_url: result.eager[1].secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
      };
    } catch (error: any) {
      throw new AppError(500, 'CLOUDINARY_UPLOAD_FAILED', error.message);
    }
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: string = 'properties'
  ): Promise<CloudinaryUploadResult> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `real-estate/${folder}`,
        resource_type: 'video',
        eager: [
          { width: 640, height: 480, crop: 'fill', quality: 'auto:good' },
        ],
        eager_async: true,
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        thumbnail_url: result.secure_url.replace('/upload/', '/upload/so_0/'),
        standard_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
      };
    } catch (error: any) {
      throw new AppError(500, 'CLOUDINARY_UPLOAD_FAILED', error.message);
    }
  }

  async deleteMedia(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      throw new AppError(500, 'CLOUDINARY_DELETE_FAILED', error.message);
    }
  }

  async generateSignedUploadUrl(folder: string = 'properties'): Promise<{
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
  }> {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folderPath = `real-estate/${folder}`;

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder: folderPath,
        },
        cloudinary.config().api_secret!
      );

      return {
        signature,
        timestamp,
        apiKey: cloudinary.config().api_key!,
        cloudName: cloudinary.config().cloud_name!,
        folder: folderPath,
      };
    } catch (error: any) {
      throw new AppError(500, 'SIGNATURE_GENERATION_FAILED', error.message);
    }
  }

  validateImageFile(file: Express.Multer.File): void {
    const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedFormats.includes(file.mimetype)) {
      throw new AppError(400, 'INVALID_FILE_FORMAT', 'Only JPEG, PNG, and WebP images are allowed');
    }

    if (file.size > maxSize) {
      throw new AppError(400, 'FILE_TOO_LARGE', 'Image size must not exceed 10MB');
    }
  }

  validateVideoFile(file: Express.Multer.File): void {
    const allowedFormats = ['video/mp4', 'video/mpeg', 'video/quicktime'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedFormats.includes(file.mimetype)) {
      throw new AppError(400, 'INVALID_FILE_FORMAT', 'Only MP4, MPEG, and MOV videos are allowed');
    }

    if (file.size > maxSize) {
      throw new AppError(400, 'FILE_TOO_LARGE', 'Video size must not exceed 100MB');
    }
  }
}

export default new MediaService();
