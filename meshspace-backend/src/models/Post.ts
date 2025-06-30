import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  repost?: mongoose.Types.ObjectId;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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

export default mongoose.model<IPost>('Post', PostSchema);