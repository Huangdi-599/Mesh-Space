import { useState } from 'react';
import { requestPasswordReset } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setSuccess(res.message || 'If that email exists, a reset link has been sent.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-fit h-fit justify-center">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-lg shadow-lg p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-primary hover:underline hover:text-blue-600 transition-colors text-sm font-medium"
          aria-label="Go back"
        >
          <span className="text-xl">←</span> Back
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword; 