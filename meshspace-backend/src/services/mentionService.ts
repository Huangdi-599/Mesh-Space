import Mention from '../models/Mention';
import Notification from '../models/Notification';
import User from '../models/User';

export class MentionService {
  /**
   * Extract mentions from text content
   */
  static extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return [...new Set(mentions)]; // Remove duplicates
  }

  /**
   * Process mentions in a post or comment
   */
  static async processMentions(
    content: string,
    postId: string,
    commentId: string | null,
    mentionedBy: string
  ): Promise<void> {
    const usernames = this.extractMentions(content);
    
    if (usernames.length === 0) return;

    // Find users by username
    const users = await User.find({ username: { $in: usernames } });
    
    for (const user of users) {
      const userId = (user as { _id: any })._id;
      if (userId.toString() === mentionedBy) continue;

      // Create mention record
      await Mention.create({
        post: postId,
        comment: commentId,
        mentionedUser: user._id,
        mentionedBy: mentionedBy
      });

      // Create notification
      await Notification.create({
        recipient: user._id,
        sender: mentionedBy,
        type: 'mention',
        post: postId,
        comment: commentId,
        message: `You were mentioned in a ${commentId ? 'comment' : 'post'}`
      });
    }
  }

  /**
   * Get user mentions
   */
  static async getUserMentions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    
    const mentions = await Mention.find({ mentionedUser: userId })
      .populate('post', 'content author createdAt')
      .populate('comment', 'text author createdAt')
      .populate('mentionedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Mention.countDocuments({ mentionedUser: userId });

    return {
      mentions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Mark mentions as read
   */
  static async markMentionsAsRead(userId: string, mentionIds: string[]): Promise<void> {
    await Mention.updateMany(
      { 
        _id: { $in: mentionIds },
        mentionedUser: userId 
      },
      { isRead: true }
    );
  }

  /**
   * Get unread mention count
   */
  static async getUnreadMentionCount(userId: string): Promise<number> {
    return await Mention.countDocuments({ 
      mentionedUser: userId, 
      isRead: false 
    });
  }
}
