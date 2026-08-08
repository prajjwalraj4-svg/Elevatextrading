import { Link } from '@/lib/router';
import { useMarkets } from '@/lib/hooks';
import { AnimatedChartBackground, MiniChart } from '@/components/AnimatedChart';
import { formatPrice, categoryColor, categoryLabel, trendBg } from '@/lib/utils';
import {
  TrendingUp, Send, MessageCircle, Instagram, Lock, Crown, Sparkles,
  BarChart3, Target, Shield, LineChart, CalendarDays, BookOpen, Zap,
  ArrowRight, Activity, Layers, Eye, Brain, Newspaper, Award,
} from 'lucide-react';

export function HomePage() {
  const { markets, loading } = useMarkets();
  const featured = markets.slice(0, 6);

  const heroButtons = [
    { label: "View Today's Analysis", to: '/analysis', icon: <BarChart3 className="w-4 h-4" />, primary: true },
    { label: 'Join Telegram', to: '/contact', icon: <Send className="w-4 h-4" /> },
    { label: 'Join WhatsApp', to: '/contact', icon: <MessageCircle className="w-4 h-4" /> },
    { label: 'Follow Instagram', to: '/contact', icon: <Instagram className="w-4 h-4" /> },
    { label: 'Login', to: '/login', icon: <Lock className="w-4 h-4" /> },
    { label: 'Become Premium', to: '/pricing', icon: <Crown className="w-4 h-4" />, gold: true },
  ];

  const features = [
    { icon: <Target className="w-6 h-6" />, title: 'Support & Resistance', desc: 'Daily institutional support and resistance levels for every major market with precise entry and exit zones.' },
    { icon: <Brain className="w-6 h-6" />, title: 'Smart Money Concepts', desc: 'SMC analysis including order blocks, liquidity zones, fair value gaps, and market structure shifts.' },
    { icon: <Activity className="w-6 h-6" />, title: 'Institutional Order Flow', desc: 'Track where smart money is positioning. Follow institutional footprints, not retail noise.' },
    { icon: <Sparkles className="w-6 h-6" />, title: 'AI Market Analysis', desc: 'AI-powered trend predictions with confidence scores, bullish/bearish probability, and risk scoring.' },
    { icon: <CalendarDays className="w-6 h-6" />, title: 'Economic Calendar', desc: 'Real-time economic events with impact levels, forecasts, previous data, and affected currencies.' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Live Market Dashboard', desc: 'Live prices, heatmaps, Fear & Greed index, trading sessions, top gainers and losers at a glance.' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'Trading Education', desc: 'Comprehensive blog covering SMC tutorials, risk management, trading psychology, and market news.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Risk Management', desc: 'Every analysis includes stop loss, take profit levels, and risk-reward ratios for disciplined trading.' },
  ];

  const stats = [
    { label: 'Markets Covered', value: '21+', suffix: '' },
    { label: 'Daily Analysis', value: '100', suffix: '+' },
    { label: 'Win Rate', value: '78', suffix: '%' },
    { label: 'Active Traders', value: '12', suffix: 'K+' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-ink-950" />
        <div className="absolute inset-0 bg-grid-navy bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-navy" />
        <AnimatedChartBackground />

        {/* Floating glow orbs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-navy-500/15 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="section-pad max-w-[1600px] mx-auto relative z-10 py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass gold-border text-sm mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-bull animate-pulse-glow" />
              <span className="text-soft">Live institutional analysis updated daily</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 animate-fade-up animate-delay-100">
              Institutional <span className="gold-text">Support & Resistance</span> Analysis
            </h1>

            <p className="text-lg md:text-xl text-soft leading-relaxed max-w-3xl mb-8 animate-fade-up animate-delay-200">
              Daily professional support & resistance analysis for Bitcoin, Gold, Forex, Indices, Commodities and Crypto using Smart Money Concepts (SMC), Market Structure and Institutional Order Flow.
            </p>

            <div className="flex flex-wrap gap-3 animate-fade-up animate-delay-300">
              {heroButtons.map((btn) => (
                <Link
                  key={btn.label}
                  to={btn.to}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    btn.gold
                      ? 'btn-gold'
                      : btn.primary
                      ? 'bg-navy-600 hover:bg-navy-500 text-white border border-navy-400/30 hover:shadow-glow'
                      : 'btn-ghost'
                  }`}
                >
                  {btn.icon}
                  {btn.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ink-950 to-transparent" />
      </section>

      {/* Stats Bar */}
      <section className="section-pad max-w-[1600px] mx-auto -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="glass rounded-2xl p-6 text-center card-hover animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <p className="font-display font-extrabold text-3xl md:text-4xl gold-text">
                {s.value}<span className="text-gold-400">{s.suffix}</span>
              </p>
              <p className="text-sm text-soft mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Markets */}
      <section className="section-pad max-w-[1600px] mx-auto py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-2">Featured Markets</h2>
            <p className="text-soft">Real-time prices and institutional bias across major trading pairs</p>
          </div>
          <Link to="/markets" className="hidden md:flex items-center gap-2 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors">
            View All Markets <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((m, i) => (
              <Link
                key={m.id}
                to={`/pair/${m.symbol}`}
                className="glass rounded-2xl p-5 card-hover group animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
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
        )}
      </section>

      {/* Features Grid */}
      <section className="section-pad max-w-[1600px] mx-auto py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass gold-border text-sm mb-4">
            <Award className="w-4 h-4 text-gold-400" />
            <span className="text-soft">Premium Features</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
            Everything You Need to <span className="gold-text">Trade Like Institutions</span>
          </h2>
          <p className="text-soft max-w-2xl mx-auto">
            Professional-grade tools and analysis that give you the edge in any market condition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 card-hover animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 gold-border flex items-center justify-center text-gold-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-soft leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-pad max-w-[1600px] mx-auto py-20">
        <div className="relative glass-strong rounded-3xl p-10 md:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-radial-gold opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="font-display font-bold text-3xl md:text-5xl mb-4">
              Ready to <span className="gold-text">Elevate</span> Your Trading?
            </h2>
            <p className="text-lg text-soft mb-8">
              Join thousands of professional traders who rely on ElevateX for institutional-grade market analysis every day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="flex items-center gap-2 px-6 py-3.5 rounded-xl btn-gold text-base">
                <Crown className="w-5 h-5" /> Start Free Today
              </Link>
              <Link to="/pricing" className="flex items-center gap-2 px-6 py-3.5 rounded-xl btn-ghost text-base">
                View Plans <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
