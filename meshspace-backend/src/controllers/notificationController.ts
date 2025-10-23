import { Request, Response, RequestHandler } from 'express';
import Notification from '../models/Notification';

export const getNotifications: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20; // Limit to 20 notifications
    const skip = parseInt(req.query.skip as string) || 0;
    
    const notifications = await Notification.find({ recipient: req.user?.userId })
      .populate('sender', 'username avatar')
      .populate('post', '_id content')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean(); // Use lean() for better performance

    // Add cache headers for better performance
    res.set({
      'Cache-Control': 'private, max-age=10', // Cache for 10 seconds
      'ETag': `"notifications-${req.user?.userId}-${Date.now()}"`
    });

    res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications', errors: [error instanceof Error ? error.message : String(error)] });
  }
};

export const markNotificationAsRead: RequestHandler = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ status: 'error', message: 'Notification not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: notification });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update notification', errors: [error instanceof Error ? error.message : String(error)] });
  }
};

export const createNotification = async ({ recipient, sender, type, post, message }: {
  recipient: string;
  sender: string;
  type: 'like' | 'comment' | 'follow' | 'reply' | 'repost' | 'mention';
  post?: string;
  message: string;
}) => {
  try {
    const notification = await Notification.create({ recipient, sender, type, post, message });
    // Note: Real-time notifications removed for Vercel compatibility
    // Notifications will be fetched via polling in the frontend
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
