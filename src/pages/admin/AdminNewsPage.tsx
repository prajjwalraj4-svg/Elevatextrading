import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { NewsItem } from '@/types';
import { formatDate, timeAgo } from '@/lib/utils';
import {
  Plus, Trash2, Pencil, X, Save, AlertCircle, Loader2,
  CheckCircle, Newspaper, Pin, PinOff,
} from 'lucide-react';

const NEWS_CATEGORIES = ['market', 'breaking', 'crypto', 'forex', 'indices', 'commodities', 'metals', 'education'];

export function AdminNewsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emptyForm = {
    title: '', content: '', excerpt: '', category: 'market',
    image_url: '', author: '', status: 'published' as const,
  };
  const [form, setForm] = useState<any>(emptyForm);
  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false }).limit(50);
    setNews((data as NewsItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleEdit = (n: NewsItem) => {
    setEditing(n);
    setForm({ ...n });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    let dbError: string | null = null;
    if (editing) {
      const { error: upErr } = await supabase.from('news').update(form).eq('id', editing.id);
      if (upErr) dbError = upErr.message;
    } else {
      const { error: inErr } = await supabase.from('news').insert({ ...form, published_at: new Date().toISOString() });
      if (inErr) dbError = inErr.message;
    }
    setSaving(false);
    if (dbError) setError(dbError);
    else {
      setSuccess(editing ? 'News updated!' : 'News published!');
      setTimeout(() => { setShowForm(false); setForm(emptyForm); setEditing(null); fetchNews(); }, 1200);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news article?')) return;
    await supabase.from('news').delete().eq('id', id);
    fetchNews();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl mb-1">Market News</h2>
          <p className="text-sm text-soft">Publish market news that appears on the public website.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold whitespace-nowrap">
          <Plus className="w-4 h-4" /> Publish News
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
      ) : news.length > 0 ? (
        <div className="space-y-3">
          {news.map((n) => (
            <div key={n.id} className="glass rounded-xl p-4 flex items-center gap-4">
              {n.image_url && <img src={n.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm truncate block">{n.title}</span>
                <p className="text-2xs text-muted">{n.category} · {n.status} · {timeAgo(n.published_at)}</p>
                {n.excerpt && <p className="text-sm text-soft line-clamp-1 mt-1">{n.excerpt}</p>}
              </div>
              <button onClick={() => handleEdit(n)} className="p-2 rounded-lg btn-ghost"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg btn-ghost text-bear"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No news published yet.</p>
          <p className="text-sm text-muted">Click "Publish News" to add your first article.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">{editing ? 'Edit News' : 'Publish News'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4"><AlertCircle className="w-4 h-4" /> {error}</div>}
            {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-bull/10 border border-bull/20 text-sm text-bull mb-4"><CheckCircle className="w-4 h-4" /> {success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-soft mb-1.5 block">Title *</label>
                <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="BTC breaks above key resistance..." className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Category</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                    {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Author</label>
                  <input type="text" value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="ElevateX Team" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Excerpt</label>
                <input type="text" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="Short summary..." className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Content</label>
                <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={6} placeholder="Full article content..." className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none" />
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Image URL</label>
                <input type="text" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Status</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3.5 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 w-full justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : editing ? 'Update News' : 'Publish News'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
