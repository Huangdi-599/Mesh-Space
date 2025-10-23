import mongoose, { Schema, Document } from 'mongoose';

export interface IHashtag extends Document {
  name: string;
  postCount: number;
  trendingScore: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HashtagSchema = new Schema<IHashtag>({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 50
  },
  postCount: {
    type: Number,
    default: 0,
    min: 0
  },
  trendingScore: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
HashtagSchema.index({ name: 1 });
HashtagSchema.index({ trendingScore: -1 });
HashtagSchema.index({ postCount: -1 });
HashtagSchema.index({ lastUsed: -1 });

// Virtual for trending status
HashtagSchema.virtual('isTrending').get(function(this: IHashtag) {
  return this.trendingScore > 10; // Threshold for trending
});

// Ensure virtual fields are serialized
HashtagSchema.set('toJSON', { virtuals: true });
HashtagSchema.set('toObject', { virtuals: true });

export default mongoose.model<IHashtag>('Hashtag', HashtagSchema);
