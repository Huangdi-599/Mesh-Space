import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<T> {
  queryKey: string[];
  updateFn: (oldData: T, variables: any) => T;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>({
  queryKey,
  updateFn,
  onSuccess,
  onError,
  successMessage,
  errorMessage
}: OptimisticUpdateOptions<T>) {
  const [isOptimistic, setIsOptimistic] = useState(false);
  const queryClient = useQueryClient();

  const optimisticMutation = useMutation({
    mutationFn: async (variables: any) => {
      // Get current data
      const previousData = queryClient.getQueryData<T>(queryKey);
      
      // Optimistically update the cache
      if (previousData) {
        const optimisticData = updateFn(previousData, variables);
        queryClient.setQueryData(queryKey, optimisticData);
        setIsOptimistic(true);
      }

      // Return the variables for the actual mutation
      return variables;
    },
    onSuccess: (data) => {
      setIsOptimistic(false);
      if (successMessage) {
        toast.success(successMessage);
      }
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      setIsOptimistic(false);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey });
      if (errorMessage) {
        toast.error(errorMessage);
      }
      if (onError) {
        onError(error);
      }
    }
  });

  return {
    mutate: optimisticMutation.mutate,
    mutateAsync: optimisticMutation.mutateAsync,
    isPending: optimisticMutation.isPending,
    isOptimistic,
    error: optimisticMutation.error
  };
}

// Specific hooks for common operations
export function useOptimisticLike() {
  return useOptimisticUpdate({
    queryKey: ['feed'],
    updateFn: (posts: any[], { postId, userId, isLiked }: { postId: string; userId: string; isLiked: boolean }) => {
      return posts.map(post => {
        if (post._id === postId) {
          const likes = isLiked 
            ? [...post.likes, userId]
            : post.likes.filter((id: string) => id !== userId);
          return { ...post, likes, likesCount: likes.length };
        }
        return post;
      });
    },
    successMessage: 'Like updated!',
    errorMessage: 'Failed to update like'
  });
}

export function useOptimisticComment() {
  return useOptimisticUpdate({
    queryKey: ['comments'],
    updateFn: (comments: any[], { newComment }: { newComment: any }) => {
      return [...comments, newComment];
    },
    successMessage: 'Comment added!',
    errorMessage: 'Failed to add comment'
  });
}

export function useOptimisticPost() {
  return useOptimisticUpdate({
    queryKey: ['feed'],
    updateFn: (posts: any[], { newPost }: { newPost: any }) => {
      return [newPost, ...posts];
    },
    successMessage: 'Post created!',
    errorMessage: 'Failed to create post'
  });
}
