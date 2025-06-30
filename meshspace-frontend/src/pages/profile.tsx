import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
    },
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setValue('avatar', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
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
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
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
