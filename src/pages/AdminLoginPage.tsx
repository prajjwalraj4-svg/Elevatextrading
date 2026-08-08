import { useState, type FormEvent } from 'react';
import { Link, navigate } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import { AnimatedChartBackground } from '@/components/AnimatedChart';
import { Spinner } from '@/components/Loading';
import { TrendingUp, Mail, Lock, ArrowLeft, AlertCircle, Shield } from 'lucide-react';

export function AdminLoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <div className="absolute inset-0 bg-grid-navy bg-grid opacity-30" />
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
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
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 gold-border flex items-center justify-center text-gold-400 mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="font-display font-bold text-2xl">Admin Login</h1>
            <p className="text-sm text-soft mt-1">Restricted access — authorized personnel only</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-soft mb-1.5 block">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@elevatex.com"
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
                  placeholder="••••••••"
                  className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Spinner className="w-5 h-5" /> : <>Sign In to Admin Panel</>}
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
