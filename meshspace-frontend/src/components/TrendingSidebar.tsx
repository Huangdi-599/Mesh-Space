import { useQuery } from '@tanstack/react-query';
import { getTrendingHashtags } from '@/services/hashtag.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const TrendingSidebar = () => {
  const { data: trendingHashtags, isLoading } = useQuery({
    queryKey: ['trending-hashtags'],
    queryFn: () => getTrendingHashtags(10),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  const getTrendingIcon = (index: number) => {
    if (index === 0) return 'mdi:fire';
    if (index === 1) return 'mdi:trending-up';
    if (index === 2) return 'mdi:chart-line';
    return 'mdi:hashtag';
  };

  const getTrendingColor = (index: number) => {
    if (index === 0) return 'text-orange-500';
    if (index === 1) return 'text-red-500';
    if (index === 2) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:trending-up" className="w-5 h-5" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="w-8 h-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!trendingHashtags || trendingHashtags.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:trending-up" className="w-5 h-5" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Icon icon="mdi:trending-up" className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No trending topics yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="mdi:trending-up" className="w-5 h-5" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingHashtags.map((hashtag, index) => (
          <Link
            key={hashtag._id}
            to={`/hashtag/${hashtag.name}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Icon 
                icon={getTrendingIcon(index)} 
                className={`w-4 h-4 ${getTrendingColor(index)}`}
              />
              <span className="text-sm font-medium text-muted-foreground">
                #{index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate group-hover:text-primary">
                #{hashtag.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {hashtag.postCount} post{hashtag.postCount !== 1 ? 's' : ''}
              </div>
            </div>
            <Badge 
              variant={hashtag.isTrending ? "default" : "secondary"}
              className="text-xs"
            >
              {hashtag.isTrending ? 'Hot' : 'Trending'}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default TrendingSidebar;
