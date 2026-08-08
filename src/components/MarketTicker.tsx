import { useMarkets } from '@/lib/hooks';
import { Link } from '@/lib/router';

export function MarketTicker() {
  const { markets } = useMarkets();

  if (markets.length === 0) return null;

  const tickerItems = [...markets, ...markets];

  return (
    <div className="relative overflow-hidden border-y border-base bg-soft py-2.5">
      <div className="flex animate-ticker gap-8 whitespace-nowrap">
        {tickerItems.map((m, i) => (
          <Link
            key={`${m.id}-${i}`}
            to={`/pair/${m.symbol}`}
            className="flex items-center gap-2 text-sm shrink-0"
          >
            <span className="font-semibold">{m.symbol}</span>
            <span className="text-muted">
              {m.live_price.toLocaleString(undefined, { maximumFractionDigits: m.live_price < 10 ? 4 : 2 })}
            </span>
            <span className={m.price_change_pct >= 0 ? 'text-bull' : 'text-bear'}>
              {m.price_change_pct >= 0 ? '+' : ''}{m.price_change_pct.toFixed(2)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
