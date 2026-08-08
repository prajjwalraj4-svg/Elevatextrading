import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, navigate } from '@/lib/router';
import { useMarkets } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import type { Analysis, Market, BlogPost, Profile } from '@/types';
import { timeAgo } from '@/lib/utils';
import { AdminChartsPage } from '@/pages/admin/AdminChartsPage';
import { AdminAnalysisPage } from '@/pages/admin/AdminAnalysisPage';
import { AdminPdfPage } from '@/pages/admin/AdminPdfPage';
import { AdminVideoPage } from '@/pages/admin/AdminVideoPage';
import { AdminMarketsPage } from '@/pages/admin/AdminMarketsPage';
import { AdminSocialPage } from '@/pages/admin/AdminSocialPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminNewsPage } from '@/pages/admin/AdminNewsPage';
import {
  Shield, BarChart3, TrendingUp, FileText, Video, Activity,
  Users, Send, ImagePlus, LogOut, Menu, X, Eye, Crown, Newspaper,
} from 'lucide-react';

type Tab = 'overview' | 'charts' | 'analysis' | 'pdf' | 'video' | 'markets' | 'social' | 'users' | 'news';

const menuItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'charts', label: 'Upload Charts', icon: <ImagePlus className="w-4 h-4" /> },
  { key: 'analysis', label: 'Upload Daily Analysis', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'pdf', label: 'Upload PDF Reports', icon: <FileText className="w-4 h-4" /> },
  { key: 'video', label: 'Upload Video Analysis', icon: <Video className="w-4 h-4" /> },
  { key: 'markets', label: 'Manage Trading Pairs', icon: <Activity className="w-4 h-4" /> },
  { key: 'social', label: 'Manage Social Links', icon: <Send className="w-4 h-4" /> },
  { key: 'news', label: 'Publish News', icon: <Newspaper className="w-4 h-4" /> },
  { key: 'users', label: 'Manage Users', icon: <Users className="w-4 h-4" /> },
];

export function AdminPage() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { markets } = useMarkets();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyses, setAnalyses] = useState<(Analysis & { market?: Market })[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [chartCount, setChartCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ data: aData }, { data: bData }, { data: uData }, { data: cData }] = await Promise.all([
        supabase.from('analysis').select('*, market:markets(*)').order('created_at', { ascending: false }).limit(50),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('charts').select('*', { count: 'exact', head: true }),
      ]);
      setAnalyses((aData as (Analysis & { market?: Market })[]) ?? []);
      setBlogPosts((bData as BlogPost[]) ?? []);
      setUsers((uData as Profile[]) ?? []);
      setChartCount(cData?.length ?? 0);
    })();
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="section-pad max-w-2xl mx-auto py-20 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
        <p className="text-xl text-soft mb-2">Admin access required.</p>
        <p className="text-sm text-muted mb-4">You need admin privileges to access this page.</p>
        <Link to="/admin-login" className="btn-gold px-6 py-3 rounded-xl inline-block">Admin Login</Link>
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case 'overview': return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Charts', value: chartCount, icon: <ImagePlus className="w-5 h-5" />, color: 'text-gold-400' },
              { label: 'Total Analysis', value: analyses.length, icon: <TrendingUp className="w-5 h-5" />, color: 'text-navy-300' },
              { label: 'Total Users', value: users.length, icon: <Users className="w-5 h-5" />, color: 'text-bull' },
              { label: 'Active Markets', value: markets.length, icon: <Activity className="w-5 h-5" />, color: 'text-gold-400' },
            ].map((s, i) => (
              <div key={s.label} className="glass rounded-2xl p-5 card-hover animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={`w-10 h-10 rounded-lg bg-white/[0.02] border border-base flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <p className="font-display font-bold text-2xl">{s.value}</p>
                <p className="text-2xs text-muted uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Membership Breakdown</h3>
              <div className="space-y-3">
                {['free', 'pro', 'vip'].map((plan) => {
                  const count = users.filter((u) => u.plan === plan).length;
                  const pct = users.length > 0 ? (count / users.length) * 100 : 0;
                  return (
                    <div key={plan}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{plan}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full ${plan === 'vip' ? 'bg-gold-500' : plan === 'pro' ? 'bg-navy-500' : 'bg-neutral'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Recent Analysis</h3>
              <div className="space-y-2">
                {analyses.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{a.title}</span>
                    <span className="text-2xs text-muted ml-2">{timeAgo(a.created_at)}</span>
                  </div>
                ))}
                {analyses.length === 0 && <p className="text-sm text-muted">No analysis yet.</p>}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => setTab('charts')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg btn-gold text-sm">
                  <ImagePlus className="w-4 h-4" /> Upload Charts
                </button>
                <button onClick={() => setTab('analysis')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg btn-ghost text-sm">
                  <TrendingUp className="w-4 h-4" /> Upload Analysis
                </button>
                <button onClick={() => setTab('markets')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg btn-ghost text-sm">
                  <Activity className="w-4 h-4" /> Manage Trading Pairs
                </button>
                <Link to="/dashboard" className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg btn-ghost text-sm">
                  <Eye className="w-4 h-4" /> View Live Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
      case 'charts': return <AdminChartsPage markets={markets} />;
      case 'analysis': return <AdminAnalysisPage markets={markets} />;
      case 'pdf': return <AdminPdfPage markets={markets} />;
      case 'video': return <AdminVideoPage markets={markets} />;
      case 'markets': return <AdminMarketsPage markets={markets} />;
      case 'social': return <AdminSocialPage />;
      case 'news': return <AdminNewsPage />;
      case 'users': return <AdminUsersPage />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-base">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 glass-strong border-r border-base z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-base">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shadow-gold">
                <Shield className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-display font-bold text-sm">ElevateX Admin</p>
                <p className="text-2xs text-muted">Control Panel</p>
              </div>
            </Link>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === item.key
                    ? 'bg-gold-500/10 text-gold-400 gold-border'
                    : 'text-soft hover:bg-white/5 hover:text-text'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-base space-y-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-800 flex items-center justify-center text-xs font-bold shrink-0">
                {profile?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name || 'Admin'}</p>
                <p className="text-2xs text-muted truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={() => { signOut(); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-bear hover:bg-bear/10 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 glass-strong border-b border-base px-4 md:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg btn-ghost">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted hidden sm:block">{menuItems.find((m) => m.key === tab)?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {profile?.plan === 'vip' && <Crown className="w-4 h-4 text-gold-400" />}
            <Link to="/" className="text-xs px-3 py-1.5 rounded-lg btn-ghost">View Site</Link>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-6 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
