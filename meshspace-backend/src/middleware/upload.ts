import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';
import { FileFilterCallback } from 'multer';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'meshspace/posts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  }),
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  // Accept image files only
  if (!file.mimetype.startsWith('image/')) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed!'));
    return;
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
