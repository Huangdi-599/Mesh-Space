import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyEmailToken, resendVerificationEmail } from '@/services/auth.service';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

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
          <p className="text-muted-foreground mt-2">The verification link is invalid, expired, or your account is not yet verified.</p>
          <div className="mt-6 flex flex-col items-center gap-2 max-w-xs mx-auto">
            <input
              type="email"
              className="border rounded px-3 py-2 w-full text-base"
              placeholder="Enter your email to resend verification"
              value={resendEmail}
              onChange={e => setResendEmail(e.target.value)}
              disabled={resendLoading}
            />
            <button
              className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full disabled:opacity-60"
              disabled={resendLoading || !resendEmail}
              onClick={async () => {
                setResendLoading(true);
                try {
                  await resendVerificationEmail(resendEmail);
                  toast.success('Verification email resent! Check your inbox.');
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Failed to resend verification email');
                } finally {
                  setResendLoading(false);
                }
              }}
            >
              {resendLoading ? 'Resending...' : 'Resend verification email'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VerifyEmailPage;
