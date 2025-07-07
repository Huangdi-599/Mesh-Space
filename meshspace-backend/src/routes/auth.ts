// src/routes/auth.ts
import express from 'express';
import { register, verifyEmail, login, forgotPassword, resetPassword, resendVerificationEmail } from '../controllers/authController';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification', resendVerificationEmail);

export default router;