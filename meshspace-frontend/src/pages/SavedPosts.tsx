import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSavedPosts } from '@/services/bookmark.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '@/components/PostCard';

const SavedPosts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data: savedPostsData, isLoading } = useQuery({
    queryKey: ['saved-posts', currentPage],
    queryFn: () => getSavedPosts(currentPage, limit),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:bookmark" className="w-6 h-6" />
                Saved Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
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
        </div>
      </div>
    );
  }

  const { posts, totalPages, total } = savedPostsData || { posts: [], totalPages: 0, total: 0 };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:bookmark" className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Saved Posts</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    {total} saved post{total !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Icon icon="mdi:filter" className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Posts */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Icon icon="mdi:bookmark-outline" className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No saved posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Start saving posts you want to read later by clicking the bookmark icon.
              </p>
              <Button variant="outline">
                <Icon icon="mdi:home" className="w-4 h-4 mr-2" />
                Go to Feed
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
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
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <Icon icon="mdi:chevron-right" className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;
