import mongoose from 'mongoose';
import Post from '../models/Post';
import Comments from '../models/Comments';
import User from '../models/User';
import Notification from '../models/Notification';

// Database indexes for performance optimization
export const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');

    // Post indexes
    await Post.collection.createIndex({ author: 1, createdAt: -1 });
    await Post.collection.createIndex({ likes: 1 });
    await Post.collection.createIndex({ repost: 1 });
    await Post.collection.createIndex({ createdAt: -1 });

    // Comments indexes
    await Comments.collection.createIndex({ post: 1, createdAt: 1 });
    await Comments.collection.createIndex({ author: 1 });
    await Comments.collection.createIndex({ parentComment: 1 });

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ followers: 1 });
    await User.collection.createIndex({ following: 1 });

    // Notification indexes
    await Notification.collection.createIndex({ recipient: 1, createdAt: -1 });
    await Notification.collection.createIndex({ sender: 1 });
    await Notification.collection.createIndex({ isRead: 1 });
    await Notification.collection.createIndex({ type: 1 });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

// Compound indexes for complex queries
export const createCompoundIndexes = async () => {
  try {
    console.log('Creating compound indexes...');

    // Feed query optimization
    await Post.collection.createIndex({ 
      author: 1, 
      createdAt: -1 
    });

    // Trending posts optimization
    await Post.collection.createIndex({ 
      likes: 1, 
      createdAt: -1 
    });

    // User activity optimization
    await Post.collection.createIndex({ 
      author: 1, 
      createdAt: -1, 
      repost: 1 
    });

    // Comment threading optimization
    await Comments.collection.createIndex({ 
      post: 1, 
      parentComment: 1, 
      createdAt: 1 
    });

    // Notification optimization
    await Notification.collection.createIndex({ 
      recipient: 1, 
      isRead: 1, 
      createdAt: -1 
    });

    console.log('Compound indexes created successfully');
  } catch (error) {
    console.error('Error creating compound indexes:', error);
  }
};

// Text search indexes
export const createTextIndexes = async () => {
  try {
    console.log('Creating text search indexes...');

    // Full-text search for posts
    await Post.collection.createIndex({ 
      content: 'text',
      'author.username': 'text'
    });

    // Full-text search for comments
    await Comments.collection.createIndex({ 
      text: 'text'
    });

    // Full-text search for users
    await User.collection.createIndex({ 
      username: 'text'
    });

    console.log('Text search indexes created successfully');
  } catch (error) {
    console.error('Error creating text search indexes:', error);
  }
};

// Initialize all indexes
export const initializeIndexes = async () => {
  try {
    await createIndexes();
    await createCompoundIndexes();
    await createTextIndexes();
    console.log('All database indexes initialized successfully');
  } catch (error) {
    console.error('Error initializing indexes:', error);
  }
};
