import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { FullPageLoader } from '@/components/Loading';
import { formatPrice, categoryColor, categoryLabel, timeAgo } from '@/lib/utils';
import type { Analysis, Market } from '@/types';
import { BarChart3, Target, Shield, Clock, Pin, ArrowRight, Calendar } from 'lucide-react';

const analysisTabs = [
  { key: 'all', label: 'All' },
  { key: 'crypto', label: 'Crypto' },
  { key: 'forex', label: 'Forex' },
  { key: 'indices', label: 'Indices' },
  { key: 'commodities', label: 'Commodities' },
  { key: 'metals', label: 'Metals' },
];

export function AnalysisPage() {
  const [analyses, setAnalyses] = useState<(Analysis & { market?: Market })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    supabase
      .from('analysis')
      .select('*, market:markets(*)')
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setAnalyses((data as (Analysis & { market?: Market })[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = tab === 'all'
    ? analyses
    : analyses.filter((a) => a.market?.category === tab);

  if (loading) return <FullPageLoader message="Loading analysis..." />;

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Daily Analysis</h1>
        <p className="text-soft">Professional institutional analysis across all markets, updated daily</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Today's Bitcoin", to: '/pair/BTCUSD', emoji: '₿' },
          { label: "Today's Gold", to: '/pair/XAUUSD', emoji: 'Au' },
          { label: "Today's Forex", to: '/pair/EURUSD', emoji: '€' },
          { label: "Today's Indices", to: '/pair/US100', emoji: '📈' },
          { label: "Today's Commodities", to: '/pair/USOIL', emoji: '🛢' },
          { label: "Today's Crypto", to: '/pair/ETHUSD', emoji: 'Ξ' },
        ].map((item) => (
          <Link key={item.label} to={item.to} className="glass rounded-xl p-4 card-hover text-center group">
            <p className="text-2xl mb-1">{item.emoji}</p>
            <p className="text-sm font-medium group-hover:text-gold-400 transition-colors">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {analysisTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.key ? 'btn-gold' : 'btn-ghost'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Analysis Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <Link
              key={a.id}
              to={a.market ? `/pair/${a.market.symbol}` : '/markets'}
              className="glass rounded-2xl p-5 card-hover animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {a.market && (
                    <span className={`text-2xs px-2 py-0.5 rounded-full border ${categoryColor(a.market.category)}`}>
                      {categoryLabel(a.market.category)}
                    </span>
                  )}
                  {a.is_pinned && (
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                </div>
                <span className="text-2xs text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeAgo(a.published_at)}
                </span>
              </div>

              <h3 className="font-display font-semibold text-base mb-2 line-clamp-2">{a.title}</h3>

              {a.market && (
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <span className="font-mono font-semibold">{a.market.symbol}</span>
                  <span className="text-muted">{formatPrice(a.market.live_price)}</span>
                  <span className={a.market.price_change_pct >= 0 ? 'text-bull' : 'text-bear'}>
                    {a.market.price_change_pct >= 0 ? '+' : ''}{a.market.price_change_pct.toFixed(2)}%
                  </span>
                </div>
              )}

              {a.trade_setup && (
                <p className="text-sm text-soft line-clamp-2 mb-3">{a.trade_setup}</p>
              )}

              <div className="flex items-center gap-4 text-2xs text-muted">
                {a.confidence_score > 0 && (
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" /> {a.confidence_score}% confidence
                  </span>
                )}
                {a.analyst_name && <span>{a.analyst_name}</span>}
                <span className="ml-auto flex items-center gap-1 text-gold-400">
                  Read more <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No analysis published yet.</p>
          <p className="text-sm text-muted">Check back soon for institutional-grade market analysis.</p>
        </div>
      )}
    </div>
  );
}
