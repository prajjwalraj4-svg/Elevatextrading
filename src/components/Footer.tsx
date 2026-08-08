import { Link } from '@/lib/router';
import { useSocialLinks } from '@/lib/hooks';
import {
  TrendingUp, Send, MessageCircle, Instagram, Youtube, Twitter, Facebook,
  Linkedin, Mail, ArrowUp, Shield, FileText, Cookie, RotateCcw, AlertTriangle, Copyright,
} from 'lucide-react';

const platformIcons: Record<string, React.ReactNode> = {
  telegram: <Send className="w-4 h-4" />,
  whatsapp: <MessageCircle className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  x: <Twitter className="w-4 h-4" />,
  discord: <MessageCircle className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
};

export function Footer() {
  const socialLinks = useSocialLinks();

  return (
    <footer className="relative mt-20 border-t border-base bg-soft">
      <div className="absolute inset-0 bg-radial-gold opacity-30 pointer-events-none" />
      <div className="section-pad max-w-[1600px] mx-auto relative">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 py-14">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shadow-gold">
                <TrendingUp className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-lg">
                Elevate<span className="gold-text">X</span>
              </span>
            </Link>
            <p className="text-sm text-soft leading-relaxed max-w-xs mb-4">
              Institutional-grade Support & Resistance analysis for Bitcoin, Gold, Forex, Indices, and Crypto using Smart Money Concepts and Market Structure.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-soft hover:text-gold-400 hover:border-gold transition-all"
                  title={s.label}
                >
                  {platformIcons[s.platform] ?? <Send className="w-4 h-4" />}
                </a>
              ))}
            </div>
          </div>

          {/* Markets */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Markets</h4>
            <ul className="space-y-2.5 text-sm text-soft">
              <li><Link to="/pair/BTCUSD" className="hover:text-gold-400 transition-colors">Bitcoin</Link></li>
              <li><Link to="/pair/XAUUSD" className="hover:text-gold-400 transition-colors">Gold</Link></li>
              <li><Link to="/pair/EURUSD" className="hover:text-gold-400 transition-colors">Forex</Link></li>
              <li><Link to="/pair/US100" className="hover:text-gold-400 transition-colors">Indices</Link></li>
              <li><Link to="/markets" className="hover:text-gold-400 transition-colors">All Markets</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-soft">
              <li><Link to="/analysis" className="hover:text-gold-400 transition-colors">Daily Analysis</Link></li>
              <li><Link to="/ai-analysis" className="hover:text-gold-400 transition-colors">AI Analysis</Link></li>
              <li><Link to="/calendar" className="hover:text-gold-400 transition-colors">Economic Calendar</Link></li>
              <li><Link to="/dashboard" className="hover:text-gold-400 transition-colors">Live Dashboard</Link></li>
              <li><Link to="/blog" className="hover:text-gold-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm text-soft">
              <li><Link to="/login" className="hover:text-gold-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-gold-400 transition-colors">Register</Link></li>
              <li><Link to="/pricing" className="hover:text-gold-400 transition-colors">Membership</Link></li>
              <li><Link to="/journal" className="hover:text-gold-400 transition-colors">Trading Journal</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-soft">
              <li><Link to="/legal/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/terms" className="hover:text-gold-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-gold-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/legal/refund" className="hover:text-gold-400 transition-colors">Refund Policy</Link></li>
              <li><Link to="/legal/risk" className="hover:text-gold-400 transition-colors">Risk Disclaimer</Link></li>
              <li><Link to="/legal/dmca" className="hover:text-gold-400 transition-colors">DMCA Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-base py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Copyright className="w-3.5 h-3.5" /> {new Date().getFullYear()} ElevateX. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Trading involves substantial risk. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
