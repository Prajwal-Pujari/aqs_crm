import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Lock, User, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Invalid username or password. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setUsername('admin');
    setPassword('password');
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage text-2xl font-bold font-headline text-white shadow-sm">
            A
          </div>
          <h1 className="font-headline text-headline-lg font-semibold text-ink">
            AQS CRM
          </h1>
          <p className="mt-1 text-body-sm text-stone-text">
            Customer &amp; Annual Renewal Management System
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-card border border-divider bg-card p-8 shadow-card">
          <div className="mb-6">
            <h2 className="font-headline text-headline-sm text-ink">Sign in</h2>
            <p className="mt-1 text-body-xs text-stone-text">
              Enter your credentials to access the CRM console.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/80 p-3 text-body-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-label-sm font-medium text-ink mb-1.5"
              >
                Username or Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-text">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className="w-full rounded-input border border-divider bg-white/70 py-2.5 pl-9 pr-3.5 text-body-sm text-ink placeholder:text-stone-text/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-label-sm font-medium text-ink mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-text">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-input border border-divider bg-white/70 py-2.5 pl-9 pr-3.5 text-body-sm text-ink placeholder:text-stone-text/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-input bg-sage py-2.5 px-4 text-label-sm font-medium text-white shadow-sm transition-all hover:bg-sage-hover disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Pill */}
          <div className="mt-6 pt-5 border-t border-divider">
            <div className="flex items-center justify-between text-body-xs text-stone-text">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sage" />
                Default Administrator
              </span>
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="text-label-xs font-semibold text-sage hover:text-sage-dark underline underline-offset-2 cursor-pointer transition-colors"
              >
                Auto-fill (admin / password)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-body-xs text-stone-text/70">
          AQS Renewal &amp; Customer Management &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

