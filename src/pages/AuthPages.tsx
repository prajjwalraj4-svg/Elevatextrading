import { useState, type FormEvent } from 'react';
import { Link, navigate } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { AnimatedChartBackground } from '@/components/AnimatedChart';
import { Spinner } from '@/components/Loading';
import { TrendingUp, Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'register') {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
      } else {
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setPassword('');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <div className="absolute inset-0 bg-grid-navy bg-grid opacity-30" />
      <div className="absolute inset-0 bg-radial-gold opacity-40" />
      <AnimatedChartBackground />

      <div className="relative z-10 w-full max-w-md section-pad">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shadow-gold">
            <TrendingUp className="w-6 h-6 text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl">
            Elevate<span className="gold-text">X</span>
          </span>
        </Link>

        <div className="glass-strong rounded-3xl p-8 shadow-glass-lg">
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/[0.03] border border-base">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'btn-gold' : 'text-soft'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'btn-gold' : 'text-soft'}`}
            >
              Create Account
            </button>
          </div>

          <h1 className="font-display font-bold text-2xl mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join ElevateX'}
          </h1>
          <p className="text-sm text-soft mb-6">
            {mode === 'login' ? 'Sign in to access your dashboard and analysis' : 'Create an account to start your institutional trading journey'}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-bull/10 border border-bull/20 text-sm text-bull mb-4">
              <CheckCircle className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm text-soft mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm text-soft mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-soft mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Spinner className="w-5 h-5" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted hover:text-soft transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email);
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <div className="absolute inset-0 bg-radial-gold opacity-40" />

      <div className="relative z-10 w-full max-w-md section-pad">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shadow-gold">
            <TrendingUp className="w-6 h-6 text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl">Elevate<span className="gold-text">X</span></span>
        </Link>

        <div className="glass-strong rounded-3xl p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-bull mx-auto mb-4" />
              <h1 className="font-display font-bold text-xl mb-2">Check Your Email</h1>
              <p className="text-sm text-soft mb-6">We've sent a password reset link to {email}. Follow the link to reset your password.</p>
              <Link to="/login" className="btn-gold px-6 py-3 rounded-xl inline-block text-sm font-semibold">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-2xl mb-2">Reset Password</h1>
              <p className="text-sm text-soft mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Spinner className="w-5 h-5" /> : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-muted hover:text-soft transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
