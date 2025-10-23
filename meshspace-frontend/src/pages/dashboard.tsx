import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeed } from '../services/post.service';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import type { Post } from '@/components/PostCard';
import { Icon } from '@iconify/react';

// Sleek Custom Loader component
const Loader = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
    <div className="relative mb-4">
      <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-blue-400 animate-spin-slow shadow-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full bg-background border-2 border-primary/30" />
      </div>
    </div>
    <span className="text-primary text-lg font-semibold tracking-wide drop-shadow-sm">Fetching awesome posts for you...</span>
    <span className="text-muted-foreground text-sm mt-1">Hang tight, this won't take long!</span>
  </div>
);

const Dashboard = () => {
  const [feedType, setFeedType] = useState<'following' | 'trending'>('trending');
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['feed', feedType],
    queryFn: ({ pageParam = 1 }) => fetchFeed(pageParam, feedType),
    initialPageParam: 1,
    getNextPageParam: (lastPage: Post[], allPages: Post[][]) =>
      lastPage.length === 10 ? allPages.length + 1 : undefined,
  });

  if (inView && hasNextPage) fetchNextPage();

  if (isLoading && !data) return <Loader />;

  return (
    <div className="w-full space-y-6">
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${feedType === 'trending' ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
          onClick={() => setFeedType('trending')}
        >
          Trending
        </button>
        <button
          className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${feedType === 'following' ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
          onClick={() => setFeedType('following')}
        >
          Following
        </button>
      </div>
      
      <CreatePostModal>
        <Button className="w-full flex items-center max-w-xs mx-auto">
          <Icon icon="mdi:plus" className="flex-shrink-0 w-4 h-4"/>
          Create Post
        </Button>
      </CreatePostModal>

      <div className="grid gap-4">
        {data?.pages.flat().map((post: Post, i: number) => (
          <div
            key={post._id}
            ref={i === data.pages.flat().length - 1 ? ref : null}
            className="cursor-pointer"
          >
            <PostCard post={post} showAllCommentsButton={true} />
          </div>
        ))}
      </div>

      {isFetchingNextPage && <p className="text-center text-sm text-muted-foreground">Loading more...</p>}
    </div>
  );
};

export default Dashboard;
