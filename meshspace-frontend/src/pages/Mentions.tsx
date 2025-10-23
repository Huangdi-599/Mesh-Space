import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mentionService, type Mention } from '@/services/mention.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const Mentions = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['mentions', page],
    queryFn: () => mentionService.getUserMentions(page, 20),
  });

  const markAsReadMutation = useMutation({
    mutationFn: mentionService.markMentionsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentions'] });
      queryClient.invalidateQueries({ queryKey: ['unread-mention-count'] });
      toast.success('Mentions marked as read');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to mark mentions as read');
    },
  });

  const handleMarkAsRead = () => {
    const unreadMentions = data?.mentions
      ?.filter((mention: Mention) => !mention.isRead)
      .map((mention: Mention) => mention._id) || [];
    
    if (unreadMentions.length > 0) {
      markAsReadMutation.mutate(unreadMentions);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center">
          <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading mentions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="text-center text-destructive">
          Failed to load mentions
        </div>
      </div>
    );
  }

  const mentions = data?.mentions || [];
  const hasUnread = mentions.some((mention: Mention) => !mention.isRead);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mentions</h1>
        {hasUnread && (
          <Button
            onClick={handleMarkAsRead}
            disabled={markAsReadMutation.isPending}
            size="sm"
            variant="outline"
          >
            <Icon icon="mdi:check-all" className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {mentions.length === 0 ? (
        <div className="text-center py-12">
          <Icon icon="mdi:at" className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No mentions yet</h3>
          <p className="text-muted-foreground">
            When someone mentions you with @username, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mentions.map((mention: Mention) => (
            <div
              key={mention._id}
              className={`p-4 rounded-lg border transition-colors ${
                mention.isRead 
                  ? 'bg-background' 
                  : 'bg-primary/5 border-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-10">
                  {mention.mentionedBy.avatar && (
                    <AvatarImage src={mention.mentionedBy.avatar} alt={mention.mentionedBy.username} />
                  )}
                  <AvatarFallback>{mention.mentionedBy.username[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">
                      <Link 
                        to={`/profile/${mention.mentionedBy._id}`}
                        className="hover:underline"
                      >
                        {mention.mentionedBy.username}
                      </Link>
                    </span>
                    <span className="text-muted-foreground">mentioned you in a</span>
                    <Link 
                      to={`/post/${mention.post._id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {mention.comment ? 'comment' : 'post'}
                    </Link>
                    {!mention.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground mb-3">
                    {formatDistanceToNow(new Date(mention.createdAt), { addSuffix: true })}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="size-6">
                        {mention.post.author.avatar && (
                          <AvatarImage src={mention.post.author.avatar} alt={mention.post.author.username} />
                        )}
                        <AvatarFallback className="text-xs">
                          {mention.post.author.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {mention.post.author.username}
                      </span>
                    </div>
                    
                    <div 
                      className="text-sm prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: mention.post.content }}
                    />
                  </div>

                  {mention.comment && (
                    <div className="mt-3 pl-4 border-l-2 border-muted">
                      <div className="text-sm text-muted-foreground mb-1">
                        Comment by {mention.comment.author.username}:
                      </div>
                      <div className="text-sm">{mention.comment.text}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.totalPages && data.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(prev => prev + 1)}
            disabled={page >= (data.totalPages || 1)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default Mentions;
