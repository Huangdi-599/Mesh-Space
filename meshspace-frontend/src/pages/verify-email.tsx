import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyEmailToken } from '@/services/auth.service';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (token) {
      verifyEmailToken(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [token]);

  if (status === 'loading') return <div className="text-center mt-20"><Icon icon="mdi:loading" className="animate-spin w-8 h-8 mx-auto" /></div>;

  return (
    <div className="text-center mt-20 p-4">
      {status === 'success' ? (
        <>
          <h2 className="text-2xl font-bold">✅ Email Verified</h2>
          <p className="text-muted-foreground mt-2">Your account has been verified. You can now log in.</p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-red-600">❌ Verification Failed</h2>
          <p className="text-muted-foreground mt-2">The verification link is invalid or expired.</p>
          <button
            className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={() => toast.success('Verification email resent (placeholder)!')}
          >
            Resend verification email
          </button>
        </>
      )}
    </div>
  );
};

export default VerifyEmailPage;
