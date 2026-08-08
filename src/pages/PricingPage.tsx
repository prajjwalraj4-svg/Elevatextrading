import { Link } from '@/lib/router';
import {
  Check, Crown, Zap, Shield, BarChart3, FileText,
  Video, Send, MessageCircle, Sparkles, ArrowRight, Star,
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with daily market analysis',
    features: [
      'Daily analysis for all markets',
      'Support & resistance levels',
      'Live market dashboard',
      'Economic calendar',
      'Basic AI analysis',
      'Community access',
    ],
    cta: 'Current Plan',
    ctaTo: '/register',
    highlight: false,
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For serious traders who need more depth',
    features: [
      'Everything in Free',
      'VIP institutional levels',
      'Early analysis updates',
      'PDF analysis reports',
      'Video analysis',
      'Weekly & monthly reports',
      'Trading journal (unlimited)',
      'Performance dashboard',
    ],
    cta: 'Upgrade to Pro',
    ctaTo: '/register',
    highlight: true,
    icon: <Zap className="w-6 h-6" />,
  },
  {
    name: 'VIP',
    price: '$149',
    period: '/month',
    description: 'Full institutional-grade experience',
    features: [
      'Everything in Pro',
      'Private Telegram signals',
      'Private WhatsApp group',
      '1-on-1 analyst sessions',
      'Custom pair requests',
      'Priority support',
      'Advanced AI predictions',
      'Exclusive market reports',
    ],
    cta: 'Go VIP',
    ctaTo: '/register',
    highlight: false,
    icon: <Crown className="w-6 h-6" />,
  },
];

export function PricingPage() {
  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass gold-border text-sm mb-4">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span className="text-soft">Membership Plans</span>
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
          Choose Your <span className="gold-text">Trading Edge</span>
        </h1>
        <p className="text-lg text-soft max-w-2xl mx-auto">
          Unlock institutional-grade analysis, AI predictions, and exclusive signals with our premium membership plans.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-8 card-hover animate-fade-up ${
              plan.highlight
                ? 'glass-strong gold-border shadow-gold-lg'
                : 'glass'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full btn-gold text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              plan.highlight ? 'bg-gold-500/10 gold-border text-gold-400' : 'bg-navy-500/10 border border-navy-400/20 text-navy-300'
            }`}>
              {plan.icon}
            </div>

            <h3 className="font-display font-bold text-2xl mb-1">{plan.name}</h3>
            <p className="text-sm text-soft mb-4">{plan.description}</p>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-extrabold text-4xl">{plan.price}</span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>

            <Link
              to={plan.ctaTo}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all mb-6 ${
                plan.highlight ? 'btn-gold' : 'btn-ghost'
              }`}
            >
              {plan.cta} <ArrowRight className="w-4 h-4" />
            </Link>

            <ul className="space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    plan.highlight ? 'bg-gold-500/20 text-gold-400' : 'bg-bull/10 text-bull'
                  }`}>
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="text-soft">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Premium Features Showcase */}
      <div className="mt-16">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-8">
          Premium <span className="gold-text">Benefits</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Send className="w-6 h-6" />, title: 'Private Telegram', desc: 'Get instant VIP signals and analysis directly in your Telegram.' },
            { icon: <MessageCircle className="w-6 h-6" />, title: 'WhatsApp Community', desc: 'Join our exclusive WhatsApp group for real-time market discussions.' },
            { icon: <FileText className="w-6 h-6" />, title: 'PDF Reports', desc: 'Download detailed weekly and monthly analysis reports in PDF format.' },
            { icon: <Video className="w-6 h-6" />, title: 'Video Analysis', desc: 'Watch in-depth video breakdowns of market structure and trade setups.' },
          ].map((item) => (
            <div key={item.title} className="glass rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 gold-border flex items-center justify-center text-gold-400 mb-4">
                {item.icon}
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{item.title}</h3>
              <p className="text-sm text-soft leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mt-16">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-8">
          Trusted by <span className="gold-text">Professional Traders</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Marcus T.', role: 'Full-time Day Trader', text: 'ElevateX has completely transformed my trading. The institutional levels are spot on, and the SMC analysis saves me hours of chart time every day.' },
            { name: 'Sarah K.', role: 'Forex Trader', text: 'The VIP signals are worth every penny. I finally have access to the kind of analysis that institutions use, not retail noise.' },
            { name: 'David R.', role: 'Crypto Investor', text: 'The AI predictions give me confidence in my entries. The probability meters are incredibly accurate for Bitcoin and Ethereum.' },
          ].map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-sm text-soft leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-500 to-navy-800 flex items-center justify-center font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-8">
          Frequently Asked <span className="gold-text">Questions</span>
        </h2>
        <div className="space-y-3">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period.' },
            { q: 'How often is analysis updated?', a: 'Daily analysis is published every morning before market open. Weekly and monthly reports are published at the start of each period.' },
            { q: 'What markets are covered?', a: 'We cover Bitcoin, Ethereum, Gold, Silver, major Forex pairs, global indices, commodities, and over 20 other trading pairs.' },
            { q: 'Is there a free trial?', a: 'The Free plan gives you permanent access to daily analysis. You can upgrade to Pro or VIP anytime for advanced features.' },
          ].map((item) => (
            <details key={item.q} className="glass rounded-xl p-5 group">
              <summary className="font-semibold text-sm cursor-pointer flex items-center justify-between">
                {item.q}
                <span className="text-gold-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-sm text-soft mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
