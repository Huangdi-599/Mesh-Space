import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savePost, unsavePost, isPostSaved } from '@/services/bookmark.service';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  postId: string;
  size?: 'sm' | 'md' | 'lg';
}

const BookmarkButton = ({ postId, size = 'sm' }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const queryClient = useQueryClient();

  // Check if post is saved
  const { data: savedStatus } = useQuery({
    queryKey: ['bookmark-status', postId],
    queryFn: () => isPostSaved(postId),
  });

  // Update bookmark status when data changes
  useEffect(() => {
    if (savedStatus?.isSaved !== undefined) {
      setIsBookmarked(savedStatus.isSaved);
    }
  }, [savedStatus]);

  const saveMutation = useMutation({
    mutationFn: () => savePost(postId),
    onSuccess: () => {
      setIsBookmarked(true);
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', postId] });
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      toast.success('Post saved!');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save post');
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => unsavePost(postId),
    onSuccess: () => {
      setIsBookmarked(false);
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', postId] });
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      toast.success('Post removed from saved');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to unsave post');
    },
  });

  const handleToggle = () => {
    if (isBookmarked) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 p-0';
      case 'md':
        return 'h-10 w-10 p-0';
      case 'lg':
        return 'h-12 w-12 p-0';
      default:
        return 'h-8 w-8 p-0';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const isLoading = saveMutation.isPending || unsaveMutation.isPending;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={`${getSizeClasses()} hover:bg-muted/50 transition-colors`}
      title={isBookmarked ? 'Remove from saved' : 'Save post'}
    >
      {isLoading ? (
        <Icon icon="mdi:loading" className={`${getIconSize()} animate-spin`} />
      ) : (
        <Icon 
          icon={isBookmarked ? "mdi:bookmark" : "mdi:bookmark-outline"} 
          className={`${getIconSize()} ${isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}
        />
      )}
    </Button>
  );
};

export default BookmarkButton;
