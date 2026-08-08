import type { Trend } from '@/types';

export function formatPrice(price: number): string {
  if (price < 1) return price.toFixed(4);
  if (price < 100) return price.toFixed(2);
  return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function trendColor(trend: Trend | string): string {
  if (trend === 'bullish') return 'text-bull';
  if (trend === 'bearish') return 'text-bear';
  return 'text-neutral';
}

export function trendBg(trend: Trend | string): string {
  if (trend === 'bullish') return 'bg-bull/10 text-bull border-bull/20';
  if (trend === 'bearish') return 'bg-bear/10 text-bear border-bear/20';
  return 'bg-neutral/10 text-neutral border-neutral/20';
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    crypto: 'Crypto',
    forex: 'Forex',
    indices: 'Indices',
    commodities: 'Commodities',
    metals: 'Metals',
  };
  return labels[category] ?? category;
}

export function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    crypto: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    forex: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    indices: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    commodities: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    metals: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };
  return colors[category] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
