import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { SocialLink } from '@/types';
import {
  Send, MessageCircle, Instagram, Youtube, Twitter,
  Save, AlertCircle, Loader2, CheckCircle, Plus, Trash2, X,
} from 'lucide-react';

const platformConfig: Record<string, { icon: React.ReactNode; label: string; color: string; placeholder: string }> = {
  telegram: { icon: <Send className="w-5 h-5" />, label: 'Telegram', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', placeholder: 'https://t.me/yourchannel' },
  whatsapp: { icon: <MessageCircle className="w-5 h-5" />, label: 'WhatsApp Community', color: 'bg-green-500/10 text-green-400 border-green-500/20', placeholder: 'https://chat.whatsapp.com/yourgroup' },
  instagram: { icon: <Instagram className="w-5 h-5" />, label: 'Instagram', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', placeholder: 'https://instagram.com/youraccount' },
  youtube: { icon: <Youtube className="w-5 h-5" />, label: 'YouTube', color: 'bg-red-500/10 text-red-400 border-red-500/20', placeholder: 'https://youtube.com/@yourchannel' },
  x: { icon: <Twitter className="w-5 h-5" />, label: 'X (Twitter)', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', placeholder: 'https://x.com/youraccount' },
};

export function AdminSocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emptyForm = { platform: 'telegram', url: '', label: '', sort_order: 0, is_active: true };
  const [form, setForm] = useState<any>(emptyForm);
  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const fetchLinks = async () => {
    const { data } = await supabase.from('social_links').select('*').order('sort_order', { ascending: true });
    setLinks((data as SocialLink[]) ?? []);
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleEdit = (s: SocialLink) => {
    setEditing(s);
    setForm({ ...s });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    let dbError: string | null = null;
    if (editing) {
      const { error: upErr } = await supabase.from('social_links').update(form).eq('id', editing.id);
      if (upErr) dbError = upErr.message;
      else setSuccess('Link updated!');
    } else {
      const { error: inErr } = await supabase.from('social_links').insert(form);
      if (inErr) dbError = inErr.message;
      else setSuccess('Link added!');
    }
    setSaving(false);
    if (dbError) setError(dbError);
    else setTimeout(() => { setShowForm(false); setForm(emptyForm); setEditing(null); fetchLinks(); }, 1200);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this social link?')) return;
    await supabase.from('social_links').delete().eq('id', id);
    fetchLinks();
  };

  const toggleActive = async (s: SocialLink) => {
    await supabase.from('social_links').update({ is_active: !s.is_active }).eq('id', s.id);
    fetchLinks();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl mb-1">Manage Social Links</h2>
          <p className="text-sm text-soft">Update Telegram, WhatsApp, Instagram, X (Twitter), and YouTube links. Changes appear instantly across the website.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Social Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((s) => {
          const cfg = platformConfig[s.platform] ?? { icon: <Send className="w-5 h-5" />, label: s.platform, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', placeholder: '' };
          return (
            <div key={s.id} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{cfg.label}</p>
                  <p className="text-sm text-soft truncate">{s.url}</p>
                  {s.label && <p className="text-2xs text-muted mt-0.5">{s.label}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(s)} className="text-xs px-3 py-1.5 rounded-lg btn-ghost">Edit</button>
                <button onClick={() => toggleActive(s)} className={`text-xs px-3 py-1.5 rounded-lg ${s.is_active ? 'bg-bull/10 text-bull border border-bull/20' : 'btn-ghost'}`}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-xs px-3 py-1.5 rounded-lg btn-ghost text-bear ml-auto">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {links.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center">
          <Send className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No social links yet.</p>
          <p className="text-sm text-muted">Click "Add Social Link" to add your first one.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">{editing ? 'Edit Social Link' : 'Add Social Link'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4"><AlertCircle className="w-4 h-4" /> {error}</div>}
            {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-bull/10 border border-bull/20 text-sm text-bull mb-4"><CheckCircle className="w-4 h-4" /> {success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-soft mb-1.5 block">Platform</label>
                <select value={form.platform} onChange={(e) => set('platform', e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                  {Object.entries(platformConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">URL *</label>
                <input type="text" value={form.url} onChange={(e) => set('url', e.target.value)} required placeholder={platformConfig[form.platform]?.placeholder ?? 'https://...'} className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Button Label</label>
                <input type="text" value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="Join Telegram" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)} className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3.5 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 w-full justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
