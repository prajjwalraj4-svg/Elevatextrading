import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Link } from '@/lib/router';
import { Spinner } from '@/components/Loading';
import {
  User, Mail, Crown, Calendar, Shield, BarChart3, BookOpen,
  TrendingUp, Bell, CheckCircle, Save, Camera,
} from 'lucide-react';

export function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setBio(profile.bio);
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="section-pad max-w-2xl mx-auto py-20 text-center">
        <p className="text-xl text-soft mb-4">Please sign in to view your profile.</p>
        <Link to="/login" className="btn-gold px-6 py-3 rounded-xl inline-block">Sign In</Link>
      </div>
    );
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, avatar_url: avatarUrl })
      .eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwMsg(null);
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPwError(error.message);
    else {
      setPwMsg('Password updated successfully.');
      setNewPassword('');
    }
  };

  const planBadge = (plan: string) => {
    if (plan === 'vip') return 'bg-gold-500/10 text-gold-400 border-gold-500/20';
    if (plan === 'pro') return 'bg-navy-500/10 text-navy-300 border-navy-400/20';
    return 'bg-neutral/10 text-neutral border-neutral/20';
  };

  return (
    <div className="section-pad max-w-4xl mx-auto py-12">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-8">My Profile</h1>

      {/* Profile Header */}
      <div className="glass-strong rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gold opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-800 flex items-center justify-center text-3xl font-display font-bold">
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" /> : (fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase())}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg btn-gold flex items-center justify-center cursor-pointer">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setAvatarUrl(reader.result as string);
                reader.readAsDataURL(file);
              }} />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl mb-1">{fullName || 'Anonymous Trader'}</h2>
            <p className="text-sm text-soft mb-2">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              <span className={`text-2xs px-2.5 py-1 rounded-full border font-semibold uppercase ${planBadge(profile?.plan ?? 'free')}`}>
                {profile?.plan ?? 'free'} Plan
              </span>
              {profile?.role === 'admin' && (
                <span className="text-2xs px-2.5 py-1 rounded-full border border-bear/20 bg-bear/10 text-bear font-semibold uppercase">Admin</span>
              )}
              <span className="text-2xs text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Joined {new Date(profile?.created_at ?? Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
          {profile?.plan === 'free' && (
            <Link to="/pricing" className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gold text-sm">
              <Crown className="w-4 h-4" /> Upgrade
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Profile */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gold-400" /> Edit Profile
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm text-soft mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-soft mb-1.5 block">Avatar URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="input-field w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-soft mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us about your trading style..."
                className="input-field w-full rounded-xl px-4 py-2.5 text-sm resize-none"
              />
            </div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gold text-sm disabled:opacity-50">
              {saving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />} Save Changes
            </button>
            {saved && <p className="text-sm text-bull flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Profile saved!</p>}
          </form>
        </div>

        {/* Change Password */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-400" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm text-soft mb-1.5 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                placeholder="••••••••"
                className="input-field w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            {pwError && <p className="text-sm text-bear">{pwError}</p>}
            {pwMsg && <p className="text-sm text-bull flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> {pwMsg}</p>}
            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-ghost text-sm">
              <Shield className="w-4 h-4" /> Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          { icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard', to: '/dashboard' },
          { icon: <BookOpen className="w-5 h-5" />, label: 'Journal', to: '/journal' },
          { icon: <TrendingUp className="w-5 h-5" />, label: 'Performance', to: '/performance' },
          { icon: <Bell className="w-5 h-5" />, label: 'Notifications', to: '/dashboard' },
        ].map((item) => (
          <Link key={item.label} to={item.to} className="glass rounded-xl p-4 card-hover text-center">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 gold-border flex items-center justify-center text-gold-400 mx-auto mb-2">
              {item.icon}
            </div>
            <p className="text-sm font-medium">{item.label}</p>
          </Link>
        ))}
      </div>

      <button onClick={() => signOut()} className="mt-6 px-5 py-2.5 rounded-xl btn-ghost text-sm text-bear">
        Sign Out
      </button>
    </div>
  );
}
