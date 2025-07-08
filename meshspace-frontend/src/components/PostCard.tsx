import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { likePost, addComment, repostPost, getComments } from '@/services/post.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from 'react-tooltip';
import { Link, useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { useAuth } from '@/hooks/useAuth';

export interface Post {
  _id: string;
  author: { _id: string; username: string; avatar?: string };
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: string[];
  repost?: Post;
  repostCount?: number;
  likesCount?: number;
  trending?: boolean;
  isFollowing?: boolean;
  commentCount?: number;
}

interface Comment {
  _id: string;
  author: { _id: string; username: string; avatar?: string };
  text: string;
  createdAt: string;
  replies?: Comment[];
}

interface PostCardProps {
  post: Post;
  showAllCommentsButton?: boolean;
  detailPage?: boolean;
}

const PostCard = ({ post, showAllCommentsButton = false, detailPage=false}: PostCardProps) => {
  const queryClient = useQueryClient();
  const {user} = useAuth()
  const [comment, setComment] = useState('');
  const [optimisticLikes, setOptimisticLikes] = useState(post.likes.length);
  const [hasLiked, setHasLiked] = useState(post.likes.includes(user?._id as string));
  const [repostDialogOpen, setRepostDialogOpen] = useState(false);
  const [quote, setQuote] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setHasLiked(post.likes.includes(user?._id as string));
  }, [post.likes,user]);

  const likeMutation = useMutation({
    mutationFn: () => likePost(post._id),
    onMutate: async () => {
      setHasLiked(prev => {
        setOptimisticLikes(count => prev ? count - 1 : count + 1);
        return !prev;
      });
    },
    onError: (error: unknown) => {
      setHasLiked(prev => {
        setOptimisticLikes(count => prev ? count - 1 : count + 1);
        return !prev;
      });
      toast.error(error instanceof Error ? error.message : 'Failed to like post');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      const message = data?.message || (hasLiked ? 'Like removed' : 'Post liked');
      toast.success(message);
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['comments', post._id],
    queryFn: () => getComments(post._id),
    select:(data)=> {
      console.log(data)
      return data
    },
  });
  console.log(hasLiked)

  const commentMutation = useMutation({
    mutationFn: () => addComment(post._id, comment),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      refetchComments();
      toast.success('Comment added!');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    },
  });

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const replyMutation = useMutation({
    mutationFn: ({ parentComment, text }: { parentComment: string; text: string }) =>
      addComment(post._id, text, parentComment),
    onSuccess: () => {
      setReplyingTo(null);
      setReplyText('');
      refetchComments();
      toast.success('Reply added!');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add reply');
    },
  });

  const repostMutation = useMutation({
    mutationFn: (quote?: string) => repostPost(post._id, quote),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success(data?.message || 'Reposted!');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to repost');
    },
  });


  // Helper to toggle replies
  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to find the parent username for a reply
  const findParentUsername = (parentId: string, allComments: Comment[]): string | null => {
    for (const c of allComments) {
      if (c._id === parentId) return c.author.username;
      if (c.replies) {
        const found = findParentUsername(parentId, c.replies);
        if (found) return found;
      }
    }
    return null;
  };

  const renderComments = (comments: Comment[], depth = 0, parentId: string | null = null, allTopLevel: Comment[] = comments) => {
    // Only show 1 top-level comment by default
    const dashComments = depth === 0 ? comments.slice(0, 1) : comments;
    const visibleComments = detailPage ? comments : dashComments;
    return (
      <ul className={depth === 0 ? 'mt-4 space-y-2' : 'ml-6 pl-4 border-l space-y-2'}>
        {visibleComments.map((c, idx) => (
          <li
            key={c._id}
            className={`bg-muted rounded p-2 transition-all duration-300 relative ${replyingTo === c._id ? 'ring-2 ring-primary/40' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Avatar className="size-9">
                {c.author.avatar && <AvatarImage src={c.author.avatar} alt={c.author.username} />}
                <AvatarFallback>{c.author.username[0]}</AvatarFallback>
              </Avatar>
              <Link to={`/profile/${c.author._id}`} className="font-medium hover:underline text-primary">
                {c.author.username}
              </Link>
              <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            {depth > 0 && parentId && (
              <div className="text-xs text-muted-foreground mb-1 ml-8">
                Replying to @{findParentUsername(parentId, allTopLevel)}
              </div>
            )}
            <div className="mt-1">{c.text}</div>
            <div className="mt-1 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(c._id)}>
                Reply
              </Button>
              {c.replies && c.replies.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleReplies(c._id)}
                  className="ml-2"
                >
                  {expandedReplies[c._id] ? 'Hide Replies' : `View Replies (${c.replies.length})`}
                </Button>
              )}
            </div>
            {replyingTo === c._id && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (replyText.trim()) replyMutation.mutate({ parentComment: c._id, text: replyText });
                }}
                className="mt-2 flex gap-2 animate-fade-in"
              >
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                />
                <Button type="submit" disabled={replyMutation.isPending}>
                  {replyMutation.isPending ? 'Replying...' : 'Reply'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </form>
            )}
            {c.replies && c.replies.length > 0 && (
              <div
                className={`overflow-hidden transition-all duration-300 ${expandedReplies[c._id] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                {expandedReplies[c._id] && renderComments(c.replies, depth + 1, c._id, allTopLevel)}
              </div>
            )}
            {depth === 0 && idx < visibleComments.length - 1 && (
              <div className="my-2 border-b border-border/40" />
            )}
          </li>
        ))}
        {/* If not on detail page, show a button to go to post detail if there are more comments */}
        {depth === 0 && showAllCommentsButton && comments.length > 1 && (
          <li>
            <Button variant="outline" className="w-full" onClick={() => navigate(`/post/${post._id}`)}>
              View all comments ({comments.length})
            </Button>
          </li>
        )}
      </ul>
    );
  };

  const navigate = useNavigate();
  const handleContentClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on a button, textarea, or link
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('textarea') ||
      target.closest('a') ||
      target.closest('form')
    ) {
      return;
    }
    navigate(`/post/${post._id}`);
  };

  return (
    <Card className="w-full transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="size-9">
            {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.username} />}
            <AvatarFallback>{post.author.username[0]}</AvatarFallback>
          </Avatar>
          <CardTitle>
            <Link to={`/profile/${post.author._id}`} className="hover:underline text-primary">
              {post.author.username}
            </Link>
          </CardTitle>
          <FollowButton userId={post.author._id} isFollowing={!!post.isFollowing} />
          {post.repost && (
            <span
              className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-semibold cursor-pointer"
              data-tooltip-id={`repost-tip-${post._id}`}
            >
              Repost
            </span>
          )}
          {post.repost && (
            <Tooltip id={`repost-tip-${post._id}`}>This is a repost of another user's post.</Tooltip>
          )}
        </div>
        {post.repost && post.repost.author && (
          <div className="mt-1 border-l-4 border-blue-200 pl-2">
            {/* If the repost has a quote, show it above the original post */}
            {post.content && (
              <div onClick = {()=>navigate(`/post/${post._id}`)}
              className="mb-2 p-3 rounded border bg-muted/60 border-primary/30 text-base italic text-foreground">
                {post.content}
              </div>
            )}
            {/* Divider between quote and original */}
            {post.content && <div className="border-b border-border/40 my-2" />}
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="size-7">
                {post.repost.author.avatar && <AvatarImage src={post.repost.author.avatar} alt={post.repost.author.username} />}
                <AvatarFallback>{post.repost.author.username[0]}</AvatarFallback>
              </Avatar>
              <span>Reposted from <Link to={`/profile/${post.repost.author._id}`} className="font-bold hover:underline text-primary">{post.repost.author.username}</Link></span>
            </div>
            {/* Make the original post content clickable to open its detail page */}
            {post.repost && (
              <div
                onClick={() => navigate(`/post/${post.repost!._id}`)}
                className="cursor-pointer select-text hover:bg-accent/40 rounded p-2 transition-colors"
                title="View original post"
              >
                <div className="text-xs mt-1 text-muted-foreground">{post.repost.content}</div>
                {post.repost.imageUrl && (
                  <img
                    src={post.repost.imageUrl}
                    alt="repost"
                    className="rounded-xl mt-2 max-w-full max-h-[500px] opacity-0 transition-opacity duration-700 fade-in-image"
                    onLoad={e => e.currentTarget.classList.add('fade-in-image')}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!post.repost && (
          <div onClick={handleContentClick} className="cursor-pointer select-text flex flex-col">
            <p>{post.content}</p>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="post"
                className="self-center rounded-xl mt-2 max-w-full max-h-[500px] opacity-0 transition-opacity duration-700 fade-in-image"
                onLoad={e => e.currentTarget.classList.add('fade-in-image')}
              />
            )}
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {new Date(post.createdAt).toLocaleString()}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => likeMutation.mutate()}
            className={`transition-transform duration-200 ${hasLiked ? 'scale-110 text-pink-500' : ''}`}
          >
            <Icon icon={hasLiked ? 'mdi:heart' : 'mdi:heart-outline'} className={`mr-1 ${hasLiked ? 'text-pink-500' : ''}`} /> {post.likesCount ?? optimisticLikes}
          </Button>
          <Dialog open={repostDialogOpen} onOpenChange={setRepostDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={repostMutation.isPending}
                className="transition-transform duration-200"
              >
                <Icon icon="mdi:repeat-variant" className="mr-1" /> Repost {post.repostCount ?? ''}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Repost</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Textarea
                  value={quote}
                  onChange={e => setQuote(e.target.value)}
                  placeholder="Add a quote (optional)"
                  rows={3}
                  className="w-full"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => {
                      repostMutation.mutate(quote);
                      setRepostDialogOpen(false);
                      setQuote('');
                    }}
                    disabled={repostMutation.isPending}
                  >
                    Repost {quote ? 'with Quote' : ''}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      repostMutation.mutate(undefined);
                      setRepostDialogOpen(false);
                      setQuote('');
                    }}
                    disabled={repostMutation.isPending}
                  >
                    Repost Directly
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            💬 {post.commentCount ?? (comments ? comments.length : 0)}
          </span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (comment.trim()) commentMutation.mutate();
          }}
          className="mt-4"
        >
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <Button type="submit" className="mt-2" disabled={commentMutation.isPending}>
            {commentMutation.isPending ? 'Posting...' : 'Comment'}
          </Button>
        </form>
        {!comments && <Skeleton height={40} className="my-2" />}
        {comments && comments.length > 0 && renderComments(comments)}
      </CardContent>
    </Card>
  );
};

export default PostCard;

