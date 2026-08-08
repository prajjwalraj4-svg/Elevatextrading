import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Link } from '@/lib/router';
import { FullPageLoader } from '@/components/Loading';
import type { JournalTrade } from '@/types';
import { MiniChart } from '@/components/AnimatedChart';
import {
  TrendingUp, TrendingDown, Target, Award, BarChart3,
  DollarSign, Percent, Calendar, Trophy, Activity,
} from 'lucide-react';

export function PerformancePage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<JournalTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('journal_trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setTrades((data as JournalTrade[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="section-pad max-w-2xl mx-auto py-20 text-center">
        <p className="text-xl text-soft mb-4">Please sign in to view your performance.</p>
        <Link to="/login" className="btn-gold px-6 py-3 rounded-xl inline-block">Sign In</Link>
      </div>
    );
  }

  if (loading) return <FullPageLoader message="Loading performance..." />;

  const wins = trades.filter((t) => t.result === 'win');
  const losses = trades.filter((t) => t.result === 'loss');
  const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgRR = trades.filter((t) => t.risk_reward).length > 0
    ? trades.filter((t) => t.risk_reward).length
    : 0;

  const now = new Date();
  const thisMonth = trades.filter((t) => new Date(t.created_at).getMonth() === now.getMonth() && new Date(t.created_at).getFullYear() === now.getFullYear());
  const thisWeek = trades.filter((t) => {
    const tradeDate = new Date(t.created_at);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return tradeDate >= weekAgo;
  });
  const thisYear = trades.filter((t) => new Date(t.created_at).getFullYear() === now.getFullYear());

  const stats = [
    { label: 'Total Trades', value: trades.length, icon: <BarChart3 className="w-5 h-5" />, color: 'text-navy-300' },
    { label: 'Total Wins', value: wins.length, icon: <TrendingUp className="w-5 h-5" />, color: 'text-bull' },
    { label: 'Total Losses', value: losses.length, icon: <TrendingDown className="w-5 h-5" />, color: 'text-bear' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: <Percent className="w-5 h-5" />, color: 'text-gold-400' },
    { label: 'Total P/L', value: `$${totalProfit.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: totalProfit >= 0 ? 'text-bull' : 'text-bear' },
    { label: 'Avg R/R', value: `1:${(avgRR || 1).toFixed(1)}`, icon: <Target className="w-5 h-5" />, color: 'text-gold-400' },
  ];

  const periodStats = [
    { label: 'This Week', trades: thisWeek.length, profit: thisWeek.reduce((s, t) => s + (t.profit || 0), 0) },
    { label: 'This Month', trades: thisMonth.length, profit: thisMonth.reduce((s, t) => s + (t.profit || 0), 0) },
    { label: 'This Year', trades: thisYear.length, profit: thisYear.reduce((s, t) => s + (t.profit || 0), 0) },
  ];

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Performance Dashboard</h1>
        <p className="text-soft">Track your trading statistics and performance over time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-5 card-hover animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`w-10 h-10 rounded-lg bg-white/[0.02] border border-base flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="font-display font-bold text-2xl mb-1">{s.value}</p>
            <p className="text-2xs text-muted uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Period Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {periodStats.map((p, i) => (
          <div key={p.label} className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-400" /> {p.label}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Trades</span>
                <span className="font-mono font-semibold">{p.trades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Net P/L</span>
                <span className={`font-mono font-bold text-lg ${p.profit >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {p.profit >= 0 ? '+' : ''}${p.profit.toFixed(2)}
                </span>
              </div>
              <div className="h-16">
                <MiniChart seed={i + 10} bullish={p.profit >= 0} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Win Rate Visualization */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h3 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold-400" /> Win Rate Breakdown
        </h3>
        {trades.length > 0 ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-bull font-medium flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Wins ({wins.length})</span>
                <span className="font-mono font-semibold text-bull">{winRate.toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-bull-soft to-bull rounded-full transition-all duration-700" style={{ width: `${winRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-bear font-medium flex items-center gap-1.5"><TrendingDown className="w-4 h-4" /> Losses ({losses.length})</span>
                <span className="font-mono font-semibold text-bear">{(100 - winRate).toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-bear-soft to-bear rounded-full transition-all duration-700" style={{ width: `${100 - winRate}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-8">No trades to analyze yet. Start recording trades in your journal.</p>
        )}
      </div>

      {/* Recent Trades Table */}
      {trades.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gold-400" /> Recent Trades
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-base">
                  <th className="pb-3 font-medium">Pair</th>
                  <th className="pb-3 font-medium">Dir</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Entry</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Exit</th>
                  <th className="pb-3 font-medium">Result</th>
                  <th className="pb-3 font-medium text-right">P/L</th>
                  <th className="pb-3 font-medium text-right hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...trades].reverse().slice(0, 10).map((t) => (
                  <tr key={t.id} className="border-b border-base/50 hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold">{t.pair}</td>
                    <td className="py-3">
                      <span className={`text-2xs px-2 py-0.5 rounded-full ${t.direction === 'long' ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>
                        {t.direction === 'long' ? 'LONG' : 'SHORT'}
                      </span>
                    </td>
                    <td className="py-3 font-mono hidden md:table-cell">{t.entry_price || '—'}</td>
                    <td className="py-3 font-mono hidden md:table-cell">{t.exit_price || '—'}</td>
                    <td className="py-3">
                      <span className={`text-2xs px-2 py-0.5 rounded-full capitalize ${
                        t.result === 'win' ? 'bg-bull/10 text-bull' :
                        t.result === 'loss' ? 'bg-bear/10 text-bear' :
                        'bg-neutral/10 text-neutral'
                      }`}>{t.result}</span>
                    </td>
                    <td className={`py-3 text-right font-mono font-semibold ${t.profit > 0 ? 'text-bull' : t.profit < 0 ? 'text-bear' : 'text-muted'}`}>
                      {t.profit >= 0 ? '+' : ''}${t.profit || 0}
                    </td>
                    <td className="py-3 text-right text-xs text-muted hidden lg:table-cell">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {trades.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No performance data yet.</p>
          <p className="text-sm text-muted mb-4">Start recording trades in your journal to see analytics here.</p>
          <Link to="/journal" className="btn-gold px-6 py-3 rounded-xl inline-block text-sm font-bold">Go to Journal</Link>
        </div>
      )}
    </div>
  );
}
