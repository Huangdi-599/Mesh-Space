import { Request, Response, RequestHandler } from 'express';
import User from '../models/User';
import { createNotification } from './notificationController';
import { Types } from 'mongoose';

export const getMe: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password -refreshToken');
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    res.json({ status: 'success', message: 'User fetched successfully', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    if (username) user.username = username;
    if (email) user.email = email.toLowerCase();
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ status: 'success', message: 'Profile updated', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const followUser: RequestHandler = async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const { userId: targetUserId } = req.params;
    if (currentUserId === targetUserId) {
      res.status(400).json({ status: 'error', message: 'Cannot follow yourself' });
      return;
    }
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);
    if (!targetUser || !currentUser) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    // Use .toString() to compare ObjectId and string
    if (targetUser.followers.some(id => id.toString() === currentUserId)) {
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    } else {
      // Ensure ObjectId is pushed, not string
      targetUser.followers.push(currentUser._id as Types.ObjectId);
      currentUser.following.push(targetUser._id as Types.ObjectId);
    }
    await targetUser.save();
    await currentUser.save();
    await createNotification({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'follow',
      message: `${currentUser.username} started following you`
    });
    res.json({
      status: 'success',
      message: targetUser.followers.map(id => id.toString()).includes(currentUserId)
        ? 'Followed successfully'
        : 'Unfollowed successfully',
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const getFollowers: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('followers', 'username email');
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    res.json({ status: 'success', data: user.followers });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const getFollowing: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('following', 'username email');
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    res.json({ status: 'success', data: user.following });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const getUserByIdController: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [error instanceof Error ? error.message : String(error)] });
  }
};

