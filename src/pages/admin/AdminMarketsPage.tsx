import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Market } from '@/types';
import { categoryColor, categoryLabel } from '@/lib/utils';
import {
  Plus, Trash2, Pencil, X, Save, AlertCircle, Loader2,
  Activity, TrendingUp,
} from 'lucide-react';

export function AdminMarketsPage({ markets: initialMarkets }: { markets: Market[] }) {
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Market | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyForm = {
    symbol: '', name: '', category: 'crypto' as const, logo_url: '',
    live_price: 0, price_change: 0, price_change_pct: 0,
    daily_trend: 'neutral', weekly_trend: 'neutral', monthly_trend: 'neutral',
    market_bias: 'neutral', institutional_bias: 'neutral',
    sort_order: 0, is_active: true,
  };
  const [form, setForm] = useState<any>(emptyForm);

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const handleEdit = (m: Market) => {
    setEditing(m);
    setForm({ ...m });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    if (editing) {
      const { error } = await supabase.from('markets').update(form).eq('id', editing.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('markets').insert(form);
      if (error) setError(error.message);
    }
    setSaving(false);
    if (!error) {
      setShowForm(false); setForm(emptyForm); setEditing(null);
      const { data } = await supabase.from('markets').select('*').eq('is_active', true).order('sort_order', { ascending: true });
      setMarkets((data as Market[]) ?? []);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trading pair? All associated analysis and charts will also be deleted.')) return;
    await supabase.from('markets').delete().eq('id', id);
    const { data } = await supabase.from('markets').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    setMarkets((data as Market[]) ?? []);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl mb-1">Manage Trading Pairs</h2>
          <p className="text-sm text-soft">Add, edit, or remove trading pairs. New pairs appear instantly across the platform.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Trading Pair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map((m) => (
          <div key={m.id} className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-bold text-lg">{m.symbol}</span>
                  <span className={`text-2xs px-2 py-0.5 rounded-full border ${categoryColor(m.category)}`}>{categoryLabel(m.category)}</span>
                </div>
                <p className="text-sm text-muted">{m.name}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(m)} className="p-2 rounded-lg btn-ghost"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg btn-ghost text-bear"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono">{m.live_price.toLocaleString()}</span>
              <span className={m.price_change_pct >= 0 ? 'text-bull' : 'text-bear'}>
                {m.price_change_pct >= 0 ? '+' : ''}{m.price_change_pct.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-2xs text-muted">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {m.daily_trend}</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {m.market_bias}</span>
              <span className="ml-auto">Order: {m.sort_order}</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">{editing ? 'Edit Trading Pair' : 'Add New Trading Pair'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4"><AlertCircle className="w-4 h-4" /> {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Symbol *</label>
                  <input type="text" value={form.symbol} onChange={(e) => set('symbol', e.target.value.toUpperCase())} required placeholder="BTCUSD" className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Bitcoin" className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Category</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm">
                    <option value="crypto">Crypto</option>
                    <option value="forex">Forex</option>
                    <option value="indices">Indices</option>
                    <option value="commodities">Commodities</option>
                    <option value="metals">Metals</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Logo URL</label>
                  <input type="text" value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://..." className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Live Price</label>
                  <input type="number" step="any" value={form.live_price} onChange={(e) => set('live_price', parseFloat(e.target.value) || 0)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Price Change</label>
                  <input type="number" step="any" value={form.price_change} onChange={(e) => set('price_change', parseFloat(e.target.value) || 0)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Change %</label>
                  <input type="number" step="any" value={form.price_change_pct} onChange={(e) => set('price_change_pct', parseFloat(e.target.value) || 0)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'daily_trend', label: 'Daily Trend' },
                  { key: 'weekly_trend', label: 'Weekly Trend' },
                  { key: 'monthly_trend', label: 'Monthly Trend' },
                  { key: 'market_bias', label: 'Market Bias' },
                  { key: 'institutional_bias', label: 'Institutional Bias' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-sm text-soft mb-1.5 block">{f.label}</label>
                    <select value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm">
                      <option value="bullish">Bullish</option>
                      <option value="bearish">Bearish</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                ))}
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>

              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3.5 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 w-full justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : editing ? 'Update Pair' : 'Add Trading Pair'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
