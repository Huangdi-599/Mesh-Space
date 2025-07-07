import { useMutation } from '@tanstack/react-query';
import { loginUser, getCurrentUser } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
 
    const mutation = useMutation({
      mutationFn: loginUser,
      onSuccess: async (data) => {
        console.log('login', data)
        if (data && data.data.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        const me = await getCurrentUser();
        setUser(me.data);
        toast.success(data.message)
        navigate('/dashboard')
      },
      onError: (error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Login failed');
      },
    });

  return (
    <div className="flex w-fit h-fit justify-center">
      <Card className="w-full max-w-md shadow-xl border rounded-2xl p-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Welcome Back 👋</CardTitle>
          <p className="text-sm text-muted-foreground text-center">Log in to your MeshSpace account</p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              mutation.mutate({
                email: form.email.value,
                password: form.password.value,
              });
            }}
            className="space-y-4"
          >
            <Input name="email" type="email" placeholder="Email" />
            <div className="relative">
              <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <span className="flex items-center justify-center"><span className="animate-spin mr-2">🔄</span>Logging in...</span> : 'Login'}
            </Button>
          </form>
          <div className="flex justify-between mt-4 text-sm">
            <button className="text-blue-600 hover:underline" type="button" onClick={() => navigate('/forgot-password')}>Forgot password?</button>
            <button className="text-primary hover:underline" type="button" onClick={() => navigate('/register')}>Create account</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
