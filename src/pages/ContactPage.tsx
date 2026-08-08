import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useSocialLinks } from '@/lib/hooks';
import {
  Send, MessageCircle, Mail, MapPin, Phone, ChevronDown,
  CheckCircle, AlertCircle, HelpCircle, Headphones,
} from 'lucide-react';

const faqs = [
  { q: 'What markets does ElevateX cover?', a: 'We cover Bitcoin, Ethereum, Gold, Silver, major Forex pairs (EURUSD, GBPUSD, USDJPY, etc.), global indices (NASDAQ, US30, S&P500, DAX, NIFTY), and commodities (Crude Oil, Natural Gas, Copper). New pairs are added regularly.' },
  { q: 'How often is analysis updated?', a: 'Daily analysis is published every morning before market open. Weekly analysis is posted at the start of each trading week, and monthly analysis at the beginning of each month.' },
  { q: 'What is Smart Money Concepts (SMC)?', a: 'SMC is a trading methodology that focuses on institutional order flow, liquidity zones, order blocks, fair value gaps, and market structure shifts to identify high-probability trading opportunities.' },
  { q: 'Can I cancel my membership?', a: 'Yes, you can cancel anytime. Your access continues until the end of your current billing period, and you keep your Free plan access afterward.' },
  { q: 'Do you provide trade signals?', a: 'VIP members receive private Telegram and WhatsApp signals with entry, stop loss, and take profit levels. Pro members get detailed analysis with trade setups but not direct signals.' },
  { q: 'Is this financial advice?', a: 'No. All analysis is for educational purposes only. Trading involves substantial risk. Always do your own research and never trade with money you cannot afford to lose.' },
];

export function ContactPage() {
  const socialLinks = useSocialLinks();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('support_tickets')
      .insert({ name, email, subject, message });
    setLoading(false);
    if (error) setError('Failed to send message. Please try again.');
    else {
      setSent(true);
      setName(''); setEmail(''); setSubject(''); setMessage('');
    }
  };

  const platformIcons: Record<string, React.ReactNode> = {
    telegram: <Send className="w-5 h-5" />,
    whatsapp: <MessageCircle className="w-5 h-5" />,
    instagram: <Mail className="w-5 h-5" />,
    youtube: <Headphones className="w-5 h-5" />,
    x: <Send className="w-5 h-5" />,
    discord: <MessageCircle className="w-5 h-5" />,
    facebook: <Mail className="w-5 h-5" />,
    linkedin: <Mail className="w-5 h-5" />,
  };

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Get in Touch</h1>
        <p className="text-soft">Have questions? We're here to help. Reach out through any channel below.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Contact Form */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <h2 className="font-display font-semibold text-xl mb-6">Send a Message</h2>
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-bull mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Message Sent!</p>
              <p className="text-sm text-soft">We'll get back to you as soon as possible.</p>
              <button onClick={() => setSent(false)} className="mt-4 btn-ghost px-5 py-2.5 rounded-xl text-sm">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-field w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field w-full rounded-xl px-4 py-2.5 text-sm" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="input-field w-full rounded-xl px-4 py-2.5 text-sm" placeholder="How can we help?" />
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="input-field w-full rounded-xl px-4 py-2.5 text-sm resize-none" placeholder="Tell us more..." />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl btn-gold text-sm font-bold disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info & Social */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-semibold text-xl mb-4">Connect With Us</h2>
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl glass card-hover"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 gold-border flex items-center justify-center text-gold-400">
                    {platformIcons[s.platform] ?? <Send className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold capitalize truncate">{s.platform}</p>
                    <p className="text-2xs text-muted truncate">{s.label}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-semibold text-xl mb-4">Contact Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-navy-500/10 border border-navy-400/20 flex items-center justify-center text-navy-300">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-soft">support@elevatex.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-navy-500/10 border border-navy-400/20 flex items-center justify-center text-navy-300">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-soft">+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-navy-500/10 border border-navy-400/20 flex items-center justify-center text-navy-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-soft">London, United Kingdom</span>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="glass rounded-2xl p-6">
            <div className="aspect-video rounded-xl bg-grid-navy bg-grid flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gold-400/50" />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-gold-400" /> Frequently Asked <span className="gold-text">Questions</span>
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-sm">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gold-400 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-soft leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
