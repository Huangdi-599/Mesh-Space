import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPostById } from '@/services/post.service';
import PostCard from '@/components/PostCard';

const PostDetail = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId!),
    enabled: !!postId,
  });

  if (isLoading) return <div className="p-8 text-center">Loading post...</div>;
  if (isError || !post) return <div className="p-8 text-center text-red-500">Post not found.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-primary hover:underline hover:text-blue-600 transition-colors text-sm font-medium self-start"
        aria-label="Go back"
      >
        <span className="text-xl">←</span> Back
      </button>
      <div className="w-full max-w-xl">
        <PostCard post={post} detailPage={true} />
      </div>
    </div>
  );
};

export default PostDetail; 