// src/routes/auth.ts
import express from 'express';
import { register, verifyEmail, login, refresh, logout } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);


export default router;