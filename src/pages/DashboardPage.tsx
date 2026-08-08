import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { useMarkets } from '@/lib/hooks';
import { MiniChart } from '@/components/AnimatedChart';
import { formatPrice, trendColor, categoryColor, categoryLabel } from '@/lib/utils';
import {
  Activity, TrendingUp, TrendingDown, Flame, Gauge, Clock,
  ArrowUpRight, ArrowDownRight, Zap, Eye, BarChart3,
} from 'lucide-react';

export function DashboardPage() {
  const { markets, loading } = useMarkets();
  const [fearGreed, setFearGreed] = useState(72);

  const gainers = [...markets].sort((a, b) => b.price_change_pct - a.price_change_pct).slice(0, 5);
  const losers = [...markets].sort((a, b) => a.price_change_pct - b.price_change_pct).slice(0, 5);

  const sessions = [
    { name: 'Sydney', active: true, time: 'Open' },
    { name: 'Tokyo', active: true, time: 'Open' },
    { name: 'London', active: true, time: 'Open' },
    { name: 'New York', active: false, time: 'Closed' },
  ];

  const heatData = markets.slice(0, 12).map((m, i) => ({
    symbol: m.symbol,
    change: m.price_change_pct,
    seed: i,
  }));

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Live Market Dashboard</h1>
        <p className="text-soft">Real-time market overview, sentiment, and trading sessions</p>
      </div>

      {/* Top Row: Fear & Greed + Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Fear & Greed */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-gold-400" /> Fear & Greed Index
          </h3>
          <div className="relative w-32 h-32 mx-auto">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={fearGreed > 50 ? '#22c55e' : '#ef4444'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(fearGreed / 100) * 314} 314`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-3xl">{fearGreed}</span>
              <span className="text-2xs text-muted">Greed</span>
            </div>
          </div>
        </div>

        {/* Trading Sessions */}
        <div className="glass rounded-2xl p-6 md:col-span-2">
          <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-400" /> Trading Sessions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sessions.map((s) => (
              <div key={s.name} className={`p-4 rounded-xl border ${s.active ? 'bg-bull/5 border-bull/20' : 'bg-white/[0.02] border-base'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${s.active ? 'bg-bull animate-pulse-glow' : 'bg-neutral'}`} />
                  <span className="text-sm font-semibold">{s.name}</span>
                </div>
                <p className={`text-2xs ${s.active ? 'text-bull' : 'text-muted'}`}>{s.time}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-base">
            <p className="text-sm text-soft">
              <Zap className="w-4 h-4 inline mr-2 text-gold-400" />
              London & Tokyo overlap — typically highest liquidity period.
            </p>
          </div>
        </div>
      </div>

      {/* Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2 text-bull">
            <ArrowUpRight className="w-4 h-4" /> Top Gainers
          </h3>
          <div className="space-y-2">
            {gainers.map((m, i) => (
              <Link key={m.id} to={`/pair/${m.symbol}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold w-16">{m.symbol}</span>
                  <span className="text-xs text-muted">{m.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{formatPrice(m.live_price)}</span>
                  <span className="text-sm text-bull font-medium w-16 text-right">+{m.price_change_pct.toFixed(2)}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2 text-bear">
            <ArrowDownRight className="w-4 h-4" /> Top Losers
          </h3>
          <div className="space-y-2">
            {losers.map((m) => (
              <Link key={m.id} to={`/pair/${m.symbol}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold w-16">{m.symbol}</span>
                  <span className="text-xs text-muted">{m.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{formatPrice(m.live_price)}</span>
                  <span className="text-sm text-bear font-medium w-16 text-right">{m.price_change_pct.toFixed(2)}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Market Heatmap */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-gold-400" /> Market Heatmap
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {heatData.map((h) => {
            const intensity = Math.min(Math.abs(h.change) / 3, 1);
            const bg = h.change >= 0
              ? `rgba(34,197,94,${0.1 + intensity * 0.3})`
              : `rgba(239,68,68,${0.1 + intensity * 0.3})`;
            return (
              <Link
                key={h.symbol}
                to={`/pair/${h.symbol}`}
                className="p-3 rounded-xl text-center transition-all hover:scale-105"
                style={{ background: bg, border: `1px solid ${h.change >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}
              >
                <p className="text-xs font-semibold">{h.symbol}</p>
                <p className={`text-sm font-mono ${h.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {h.change >= 0 ? '+' : ''}{h.change.toFixed(2)}%
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All Markets Table */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gold-400" /> All Markets
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-base">
                <th className="pb-3 font-medium">Symbol</th>
                <th className="pb-3 font-medium hidden md:table-cell">Category</th>
                <th className="pb-3 font-medium text-right">Price</th>
                <th className="pb-3 font-medium text-right">Change</th>
                <th className="pb-3 font-medium text-right hidden lg:table-cell">Bias</th>
                <th className="pb-3 font-medium text-right hidden md:table-cell">Chart</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m, i) => (
                <tr key={m.id} className="border-b border-base/50 hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <Link to={`/pair/${m.symbol}`} className="font-semibold hover:text-gold-400 transition-colors">{m.symbol}</Link>
                    <span className="text-2xs text-muted ml-2">{m.name}</span>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <span className={`text-2xs px-2 py-0.5 rounded-full border ${categoryColor(m.category)}`}>{categoryLabel(m.category)}</span>
                  </td>
                  <td className="py-3 text-right font-mono">{formatPrice(m.live_price)}</td>
                  <td className={`py-3 text-right font-medium ${m.price_change_pct >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {m.price_change_pct >= 0 ? '+' : ''}{m.price_change_pct.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right hidden lg:table-cell">
                    <span className={trendColor(m.market_bias)}>{m.market_bias}</span>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <div className="w-20 h-8 ml-auto">
                      <MiniChart seed={i + 1} bullish={m.price_change_pct >= 0} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
