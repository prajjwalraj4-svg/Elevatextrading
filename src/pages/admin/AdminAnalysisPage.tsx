import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Analysis, Market } from '@/types';
import { formatDate, timeAgo, categoryColor } from '@/lib/utils';
import {
  TrendingUp, Plus, Trash2, Pencil, X, Save, Pin, PinOff,
  AlertCircle, Loader2,
} from 'lucide-react';

export function AdminAnalysisPage({ markets }: { markets: Market[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Analysis | null>(null);
  const [analyses, setAnalyses] = useState<(Analysis & { market?: Market })[]>([]);

  const emptyForm = {
    title: '', market_id: markets[0]?.id ?? '', analysis_type: 'daily' as const,
    content: '', institutional_view: '', trade_setup: '', risk_warning: '',
    support_levels: '', resistance_levels: '', support_zone: '', resistance_zone: '',
    supply_zone: '', demand_zone: '', liquidity_zone: '', entry_zone: '',
    stop_loss: '', take_profit_1: '', take_profit_2: '', take_profit_3: '',
    risk_reward_ratio: '', market_structure: '', smc_analysis: '',
    analyst_name: '', confidence_score: 70, market_sentiment: 'neutral',
    buy_probability: 60, sell_probability: 40, expected_direction: 'bullish',
    estimated_volatility: 'medium', status: 'published' as const,
  };

  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    const { data } = await supabase
      .from('analysis')
      .select('*, market:markets(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    setAnalyses((data as (Analysis & { market?: Market })[]) ?? []);
  };

  useEffect(() => { fetchAnalyses(); }, []);

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const handleEdit = (a: Analysis & { market?: Market }) => {
    setEditing(a);
    setForm({ ...a });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    if (editing) {
      const { error } = await supabase.from('analysis').update(form).eq('id', editing.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('analysis').insert(form);
      if (error) setError(error.message);
    }
    setSaving(false);
    if (!error) { setShowForm(false); setForm(emptyForm); setEditing(null); fetchAnalyses(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis?')) return;
    await supabase.from('analysis').delete().eq('id', id);
    fetchAnalyses();
  };

  const togglePin = async (a: Analysis) => {
    await supabase.from('analysis').update({ is_pinned: !a.is_pinned }).eq('id', a.id);
    fetchAnalyses();
  };

  const fields: { key: string; label: string; type: string; options?: any[]; full?: boolean }[] = [
    { key: 'title', label: 'Title', type: 'text', full: true },
    { key: 'market_id', label: 'Trading Pair', type: 'select', options: markets.map((m) => ({ value: m.id, label: `${m.symbol} — ${m.name}` })) },
    { key: 'analysis_type', label: 'Analysis Type', type: 'select', options: [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }] },
    { key: 'content', label: 'Professional Write-up', type: 'textarea', full: true },
    { key: 'institutional_view', label: 'Institutional View', type: 'textarea', full: true },
    { key: 'trade_setup', label: 'Trade Setup', type: 'textarea', full: true },
    { key: 'smc_analysis', label: 'SMC Analysis', type: 'textarea', full: true },
    { key: 'market_structure', label: 'Market Structure', type: 'textarea', full: true },
    { key: 'support_zone', label: 'Support Zone', type: 'text' },
    { key: 'resistance_zone', label: 'Resistance Zone', type: 'text' },
    { key: 'supply_zone', label: 'Supply Zone', type: 'text' },
    { key: 'demand_zone', label: 'Demand Zone', type: 'text' },
    { key: 'liquidity_zone', label: 'Liquidity Zone', type: 'text' },
    { key: 'entry_zone', label: 'Entry Zone', type: 'text' },
    { key: 'stop_loss', label: 'Stop Loss', type: 'text' },
    { key: 'take_profit_1', label: 'Take Profit 1', type: 'text' },
    { key: 'take_profit_2', label: 'Take Profit 2', type: 'text' },
    { key: 'take_profit_3', label: 'Take Profit 3', type: 'text' },
    { key: 'risk_reward_ratio', label: 'Risk Reward Ratio', type: 'text' },
    { key: 'support_levels', label: 'Support Levels', type: 'text' },
    { key: 'resistance_levels', label: 'Resistance Levels', type: 'text' },
    { key: 'analyst_name', label: 'Analyst Name', type: 'text' },
    { key: 'confidence_score', label: 'Confidence Score (%)', type: 'number' },
    { key: 'buy_probability', label: 'Buy Probability (%)', type: 'number' },
    { key: 'sell_probability', label: 'Sell Probability (%)', type: 'number' },
    { key: 'market_sentiment', label: 'Market Sentiment', type: 'select', options: ['bullish', 'bearish', 'neutral'].map((v) => ({ value: v, label: v })) },
    { key: 'expected_direction', label: 'Expected Direction', type: 'select', options: ['bullish', 'bearish', 'neutral'].map((v) => ({ value: v, label: v })) },
    { key: 'estimated_volatility', label: 'Estimated Volatility', type: 'select', options: ['low', 'medium', 'high'].map((v) => ({ value: v, label: v })) },
    { key: 'risk_warning', label: 'Risk Warning', type: 'textarea', full: true },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }, { value: 'scheduled', label: 'Scheduled' }] },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl mb-1">Upload Daily Analysis</h2>
          <p className="text-sm text-soft">Create institutional-grade analysis with full SMC data for any trading pair</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Analysis
        </button>
      </div>

      <div className="space-y-3">
        {analyses.map((a) => (
          <div key={a.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm truncate">{a.title}</span>
                {a.is_pinned && <Pin className="w-3.5 h-3.5 text-gold-400 shrink-0" />}
                {a.market && <span className={`text-2xs px-2 py-0.5 rounded-full border ${categoryColor(a.market.category)}`}>{a.market.symbol}</span>}
              </div>
              <p className="text-2xs text-muted">{a.analysis_type} · {timeAgo(a.created_at)} · {a.status}</p>
            </div>
            <button onClick={() => togglePin(a)} className="p-2 rounded-lg btn-ghost" title={a.is_pinned ? 'Unpin' : 'Pin'}>
              {a.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            <button onClick={() => handleEdit(a)} className="p-2 rounded-lg btn-ghost"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg btn-ghost text-bear"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {analyses.length === 0 && <p className="text-sm text-muted text-center py-8">No analysis published yet.</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">{editing ? 'Edit Analysis' : 'New Daily Analysis'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key} className={f.full ? 'md:col-span-2' : ''}>
                    <label className="text-sm text-soft mb-1.5 block">{f.label}</label>
                    {f.type === 'text' && <input type="text" value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} required={f.key === 'title'} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />}
                    {f.type === 'number' && <input type="number" value={form[f.key] ?? 0} onChange={(e) => set(f.key, parseInt(e.target.value) || 0)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />}
                    {f.type === 'textarea' && <textarea value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} rows={3} className="input-field w-full rounded-xl px-4 py-2.5 text-sm resize-none" />}
                    {f.type === 'select' && (
                      <select value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm">
                        {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 w-full justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : editing ? 'Update Analysis' : 'Publish Analysis'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
