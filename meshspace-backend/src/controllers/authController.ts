// src/controllers/authController.ts
import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendVerificationEmail, sendEmail } from '../services/emailService';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'Account already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Use Cloudinary URL if file uploaded, else fallback to body
    const avatar = req.file ? (req.file as any).path : req.body.avatar;
    const newUser = await User.create({ username, email: normalizedEmail, password: hashedPassword, avatar });

    const emailToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' });
    // Try to send verification email, but don't block registration if it fails
    try {
      await sendVerificationEmail(normalizedEmail, emailToken);
    } catch (emailErr) {
      console.error('Failed to send verification email after registration:', emailErr);
      // Optionally, you could add a warning message in the response
    }
    res.status(201).json({ status: 'success', message: 'User registered. Check email to verify account.' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const token = req.body.token as string;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(400).json({ status: 'error', message: 'Invalid verification link' });
      return;
    }
    user.isVerified = true;
    await user.save();
    res.json({ status: 'success', message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Invalid or expired token', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }
    // if (!user.isVerified) {
    //   res.status(403).json({ status: 'error', message: 'Email not verified' });
    //   return;
    // }
    const userId = typeof user._id === 'string' ? user._id : String(user._id);
    const accessToken = generateAccessToken(userId);
    res.json({ status: 'success', message: 'Login successful', data: { accessToken } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(200).json({ status: 'success', message: 'If that email exists, a reset link has been sent.' });
    return;
  }
  const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail(user.email, 'Reset your password', `<p>Click <a href='${resetUrl}'>here</a> to reset your password. This link expires in 1 hour.</p>`);
  res.status(200).json({ status: 'success', message: 'If that email exists, a reset link has been sent.' });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(400).json({ status: 'error', message: 'Invalid or expired token' });
      return;
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({ status: 'success', message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Invalid or expired token' });
  }
};

export const resendVerificationEmail: RequestHandler = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ status: 'error', message: 'Email is required' });
    return;
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({ status: 'error', message: 'Account already verified' });
      return;
    }
    const emailToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' });
    await sendVerificationEmail(user.email, emailToken);
    res.status(200).json({ status: 'success', message: 'Verification email resent' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to resend verification email', errors: [err instanceof Error ? err.message : String(err)] });
  }
};