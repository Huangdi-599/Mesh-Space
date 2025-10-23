import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addReaction, removeReaction } from '@/services/post.service';

interface ReactionPickerProps {
  postId: string;
  currentReaction?: string;
  onReactionChange: (reaction: string | null) => void;
  disabled?: boolean;
}

const REACTION_TYPES = [
  { type: 'like', icon: 'mdi:thumb-up', label: 'Like', color: 'text-blue-500' },
  { type: 'love', icon: 'mdi:heart', label: 'Love', color: 'text-red-500' },
  { type: 'laugh', icon: 'mdi:emoticon-happy', label: 'Laugh', color: 'text-yellow-500' },
  { type: 'wow', icon: 'mdi:emoticon-excited', label: 'Wow', color: 'text-purple-500' },
  { type: 'sad', icon: 'mdi:emoticon-sad', label: 'Sad', color: 'text-gray-500' },
  { type: 'celebrate', icon: 'mdi:party-popper', label: 'Celebrate', color: 'text-green-500' },
];

const ReactionPicker = ({ postId, currentReaction, onReactionChange, disabled = false }: ReactionPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReaction = async (reactionType: string) => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      const isRemoving = currentReaction === reactionType;
      
      if (isRemoving) {
        await removeReaction(postId);
        onReactionChange(null);
        toast.success('Reaction removed');
      } else {
        await addReaction(postId, reactionType);
        onReactionChange(reactionType);
        toast.success('Reaction added');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update reaction');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className="transition-transform duration-200 hover:scale-110"
      >
        <Icon 
          icon="mdi:emoticon-happy-outline" 
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
        />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10 animate-in slide-in-from-bottom-2">
          {REACTION_TYPES.map((reaction) => (
            <Button
              key={reaction.type}
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(reaction.type)}
              className={`w-8 h-8 p-0 transition-all duration-200 hover:scale-125 ${
                currentReaction === reaction.type 
                  ? `${reaction.color} bg-gray-100 dark:bg-gray-700` 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={reaction.label}
            >
              <Icon 
                icon={reaction.icon} 
                className={`w-5 h-5 ${reaction.color}`} 
              />
            </Button>
          ))}
        </div>
      )}

      {/* Backdrop to close picker */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ReactionPicker;
