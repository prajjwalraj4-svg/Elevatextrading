import { useMemo } from 'react';

interface CandleData {
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

function generateCandles(count: number, seed: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = 100 + seed * 7;
  for (let i = 0; i < count; i++) {
    const volatility = 3 + Math.sin(i * 0.3) * 2;
    const open = price;
    const change = (Math.sin(i * 0.5 + seed) + Math.cos(i * 0.3 + seed * 2)) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.abs(Math.sin(i * 0.7 + seed)) * 2;
    const low = Math.min(open, close) - Math.abs(Math.cos(i * 0.4 + seed)) * 2;
    candles.push({ x: i, open, close, high, low });
    price = close;
  }
  return candles;
}

export function AnimatedChartBackground() {
  const candles = useMemo(() => generateCandles(40, 3), []);

  const w = 800;
  const h = 400;
  const candleW = w / candles.length;
  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;

  const y = (p: number) => h - ((p - minP) / range) * (h - 40) - 20;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(212,175,55,0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1="0" y1={h * t} x2={w} y2={h * t}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path
          d={`M 0 ${h} ${candles.map((c) => `L ${c.x * candleW + candleW / 2} ${y(c.close)}`).join(' ')} L ${w} ${h} Z`}
          fill="url(#chartGlow)"
        />

        {/* Candles */}
        {candles.map((c, i) => {
          const isBull = c.close >= c.open;
          const color = isBull ? '#22c55e' : '#ef4444';
          const top = y(Math.max(c.open, c.close));
          const bottom = y(Math.min(c.open, c.close));
          const bodyH = Math.max(bottom - top, 1);
          return (
            <g key={i} style={{ animation: `candle-rise 0.6s ease-out ${i * 0.03}s both` }}>
              <line
                x1={c.x * candleW + candleW / 2}
                y1={y(c.high)}
                x2={c.x * candleW + candleW / 2}
                y2={y(c.low)}
                stroke={color}
                strokeWidth="1"
                opacity="0.6"
              />
              <rect
                x={c.x * candleW + 2}
                y={top}
                width={candleW - 4}
                height={bodyH}
                fill={color}
                opacity="0.7"
                rx="1"
              />
            </g>
          );
        })}

        {/* Moving average line */}
        <path
          d={`M ${candles.map((c, i) => {
            const start = Math.max(0, i - 5);
            const slice = candles.slice(start, i + 1);
            const avg = slice.reduce((s, c) => s + c.close, 0) / slice.length;
            return `${i === 0 ? 'M' : 'L'} ${c.x * candleW + candleW / 2} ${y(avg)}`;
          }).join(' ')}`}
          fill="none"
          stroke="rgba(212,175,55,0.6)"
          strokeWidth="2"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
}

export function MiniChart({ seed = 1, bullish = true }: { seed?: number; bullish?: boolean }) {
  const candles = useMemo(() => generateCandles(20, seed), [seed]);
  const w = 200;
  const h = 60;
  const candleW = w / candles.length;
  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;
  const y = (p: number) => h - ((p - minP) / range) * (h - 8) - 4;

  const color = bullish ? '#22c55e' : '#ef4444';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <path
        d={`M ${candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x * candleW + candleW / 2} ${y(c.close)}`).join(' ')}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.8"
      />
      <path
        d={`M ${candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x * candleW + candleW / 2} ${y(c.close)}`).join(' ')} L ${w} ${h} L 0 ${h} Z`}
        fill={color}
        opacity="0.1"
      />
    </svg>
  );
}
