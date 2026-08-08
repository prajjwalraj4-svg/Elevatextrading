import { useEffect, useRef, memo } from 'react';

const categoryToExchange: Record<string, string> = {
  crypto: 'BINANCE',
  forex: 'FX',
  indices: 'SP',
  commodities: 'TVC',
  metals: 'OANDA',
};

function buildTvSymbol(symbol: string, category: string): string {
  const exchange = categoryToExchange[category] ?? 'BINANCE';
  const sym = symbol.toUpperCase();
  if (category === 'crypto') {
    if (sym.endsWith('USD') && !sym.endsWith('USDT')) return `${exchange}:${sym.slice(0, -3)}USDT`;
    return `${exchange}:${sym}`;
  }
  return `${exchange}:${sym}`;
}

function TradingViewChartInner({ symbol, category }: { symbol: string; category: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: buildTvSymbol(symbol, category),
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol, category]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: '100%', width: '100%' }}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
