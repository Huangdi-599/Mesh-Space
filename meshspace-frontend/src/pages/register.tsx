import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

function isApiError(err: unknown): err is { response: { data: { message?: string } } } {
  if (typeof err !== 'object' || err === null) return false;
  const maybeResp = (err as Record<string, unknown>).response;
  if (typeof maybeResp !== 'object' || maybeResp === null) return false;
  const maybeData = (maybeResp as Record<string, unknown>).data;
  if (typeof maybeData !== 'object' || maybeData === null) return false;
  return true;
}

const Register = () => {
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('✅ Check your email to verify your account');
      navigate('/login')
    },
    onError: (err: unknown) => {
      let message = 'Registration failed';
      if (isApiError(err) && typeof err.response.data.message === 'string') {
        message = err.response.data.message;
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      console.log(err);
      toast.error(message);
    },
  });

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed!');
        e.target.value = '';
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB!');
        e.target.value = '';
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex w-fit h-fit justify-center">
      <Card className="w-full max-w-md shadow-xl border rounded-2xl p-4">
        <CardHeader className="items-center">
          <Avatar className="w-24 h-24 text-4xl mb-3">
            <AvatarImage src={avatarPreview} />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <CardTitle className="text-center text-2xl">Create Account</CardTitle>
          <p className="text-sm text-muted-foreground text-center">Join the MeshSpace network</p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password !== confirm) {
                toast.error('Passwords do not match');
                return;
              }
              const form = e.currentTarget;
              console.log({
                avatar,
                username: form.username.value,
                email: form.email.value,
                password
              });
              mutation.mutate({
                username: form.username.value,
                email: form.email.value,
                password,
                avatar,
              });
            }}
            className="space-y-4"
          >
            <Input
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <Input name="username" placeholder="Username" />
            <Input name="email" type="email" placeholder="Email" />
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="relative">
              <Input
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="h-2">
              {password && (
                <span
                  className={`text-xs font-medium ${
                    password.length < 6 ? 'text-red-500' : password.length < 10 ? 'text-yellow-500' : 'text-green-600'
                  }`}
                >
                  {password.length < 6 ? 'Weak password' : password.length < 10 ? 'Medium password' : 'Strong password'}
                </span>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">🔄</span>Creating account...
                </span>
              ) : (
                'Register'
              )}
            </Button>
          </form>
          <div className="flex justify-center mt-4 text-sm">
            <button
              className="text-primary hover:underline"
              type="button"
              onClick={() => navigate('/login')}
            >
              Already have an account? Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
