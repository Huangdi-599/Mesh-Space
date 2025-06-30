import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followOrUnfollowUser } from '@/services/user.service';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

const FollowButton = ({ userId, isFollowing }: FollowButtonProps) => {
  const queryClient = useQueryClient();
  const [optimisticFollow, setOptimisticFollow] = useState(isFollowing);

  const mutation = useMutation({
    mutationFn: () => followOrUnfollowUser(userId),
    onMutate: () => {
      setOptimisticFollow((prev) => !prev);
    },
    onError: (error: unknown) => {
      setOptimisticFollow((prev) => !prev);
      toast.error(error instanceof Error ? error.message : 'Failed to update follow status');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      const message = data?.message || (optimisticFollow ? 'Unfollowed successfully' : 'Followed successfully');
      toast.success(message);
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => mutation.mutate()}
      className={`transition-all duration-200 ${optimisticFollow ? 'bg-primary/10 text-primary scale-105' : ''}`}
    >
      {optimisticFollow ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton;