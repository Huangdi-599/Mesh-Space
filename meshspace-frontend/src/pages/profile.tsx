import { useForm } from 'react-hook-form';
import { updateUserProfile } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
    },
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed!');
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB!');
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-primary hover:underline hover:text-blue-600 transition-colors text-sm font-medium"
        aria-label="Go back"
      >
        <span className="text-xl">←</span> Back
      </button>
      <Card className="border shadow-xl">
        <CardHeader className="items-center">
          <Avatar className="w-24 h-24 text-4xl">
            <AvatarImage src={avatarPreview} alt={user?.username} />
            <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => {
              const formData = new FormData();
              formData.append('username', data.username);
              formData.append('email', data.email);
              if (avatar) {
                formData.append('avatar', avatar);
              }
              mutation.mutate(formData);
            })}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm mb-1">Avatar</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Username</label>
              <Input {...register('username')} placeholder="Username" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input {...register('email')} placeholder="Email" />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
