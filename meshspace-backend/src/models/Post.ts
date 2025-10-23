import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  likes: mongoose.Types.ObjectId[];
  reactions: Array<{
    user: mongoose.Types.ObjectId;
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'celebrate';
  }>;
  createdAt: Date;
  updatedAt: Date;
  repost?: mongoose.Types.ObjectId;
  reactionCounts: Record<string, number>;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: false },
    imageUrl: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reactions: [{
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      type: { 
        type: String, 
        enum: ['like', 'love', 'laugh', 'wow', 'sad', 'celebrate'],
        required: true 
      }
    }],
    repost: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
  },
  { timestamps: true }
);

PostSchema.virtual('repostCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'repost',
  count: true
});

// Virtual for reaction counts by type
PostSchema.virtual('reactionCounts').get(function() {
  const counts: Record<string, number> = {};
  this.reactions.forEach((reaction: any) => {
    counts[reaction.type] = (counts[reaction.type] || 0) + 1;
  });
  return counts;
});

export default mongoose.model<IPost>('Post', PostSchema);