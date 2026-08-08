import { Link } from '@/lib/router';
import {
  Brain, TrendingUp, TrendingDown, Minus, Sparkles, Gauge,
  Activity, Target, Shield, Zap, ArrowRight, BarChart3,
} from 'lucide-react';

const aiPredictions = [
  { symbol: 'BTCUSD', name: 'Bitcoin', direction: 'Bullish', confidence: 78, bullish: 72, bearish: 18, neutral: 10, risk: 'Medium', suggestion: 'Long on retest of 66,200 support zone', bias: 'Institutional accumulation detected' },
  { symbol: 'XAUUSD', name: 'Gold', direction: 'Bullish', confidence: 85, bullish: 80, bearish: 12, neutral: 8, risk: 'Low', suggestion: 'Hold longs, target 2,400 resistance', bias: 'Strong demand zone holding' },
  { symbol: 'EURUSD', name: 'EUR/USD', direction: 'Neutral', confidence: 52, bullish: 38, bearish: 42, neutral: 20, risk: 'High', suggestion: 'Wait for range break before entering', bias: 'Consolidation phase, no clear institutional bias' },
  { symbol: 'US100', name: 'NASDAQ', direction: 'Bullish', confidence: 71, bullish: 65, bearish: 22, neutral: 13, risk: 'Medium', suggestion: 'Buy dips toward 18,000 support', bias: 'Order block intact, momentum building' },
  { symbol: 'USOIL', name: 'Crude Oil', direction: 'Bearish', confidence: 68, bullish: 25, bearish: 65, neutral: 10, risk: 'Medium', suggestion: 'Short on rejection at 84.00 resistance', bias: 'Supply zone overhead, distribution detected' },
  { symbol: 'ETHUSD', name: 'Ethereum', direction: 'Bullish', confidence: 74, bullish: 68, bearish: 20, neutral: 12, risk: 'Medium', suggestion: 'Long on FVG fill at 3,380', bias: 'Smart money accumulating below 3,400' },
];

const dirColor = (dir: string) => {
  if (dir === 'Bullish') return 'text-bull bg-bull/10 border-bull/20';
  if (dir === 'Bearish') return 'text-bear bg-bear/10 border-bear/20';
  return 'text-neutral bg-neutral/10 border-neutral/20';
};

const dirIcon = (dir: string) => {
  if (dir === 'Bullish') return <TrendingUp className="w-4 h-4" />;
  if (dir === 'Bearish') return <TrendingDown className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
};

export function AIAnalysisPage() {
  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      {/* Hero */}
      <div className="relative glass-strong rounded-3xl p-8 md:p-12 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-radial-navy opacity-50" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-navy-500/20 blur-3xl animate-float" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass gold-border text-sm mb-4">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-soft">AI-Powered Market Intelligence</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl mb-4">
            AI Market <span className="gold-text">Analysis</span>
          </h1>
          <p className="text-lg text-soft max-w-2xl">
            Advanced machine learning models analyze market structure, order flow, and institutional patterns to deliver predictive insights with confidence scoring.
          </p>
        </div>
      </div>

      {/* AI Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {aiPredictions.map((p, i) => (
          <div key={p.symbol} className="glass rounded-2xl p-6 card-hover animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg">{p.symbol}</h3>
                <p className="text-sm text-muted">{p.name}</p>
              </div>
              <span className={`text-2xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 font-semibold ${dirColor(p.direction)}`}>
                {dirIcon(p.direction)} {p.direction}
              </span>
            </div>

            {/* Confidence */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> AI Confidence</span>
                <span className="font-mono font-semibold">{p.confidence}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-700"
                  style={{ width: `${p.confidence}%` }}
                />
              </div>
            </div>

            {/* Probability Bars */}
            <div className="space-y-2 mb-4">
              {[
                { label: 'Bullish', value: p.bullish, color: 'bg-bull' },
                { label: 'Bearish', value: p.bearish, color: 'bg-bear' },
                { label: 'Neutral', value: p.neutral, color: 'bg-neutral' },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-2xs mb-0.5">
                    <span className="text-muted">{bar.label} Probability</span>
                    <span className="font-mono">{bar.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full transition-all duration-700`} style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestion */}
            <div className="p-3 rounded-xl bg-gold-500/10 gold-border mb-3">
              <p className="text-2xs text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> AI Trade Suggestion
              </p>
              <p className="text-sm text-soft">{p.suggestion}</p>
            </div>

            {/* Risk & Bias */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Risk: <span className={`font-semibold ${p.risk === 'Low' ? 'text-bull' : p.risk === 'High' ? 'text-bear' : 'text-gold-400'}`}>{p.risk}</span>
              </span>
              <span className="text-muted flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> {p.bias}
              </span>
            </div>

            <Link to={`/pair/${p.symbol}`} className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg btn-ghost text-sm group">
              View Full Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>

      {/* AI Info */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-navy-500/10 border border-navy-400/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-navy-300" />
          </div>
          <h2 className="font-display font-bold text-xl">How AI Analysis Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <BarChart3 className="w-5 h-5" />, title: 'Pattern Recognition', desc: 'AI models analyze thousands of historical chart patterns and market structure shifts to identify high-probability setups.' },
            { icon: <Activity className="w-5 h-5" />, title: 'Order Flow Analysis', desc: 'Institutional order flow data is processed to detect accumulation, distribution, and smart money positioning.' },
            { icon: <Zap className="w-5 h-5" />, title: 'Real-Time Predictions', desc: 'Models continuously update predictions based on live price action, volume, and volatility data across all markets.' },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl bg-white/[0.02] border border-base">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 gold-border flex items-center justify-center text-gold-400 mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-sm text-soft leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-6">
          Disclaimer: AI predictions are for educational purposes only and do not constitute financial advice. Always conduct your own research and manage risk appropriately.
        </p>
      </div>
    </div>
  );
}
