import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { exchangeCodeForTokens, getProfileEmail } from '../../services/gmailService';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setGmailTokens } = useSettingsStore();
  const { user } = useAuthStore();
  const { toast } = useUIStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    async function handle() {
      if (error) {
        setStatus('error');
        setMessage('You denied the Gmail connection.');
        toast({ title: 'Connection Cancelled', description: 'No email linked.', variant: 'warning' });
        setTimeout(() => navigate('/settings', { replace: true }), 1500);
        return;
      }
      if (!code) {
        setStatus('error');
        setMessage('Missing authorization code.');
        setTimeout(() => navigate('/settings', { replace: true }), 1500);
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens(code);
        setGmailTokens(tokens);

        // Try to fetch the real Gmail address; fall back to the user's email
        let connectedEmail = user?.email || '';
        try {
          const real = await getProfileEmail();
          if (real) connectedEmail = real;
        } catch {
          /* ignore */
        }

        // Mark the connected email on the user profile
        if (connectedEmail) {
          useAuthStore.getState().connectEmail(connectedEmail);
        }

        setStatus('success');
        setMessage('Gmail Connected! You can now scan your inbox for tasks.');
        toast({ title: 'Gmail Connected!', description: 'Your inbox is now linked.', variant: 'success' });
        setTimeout(() => navigate('/tasks', { replace: true }), 1500);
      } catch (e) {
        console.error(e);
        setStatus('error');
        setMessage(e instanceof Error ? e.message : 'Failed to connect Gmail.');
        toast({ title: 'Connection Failed', description: 'Please try again.', variant: 'error' });
        setTimeout(() => navigate('/settings', { replace: true }), 2000);
      }
    }

    handle();
  }, [searchParams, navigate, setGmailTokens, toast, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand" />
            <h2 className="mt-4 text-lg font-semibold text-text">Connecting Gmail…</h2>
            <p className="mt-1 text-sm text-text-muted">Securely linking your inbox.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-10 w-10 text-success" />
            <h2 className="mt-4 text-lg font-semibold text-text">Success!</h2>
            <p className="mt-1 text-sm text-text-muted">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-danger" />
            <h2 className="mt-4 text-lg font-semibold text-text">Connection Failed</h2>
            <p className="mt-1 text-sm text-text-muted">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
