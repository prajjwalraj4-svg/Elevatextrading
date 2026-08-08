import { useEffect, useState } from 'react';
import { Link, useRouter, navigate } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useMarkets } from '@/lib/hooks';
import {
  Menu, X, Sun, Moon, TrendingUp, LayoutDashboard, LogOut, User, Crown,
  ChevronDown, Search, BarChart3, Newspaper, Phone, Shield, BookOpen,
  CalendarDays, Sparkles, LineChart,
} from 'lucide-react';

export function Navbar() {
  const { path } = useRouter();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { markets } = useMarkets();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketsOpen, setMarketsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Markets', to: '/markets', dropdown: 'markets' as const },
    { label: 'Analysis', to: '/analysis' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'AI Analysis', to: '/ai-analysis' },
    { label: 'Calendar', to: '/calendar' },
    { label: 'Blog', to: '/blog' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Contact', to: '/contact' },
  ];

  const isActive = (to: string) => path === to || (to !== '/' && path.startsWith(to));

  const filteredMarkets = markets.filter((m) =>
    m.symbol.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-base">
        <div className="section-pad max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shadow-gold">
                <TrendingUp className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg tracking-tight">
                  Elevate<span className="gold-text">X</span>
                </span>
                <span className="text-2xs text-muted tracking-widest uppercase">Institutional</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.to} className="relative group">
                  <Link
                    to={item.to}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                      isActive(item.to)
                        ? 'text-gold-400 bg-gold-500/10'
                        : 'text-soft hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                    {item.dropdown && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>
                  {item.dropdown === 'markets' && (
                    <div className="absolute top-full left-0 mt-1 w-[480px] glass-strong rounded-2xl border border-base p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-glass-lg">
                      <input
                        type="text"
                        placeholder="Search markets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field w-full rounded-lg px-3 py-2 text-sm mb-3"
                      />
                      <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto no-scrollbar">
                        {filteredMarkets.map((m) => (
                          <Link
                            key={m.id}
                            to={`/pair/${m.symbol}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <span className={`w-2 h-2 rounded-full ${m.price_change_pct >= 0 ? 'bg-bull' : 'bg-bear'}`} />
                            <span className="text-sm font-medium">{m.symbol}</span>
                            <span className="text-xs text-muted">{m.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg btn-ghost"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg btn-ghost"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-400 to-navy-700 flex items-center justify-center text-xs font-bold">
                      {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-56 glass-strong rounded-xl border border-base p-2 shadow-glass-lg">
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/journal" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                        <BookOpen className="w-4 h-4" /> Trading Journal
                      </Link>
                      <Link to="/performance" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                        <BarChart3 className="w-4 h-4" /> Performance
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-gold-400">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      {profile?.plan === 'free' && (
                        <Link to="/pricing" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-gold-400">
                          <Crown className="w-4 h-4" /> Upgrade
                        </Link>
                      )}
                      <div className="h-px bg-base my-1" />
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); navigate('/'); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm w-full text-left text-bear"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg btn-ghost">Login</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-bold rounded-lg btn-gold">Get Started</Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg btn-ghost"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden glass-strong border-t border-base">
            <div className="section-pad py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(item.to) ? 'text-gold-400 bg-gold-500/10' : 'text-soft'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-medium rounded-lg btn-ghost">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-bold rounded-lg btn-gold">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <div className="h-16" />
    </>
  );
}
