import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

interface ReactionDisplayProps {
  reactions: Array<{
    user: { _id: string; username: string; avatar?: string };
    type: string;
  }>;
  reactionCounts: Record<string, number>;
  currentUserReaction?: string;
  onReactionClick?: (reactionType: string) => void;
}

const REACTION_ICONS: Record<string, string> = {
  like: 'mdi:thumb-up',
  love: 'mdi:heart',
  laugh: 'mdi:emoticon-happy',
  wow: 'mdi:emoticon-excited',
  sad: 'mdi:emoticon-sad',
  celebrate: 'mdi:party-popper',
};

const REACTION_COLORS: Record<string, string> = {
  like: 'text-blue-500',
  love: 'text-red-500',
  laugh: 'text-yellow-500',
  wow: 'text-purple-500',
  sad: 'text-gray-500',
  celebrate: 'text-green-500',
};

const ReactionDisplay = ({ 
  reactionCounts, 
  currentUserReaction, 
  onReactionClick 
}: ReactionDisplayProps) => {
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  if (totalReactions === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Show individual reaction counts */}
      {Object.entries(reactionCounts).map(([type, count]) => {
        if (count === 0) return null;
        
        return (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            onClick={() => onReactionClick?.(type)}
            className={`h-6 px-2 text-xs transition-all duration-200 hover:scale-105 ${
              currentUserReaction === type 
                ? `${REACTION_COLORS[type]} bg-gray-100 dark:bg-gray-700` 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon 
              icon={REACTION_ICONS[type]} 
              className={`w-3 h-3 mr-1 ${REACTION_COLORS[type]}`} 
            />
            <span className="text-xs">{count}</span>
          </Button>
        );
      })}

      {/* Show total count if there are multiple reaction types */}
      {Object.keys(reactionCounts).filter(type => reactionCounts[type] > 0).length > 1 && (
        <span className="text-xs text-muted-foreground">
          {totalReactions} reactions
        </span>
      )}
    </div>
  );
};

export default ReactionDisplay;
