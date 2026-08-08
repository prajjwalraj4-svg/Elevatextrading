import { useState } from 'react';
import { Link } from '@/lib/router';
import { useMarkets } from '@/lib/hooks';
import { MiniChart } from '@/components/AnimatedChart';
import { FullPageLoader } from '@/components/Loading';
import { formatPrice, categoryColor, categoryLabel, trendBg } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';

const categories = ['all', 'crypto', 'forex', 'indices', 'commodities', 'metals'];

export function MarketsPage() {
  const { markets, loading } = useMarkets();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = markets.filter((m) => {
    const matchSearch = m.symbol.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || m.category === category;
    return matchSearch && matchCat;
  });

  if (loading) return <FullPageLoader message="Loading markets..." />;

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Trading Markets</h1>
        <p className="text-soft">Browse all supported trading pairs with live prices and institutional analysis</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'btn-gold'
                  : 'btn-ghost'
              }`}
            >
              {cat === 'all' ? 'All' : categoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((m, i) => (
          <Link
            key={m.id}
            to={`/pair/${m.symbol}`}
            className="glass rounded-2xl p-5 card-hover group animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-bold text-lg">{m.symbol}</span>
                  <span className={`text-2xs px-2 py-0.5 rounded-full border ${categoryColor(m.category)}`}>
                    {categoryLabel(m.category)}
                  </span>
                </div>
                <p className="text-sm text-muted">{m.name}</p>
              </div>
              <span className={`text-2xs px-2 py-1 rounded-full border ${trendBg(m.daily_trend)}`}>
                {m.daily_trend}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono font-semibold text-xl">{formatPrice(m.live_price)}</p>
                <p className={`text-sm font-medium ${m.price_change_pct >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {m.price_change_pct >= 0 ? '+' : ''}{m.price_change_pct.toFixed(2)}%
                </p>
              </div>
              <div className="w-24 h-12 opacity-70 group-hover:opacity-100 transition-opacity">
                <MiniChart seed={i + 1} bullish={m.price_change_pct >= 0} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No markets found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
