import { useEffect, useRef, useState } from 'react';

export interface LivePrice {
  price: number;
  changePct: number;
  change: number;
  isLive: boolean;
  lastUpdated: number;
}

function mapCryptoSymbol(symbol: string): string | null {
  const sym = symbol.toUpperCase();
  if (sym === 'BTCUSD') return 'BTCUSDT';
  if (sym === 'ETHUSD') return 'ETHUSDT';
  if (sym.endsWith('USD') && !sym.endsWith('USDT')) {
    return `${sym.slice(0, -3)}USDT`;
  }
  return null;
}

function mapForexPair(symbol: string): { base: string; quote: string; invert: boolean } | null {
  const sym = symbol.toUpperCase();
  const invertPairs: Record<string, { base: string; quote: string; invert: boolean }> = {
    EURUSD: { base: 'USD', quote: 'EUR', invert: false },
    GBPUSD: { base: 'USD', quote: 'GBP', invert: false },
    AUDUSD: { base: 'USD', quote: 'AUD', invert: false },
    NZDUSD: { base: 'USD', quote: 'NZD', invert: false },
    USDCAD: { base: 'USD', quote: 'CAD', invert: true },
    USDJPY: { base: 'USD', quote: 'JPY', invert: true },
    USDCHF: { base: 'USD', quote: 'CHF', invert: true },
  };
  return invertPairs[sym] ?? null;
}

function useBinanceWebSocket(tvSymbol: string, initial: LivePrice): LivePrice {
  const [price, setPrice] = useState<LivePrice>(initial);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const binanceSymbol = mapCryptoSymbol(tvSymbol);
    if (!binanceSymbol) {
      setPrice(initial);
      return;
    }

    const streamName = `${binanceSymbol.toLowerCase()}@ticker`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const lastPrice = parseFloat(data.c);
        const pct = parseFloat(data.P);
        const change = parseFloat(data.p);
        if (!isNaN(lastPrice)) {
          setPrice({
            price: lastPrice,
            changePct: pct,
            change,
            isLive: true,
            lastUpdated: Date.now(),
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      setPrice((prev) => ({ ...prev, isLive: false }));
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvSymbol]);

  return price;
}

function useForexPolling(tvSymbol: string, initial: LivePrice): LivePrice {
  const [price, setPrice] = useState<LivePrice>(initial);
  const initialRef = useRef(initial);

  useEffect(() => {
    initialRef.current = initial;
  });

  useEffect(() => {
    const pair = mapForexPair(tvSymbol);
    if (!pair) {
      setPrice(initial);
      return;
    }

    let active = true;

    const fetchRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.rates || !active) return;

        const rate = data.rates[pair.quote];
        if (!rate || isNaN(rate)) return;

        const finalRate = pair.invert ? 1 / rate : rate;
        const dbPrice = initialRef.current.price;
        const change = finalRate - dbPrice;
        const changePct = dbPrice > 0 ? (change / dbPrice) * 100 : 0;

        if (active) {
          setPrice({
            price: finalRate,
            changePct,
            change,
            isLive: true,
            lastUpdated: Date.now(),
          });
        }
      } catch {
        if (active) setPrice((prev) => ({ ...prev, isLive: false }));
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvSymbol]);

  return price;
}

export function useLivePrice(
  symbol: string,
  category: string,
  dbPrice: number,
  dbChangePct: number,
): LivePrice {
  const initial: LivePrice = {
    price: dbPrice,
    changePct: dbChangePct,
    change: dbPrice * (dbChangePct / 100),
    isLive: false,
    lastUpdated: 0,
  };

  const cryptoPrice = useBinanceWebSocket(symbol, initial);
  const forexPrice = useForexPolling(symbol, initial);

  if (category === 'crypto') return cryptoPrice;
  if (category === 'forex') return forexPrice;
  return initial;
}
