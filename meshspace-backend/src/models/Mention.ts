import mongoose, { Document, Schema } from 'mongoose';

export interface IMention extends Document {
  post: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  mentionedUser: mongoose.Types.ObjectId;
  mentionedBy: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MentionSchema = new Schema<IMention>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    comment: { type: Schema.Types.ObjectId, ref: 'Comments' },
    mentionedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mentionedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes for performance
MentionSchema.index({ mentionedUser: 1, isRead: 1, createdAt: -1 });
MentionSchema.index({ post: 1 });
MentionSchema.index({ comment: 1 });

export default mongoose.model<IMention>('Mention', MentionSchema);
