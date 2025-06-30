import { Request, Response, RequestHandler } from 'express';
import Notification from '../models/Notification';
import { emitNotification } from '../utils/socket';

export const getNotifications: RequestHandler = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user?.userId })
      .populate('sender', 'username')
      .populate('post', '_id')
      .sort({ createdAt: -1 });

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
    emitNotification(recipient, notification);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
