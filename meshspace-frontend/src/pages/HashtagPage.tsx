import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHashtagDetails, getPostsByHashtag } from '@/services/hashtag.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '@/components/PostCard';
import { useState } from 'react';

const HashtagPage = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data: hashtagDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['hashtag-details', hashtag],
    queryFn: () => getHashtagDetails(hashtag!),
    enabled: !!hashtag,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['hashtag-posts', hashtag, currentPage],
    queryFn: () => getPostsByHashtag(hashtag!, currentPage, limit),
    enabled: !!hashtag,
  });

  if (detailsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hashtagDetails) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <Icon icon="mdi:hashtag" className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Hashtag not found</h2>
            <p className="text-muted-foreground">
              The hashtag #{hashtag} doesn't exist or has no posts yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { hashtag: hashtagInfo } = hashtagDetails;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Hashtag Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:hashtag" className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">#{hashtagInfo.name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      {hashtagInfo.postCount} post{hashtagInfo.postCount !== 1 ? 's' : ''}
                    </span>
                    <Badge variant={hashtagInfo.isTrending ? "default" : "secondary"}>
                      {hashtagInfo.isTrending ? 'Trending' : 'Popular'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Score: {hashtagInfo.trendingScore}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Icon icon="mdi:share" className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Posts</h3>
            <div className="text-sm text-muted-foreground">
              {postsData?.total || 0} total posts
            </div>
          </div>

          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-3 w-1/6" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : postsData?.posts && postsData.posts.length > 0 ? (
            <div className="space-y-4">
              {postsData.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
              
              {/* Pagination */}
              {postsData.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <Icon icon="mdi:chevron-left" className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {postsData.totalPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(postsData.totalPages, prev + 1))}
                    disabled={currentPage === postsData.totalPages}
                  >
                    Next
                    <Icon icon="mdi:chevron-right" className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Icon icon="mdi:post-outline" className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  Be the first to post with #{hashtagInfo.name}!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HashtagPage;
