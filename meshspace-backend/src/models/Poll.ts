import mongoose, { Schema, Document } from 'mongoose';

export interface IPoll extends Document {
  question: string;
  options: {
    text: string;
    votes: mongoose.Types.ObjectId[];
  }[];
  expiresAt: Date;
  allowMultiple: boolean;
  createdBy: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    votes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  expiresAt: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IPoll, value: Date) {
        return value > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  allowMultiple: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }
}, {
  timestamps: true
});

// Indexes for performance
PollSchema.index({ createdBy: 1 });
PollSchema.index({ expiresAt: 1 });
PollSchema.index({ postId: 1 });

// Virtual for total votes
PollSchema.virtual('totalVotes').get(function(this: IPoll) {
  return this.options.reduce((total, option) => total + option.votes.length, 0);
});

// Virtual for poll status
PollSchema.virtual('isExpired').get(function(this: IPoll) {
  return new Date() > this.expiresAt;
});

// Ensure virtual fields are serialized
PollSchema.set('toJSON', { virtuals: true });
PollSchema.set('toObject', { virtuals: true });

export default mongoose.model<IPoll>('Poll', PollSchema);
