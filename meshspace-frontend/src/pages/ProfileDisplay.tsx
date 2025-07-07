// ProfileDisplay.tsx — public profile view
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserById, getFollowers, getFollowing } from '@/services/user.service';
import { getPostsByUser } from '@/services/post.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FollowButton from '@/components/FollowButton';
import UserListModal from '@/components/UserListModal';
import PostCard from '@/components/PostCard';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
const ProfileDisplay = () => {
  const { id: userId } = useParams();
  const { user } = useAuth();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const isOwnProfile = user?._id === userId;

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
  });

  const followersQuery = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => getFollowers(userId!),
    enabled: !!userId,
  });

  const followingQuery = useQuery({
    queryKey: ['following', userId],
    queryFn: () => getFollowing(userId!),
    enabled: !!userId,
  });

  const postsQuery = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => getPostsByUser(userId!),
    enabled: !!userId,
  });

  if (userQuery.isLoading) return <p>Loading profile...</p>;
  if (userQuery.isError) return <p>Failed to load profile.</p>;

  const viewedUser = userQuery.data;

  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <Card className="w-full max-w-xl shadow-md mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{viewedUser.username}</CardTitle>
          <p className="text-muted-foreground text-sm">{viewedUser.email}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p>Followers: {followersQuery.data?.length || 0}</p>
            <p>Following: {followingQuery.data?.length || 0}</p>
            {!isOwnProfile && (
              <FollowButton
                userId={viewedUser._id}
                isFollowing={followersQuery.data?.some((f: any) => f._id === user?._id) ?? false}
              />
            )}
          </div>
        </CardContent>
      </Card>
      <div className="w-full max-w-xl space-y-4">
        <h2 className="text-lg font-semibold mb-2">Posts & Reposts</h2>
        {postsQuery.isLoading && <p>Loading posts...</p>}
        {postsQuery.isError && <p>Failed to load posts.</p>}
        {postsQuery.data && postsQuery.data.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
        {postsQuery.data && postsQuery.data.map((post: any) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      <UserListModal
        open={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        users={followersQuery.data ? followersQuery.data : []}
      />
      <UserListModal
        open={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        users={followingQuery.data ? followingQuery.data : []}
      />
    </div>
  );
};

export default ProfileDisplay;