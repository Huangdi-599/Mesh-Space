import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type UserAchievement } from '@/services/achievement.service';

interface AchievementBadgeProps {
  achievement: UserAchievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const AchievementBadge = ({ achievement, size = 'md', showTooltip = true }: AchievementBadgeProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'uncommon':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'md':
        return 'w-12 h-12 text-sm';
      case 'lg':
        return 'w-16 h-16 text-base';
      default:
        return 'w-12 h-12 text-sm';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const badgeContent = (
    <div className={`relative ${getSizeClasses(size)}`}>
      <div className={`w-full h-full rounded-full border-2 flex items-center justify-center ${getRarityColor(achievement.achievement.rarity)}`}>
        <Icon 
          icon={achievement.achievement.icon} 
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'}`}
        />
      </div>
      {achievement.achievement.rarity === 'legendary' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold text-sm">{achievement.achievement.name}</div>
              <div className="text-xs text-muted-foreground">{achievement.achievement.description}</div>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="text-xs">
                  {achievement.achievement.rarity}
                </Badge>
                <span className="text-muted-foreground">
                  +{achievement.points} points
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Earned on {formatDate(achievement.earnedAt)}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
};

export default AchievementBadge;
