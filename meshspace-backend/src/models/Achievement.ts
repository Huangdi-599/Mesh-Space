import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'content' | 'engagement' | 'milestone' | 'special';
  requirements: {
    type: 'posts' | 'likes_received' | 'likes_given' | 'comments' | 'followers' | 'days_active' | 'streak' | 'custom';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['social', 'content', 'engagement', 'milestone', 'special'],
    required: true
  },
  requirements: {
    type: {
      type: String,
      enum: ['posts', 'likes_received', 'likes_given', 'comments', 'followers', 'days_active', 'streak', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 1
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all_time'],
      default: 'all_time'
    }
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
AchievementSchema.index({ category: 1 });
AchievementSchema.index({ rarity: 1 });
AchievementSchema.index({ isActive: 1 });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
