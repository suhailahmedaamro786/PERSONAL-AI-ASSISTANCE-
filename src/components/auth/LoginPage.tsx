import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function LoginPage() {
  const { login, signup, loginError, signupError, clearErrors } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === 'signup' && !name.trim()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), name.trim(), password);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    clearErrors();
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface to-brand-subtle/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-2.5 shadow-lg shadow-brand/30">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-lg font-bold text-white tracking-tight">Suhail AI</span>
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-sm text-text-muted max-w-xs mx-auto">
            {mode === 'login'
              ? 'Sign in to your personal AI career operating system.'
              : 'Sign up to unlock AI-powered career coaching, task automation, and resume scanning.'}
          </p>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: <Sparkles className="h-4 w-4 text-brand" />, label: 'AI Coach' },
            { icon: <Zap className="h-4 w-4 text-warning" />, label: 'Auto Tasks' },
            { icon: <ArrowRight className="h-4 w-4 text-success" />, label: 'Resume Scan' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface/80 px-2 py-3 backdrop-blur-sm">
              {f.icon}
              <span className="text-[11px] font-medium text-text-secondary">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Auth Form */}
        <div className="rounded-xl border border-border bg-surface/90 p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="you@gmail.com"
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

            {/* Error Messages */}
            {(mode === 'login' && loginError) && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger font-medium">
                {loginError}
              </div>
            )}
            {(mode === 'signup' && signupError) && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger font-medium">
                {signupError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-text-muted">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button onClick={switchMode} className="font-semibold text-brand hover:underline">
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button onClick={switchMode} className="font-semibold text-brand hover:underline">
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
