import { useState, useEffect } from 'react';
import { Mail, Lock, User, CheckCircle, LogOut, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { buildAuthUrl } from '../../services/gmailService';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    disconnectEmail,
    loginError,
    signupError,
    clearErrors,
  } = useAuthStore();
  const { toast } = useUIStore();

  const [mode, setMode] = useState<'connect_email' | 'login' | 'signup' | 'logout_confirm'>('connect_email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Listen for mode changes from TopBar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.mode) {
        setMode(detail.mode);
      }
    };
    window.addEventListener('suhail-auth-modal-mode', handler);
    return () => window.removeEventListener('suhail-auth-modal-mode', handler);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === 'signup' && !name.trim()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        const success = await login(email.trim(), password);
        if (success) {
          toast({ title: 'Welcome Back!', description: `Signed in as ${email.trim()}`, variant: 'success' });
          setAuthModalOpen(false);
          setEmail('');
          setPassword('');
        }
      } else if (mode === 'signup') {
        const success = await signup(email.trim(), name.trim(), password);
        if (success) {
          toast({ title: 'Account Created!', description: `Welcome to Suhail AI, ${name.trim()}!`, variant: 'success' });
          setAuthModalOpen(false);
          setEmail('');
          setName('');
          setPassword('');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const connectGmail = () => {
    window.location.href = buildAuthUrl();
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been signed out.', variant: 'info' });
    setAuthModalOpen(false);
  };

  return (
    <Modal
      open={isAuthModalOpen}
      onOpenChange={(open) => {
        setAuthModalOpen(open);
        if (!open) {
          clearErrors();
          setEmail('');
          setName('');
          setPassword('');
        }
      }}
      title={
        mode === 'connect_email'
          ? 'Connect Email for Auto-Tasks'
          : mode === 'login'
          ? 'Sign In to Suhail AI'
          : mode === 'signup'
          ? 'Create Your Account'
          : 'Sign Out'
      }
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Already connected email */}
        {isAuthenticated && user?.emailConnected && mode === 'connect_email' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-3.5 text-sm text-text">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="font-semibold text-success">Email Account Connected</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Connected to: <span className="font-mono font-medium text-text">{user.connectedEmailAddress || user.email}</span>
                </p>
                <p className="text-xs text-text-muted mt-1">
                  New incoming emails are automatically analyzed for deadlines, classes, and tasks.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  disconnectEmail();
                  toast({ title: 'Disconnected', description: 'Email link removed.', variant: 'info' });
                }}
              >
                Disconnect
              </Button>
              <Button variant="primary" size="sm" onClick={() => setAuthModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : mode === 'logout_confirm' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3.5 text-sm text-text">
              <LogOut className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="font-semibold text-warning">Are you sure you want to sign out?</p>
                <p className="text-xs text-text-muted mt-0.5">
                  You'll need to log in again to access your tasks, career data, and AI coach.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setMode('connect_email')}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
              </Button>
            </div>
          </div>
        ) : mode === 'connect_email' && isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              Connect your Gmail account to scan your real inbox and automatically add deadlines, assignments, interviews, and workshop tasks to your board.
            </p>

            <Button variant="primary" size="md" className="w-full" onClick={connectGmail}>
              <Mail className="h-4 w-4 mr-1.5" /> Connect Gmail
            </Button>

            <div className="rounded-lg bg-surface-hover p-3 text-xs text-text-muted flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <span>
                You'll be redirected to Google to authorize access. We only use read-only Gmail access to extract task deadlines — everything stays private to your account.
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-3.5">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="e.g. Suhail Memon"
                leftIcon={<User className="h-4 w-4" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="youremail@gmail.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                leftIcon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Errors */}
            {mode === 'login' && loginError && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger font-medium">
                {loginError}
              </div>
            )}
            {mode === 'signup' && signupError && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger font-medium">
                {signupError}
              </div>
            )}

            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full mt-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="flex items-center justify-between pt-2 text-xs text-text-muted">
              <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
              <button
                type="button"
                onClick={() => { clearErrors(); setMode(mode === 'login' ? 'signup' : 'login'); }}
                className="font-medium text-brand hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
