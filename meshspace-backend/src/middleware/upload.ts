import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'meshspace/posts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  }),
});

export const upload = multer({ storage });
