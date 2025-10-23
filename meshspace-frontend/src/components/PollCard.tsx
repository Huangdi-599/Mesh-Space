import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votePoll, deletePoll, type Poll } from '@/services/poll.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface PollCardProps {
  poll: Poll;
  showDeleteButton?: boolean;
}

const PollCard = ({ poll, showDeleteButton = false }: PollCardProps) => {
  const { user } = useAuth();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: ({ pollId, voteData }: { pollId: string; voteData: { optionIndexes: number[] } }) =>
      votePoll(pollId, voteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Vote recorded!');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to vote');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (pollId: string) => deletePoll(pollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete poll');
    },
  });

  const handleOptionSelect = (optionIndex: number) => {
    if (poll.isExpired) return;

    if (poll.allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionIndex) 
          ? prev.filter(i => i !== optionIndex)
          : [...prev, optionIndex]
      );
    } else {
      setSelectedOptions([optionIndex]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    voteMutation.mutate({
      pollId: poll._id,
      voteData: { optionIndexes: selectedOptions }
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      deleteMutation.mutate(poll._id);
    }
  };

  const getTotalVotes = () => {
    return poll.options.reduce((total, option) => total + option.votes.length, 0);
  };

  const getUserVoteCount = (optionIndex: number) => {
    if (!user) return 0;
    return poll.options[optionIndex].votes.filter(voteId => voteId === user._id).length;
  };

  const hasUserVoted = () => {
    if (!user) return false;
    return poll.options.some(option => option.votes.includes(user._id));
  };

  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes left`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours left`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days left`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="mdi:poll" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{poll.question}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>by {poll.createdBy.username}</span>
                <span>•</span>
                <span className={poll.isExpired ? 'text-red-500' : 'text-green-500'}>
                  {poll.isExpired ? 'Expired' : formatDate(poll.expiresAt)}
                </span>
                {poll.allowMultiple && (
                  <>
                    <span>•</span>
                    <span>Multiple choice</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {showDeleteButton && user?._id === poll.createdBy._id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Icon icon="mdi:delete" className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {poll.options.map((option, index) => {
          const votes = option.votes.length;
          const percentage = getPercentage(votes);
          const userVoteCount = getUserVoteCount(index);
          const isSelected = selectedOptions.includes(index);
          const hasVoted = hasUserVoted();

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-3">
                {!poll.isExpired && !hasVoted ? (
                  <button
                    onClick={() => handleOptionSelect(index)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground hover:border-primary'
                    }`}
                  >
                    {isSelected && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                  </button>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                    {userVoteCount > 0 && <Icon icon="mdi:check" className="w-3 h-3 text-primary" />}
                  </div>
                )}
                <span className="flex-1 text-sm">{option.text}</span>
                <span className="text-sm text-muted-foreground">
                  {votes} vote{votes !== 1 ? 's' : ''}
                </span>
              </div>
              
              {hasVoted && (
                <div className="ml-8 space-y-1">
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {percentage}% ({votes} vote{votes !== 1 ? 's' : ''})
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!poll.isExpired && !hasUserVoted() && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleVote}
              disabled={selectedOptions.length === 0 || voteMutation.isPending}
              size="sm"
            >
              {voteMutation.isPending ? (
                <>
                  <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                  Voting...
                </>
              ) : (
                <>
                  <Icon icon="mdi:vote" className="w-4 h-4 mr-2" />
                  Vote
                </>
              )}
            </Button>
          </div>
        )}

        {hasUserVoted() && (
          <div className="text-center py-2">
            <span className="text-sm text-muted-foreground">
              You have voted • {getTotalVotes()} total vote{getTotalVotes() !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PollCard;
