import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, fetchFeed } from '../services/post.service';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { useInView } from 'react-intersection-observer';
import PostCard from '@/components/PostCard';
import type { Post } from '@/components/PostCard';
import { toast } from 'sonner';

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
  const { register, handleSubmit, reset } = useForm<{ content: string }>();
  const [image, setImage] = useState<File | null>(null);
  const [feedType, setFeedType] = useState<'following' | 'trending'>('trending');
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const postMutation = useMutation({
    mutationFn: (formData: FormData) => createPost(formData),
    onSuccess: () => {
      reset();
      setImage(null);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

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

  const onSubmit = (values: { content: string }) => {
    const formData = new FormData();
    formData.append('content', values.content);
    if (image) formData.append('image', image);
    postMutation.mutate(formData);
  };

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
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full max-w-xs mx-auto block">Create Post</Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Textarea {...register('content')} placeholder="What's on your mind?" />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  if (!file.type.startsWith('image/')) {
                    toast.error('Only image files are allowed!');
                    e.target.value = '';
                    setImage(null);
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error('Image size must be less than 2MB!');
                    e.target.value = '';
                    setImage(null);
                    return;
                  }
                }
                setImage(file);
              }}
            />
            <Button type="submit" disabled={postMutation.isPending}>
              {postMutation.isPending ? 'Posting...' : 'Post'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
