// src/controllers/authController.ts
import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendVerificationEmail } from '../services/emailService';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email: normalizedEmail, password: hashedPassword, avatar });

    const emailToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' });
    await sendVerificationEmail(normalizedEmail, emailToken);

    res.status(201).json({ status: 'success', message: 'User registered. Check email to verify account.' });
  } catch (err) {
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
    if (!user.isVerified) {
      res.status(403).json({ status: 'error', message: 'Email not verified' });
      return;
    }
    const userId = typeof user._id === 'string' ? user._id : String(user._id);
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({ status: 'success', message: 'Login successful', data: { accessToken } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const refresh: RequestHandler = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ status: 'error', message: 'No token provided' });
      return;
    }
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      res.status(403).json({ status: 'error', message: 'Invalid refresh token' });
      return;
    }
    const userId = typeof user._id === 'string' ? user._id : String(user._id);
    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);
    user.refreshToken = newRefreshToken;
    await user.save();
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({ status: 'success', message: 'Token refreshed', data: { accessToken: newAccessToken } });
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Token expired or invalid', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(200).json({ status: 'success', message: 'Already logged out' });
      return;
    }
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = '';
      await user.save();
    }
    res.clearCookie('refreshToken');
    res.json({ status: 'success', message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};