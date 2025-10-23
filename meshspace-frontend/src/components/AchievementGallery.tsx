import { useQuery } from '@tanstack/react-query';
import { getUserAchievements, getUserPoints } from '@/services/achievement.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import AchievementBadge from './AchievementBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface AchievementGalleryProps {
  userId: string;
}

const AchievementGallery = ({ userId }: AchievementGalleryProps) => {
  const { data: achievementsData, isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: () => getUserAchievements(userId, 1, 50),
  });

  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ['achievementPoints', userId],
    queryFn: () => getUserPoints(userId),
  });

  const getRarityCount = (rarity: string) => {
    if (!achievementsData?.achievements) return 0;
    return achievementsData.achievements.filter(
      achievement => achievement.achievement.rarity === rarity
    ).length;
  };

  const getCategoryCount = (category: string) => {
    if (!achievementsData?.achievements) return 0;
    return achievementsData.achievements.filter(
      achievement => achievement.achievement.category === category
    ).length;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800';
      case 'uncommon':
        return 'bg-green-100 text-green-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (achievementsLoading || pointsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const achievements = achievementsData?.achievements || [];
  const totalPoints = pointsData?.points || 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="mdi:trophy" className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{achievements.length}</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Icon icon="mdi:star" className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Icon icon="mdi:chart-line" className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {achievements.length > 0 ? Math.round((achievements.length / 13) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rarity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:chart-pie" className="w-5 h-5" />
            Achievement Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['common', 'uncommon', 'rare', 'epic', 'legendary'].map((rarity) => {
              const count = getRarityCount(rarity);
              const total = achievements.length;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={rarity} className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${getRarityColor(rarity)}`}>
                    <Icon icon="mdi:trophy" className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium capitalize">{rarity}</div>
                  <div className="text-xs text-muted-foreground">{count} ({percentage}%)</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:folder" className="w-5 h-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['content', 'engagement', 'social', 'milestone'].map((category) => {
              const count = getCategoryCount(category);
              const total = achievements.length;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={category} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                    <Icon 
                      icon={
                        category === 'content' ? 'mdi:post' :
                        category === 'engagement' ? 'mdi:heart' :
                        category === 'social' ? 'mdi:account-group' :
                        'mdi:flag'
                      } 
                      className="w-6 h-6" 
                    />
                  </div>
                  <div className="text-sm font-medium capitalize">{category}</div>
                  <div className="text-xs text-muted-foreground">{count} ({percentage}%)</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clock" className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon icon="mdi:trophy-outline" className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No achievements yet. Start creating content to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.slice(0, 6).map((achievement) => (
                <div key={achievement._id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <AchievementBadge achievement={achievement} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{achievement.achievement.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {achievement.achievement.description}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {achievement.achievement.rarity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        +{achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementGallery;
