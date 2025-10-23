import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAchievement extends Document {
  user: mongoose.Types.ObjectId;
  achievement: mongoose.Types.ObjectId;
  earnedAt: Date;
  points: number;
  isNotified: boolean;
}

const UserAchievementSchema = new Schema<IUserAchievement>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  points: {
    type: Number,
    required: true
  },
  isNotified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
UserAchievementSchema.index({ user: 1 });
UserAchievementSchema.index({ achievement: 1 });
UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
UserAchievementSchema.index({ earnedAt: -1 });

export default mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
