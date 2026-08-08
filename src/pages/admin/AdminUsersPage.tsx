import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { formatDate } from '@/lib/utils';
import { Users, Crown, Shield, Search } from 'lucide-react';

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as Profile[]) ?? []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateUserPlan = async (id: string, plan: string) => {
    await supabase.from('profiles').update({ plan }).eq('id', id);
    fetchUsers();
  };

  const updateUserRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    fetchUsers();
  };

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const planBadge = (plan: string) => {
    if (plan === 'vip') return 'bg-gold-500/10 text-gold-400 border-gold-500/20';
    if (plan === 'pro') return 'bg-navy-500/10 text-navy-300 border-navy-400/20';
    return 'bg-neutral/10 text-neutral border-neutral/20';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl mb-1">Manage Users</h2>
        <p className="text-sm text-soft">View all registered users and manage their membership plans and roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: <Users className="w-4 h-4" />, color: 'text-navy-300' },
          { label: 'VIP Members', value: users.filter((u) => u.plan === 'vip').length, icon: <Crown className="w-4 h-4" />, color: 'text-gold-400' },
          { label: 'Pro Members', value: users.filter((u) => u.plan === 'pro').length, icon: <Crown className="w-4 h-4" />, color: 'text-navy-300' },
          { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, icon: <Shield className="w-4 h-4" />, color: 'text-bear' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg bg-white/[0.02] border border-base flex items-center justify-center mb-2 ${s.color}`}>
              {s.icon}
            </div>
            <p className="font-display font-bold text-xl">{s.value}</p>
            <p className="text-2xs text-muted uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm" />
      </div>

      {/* Users Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-base">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-base/50 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium truncate">{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-soft truncate">{u.email}</td>
                  <td className="p-4">
                    <select value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)} className="input-field rounded-lg px-2 py-1 text-xs">
                      <option value="user">User</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select value={u.plan} onChange={(e) => updateUserPlan(u.id, e.target.value)} className={`input-field rounded-lg px-2 py-1 text-xs border ${planBadge(u.plan)}`}>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="vip">VIP</option>
                    </select>
                  </td>
                  <td className="p-4 text-xs text-muted hidden md:table-cell">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-sm text-muted text-center py-8">No users found.</p>}
      </div>
    </div>
  );
}
