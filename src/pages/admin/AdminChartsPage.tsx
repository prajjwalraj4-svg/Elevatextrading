import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Market, Chart } from '@/types';
import { formatDate, categoryColor, categoryLabel } from '@/lib/utils';
import {
  ImagePlus, Upload, Save, Trash2, Pencil, X, Pin, PinOff,
  AlertCircle, CheckCircle, FileImage, Loader2, Search, ChevronLeft,
  ChevronRight, Filter,
} from 'lucide-react';

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];
const CHART_CATEGORIES = ['chart', 'tradingview', 'before_after', 'entry', 'exit'];
const BIASES: { value: 'buy' | 'sell' | 'neutral'; label: string; color: string }[] = [
  { value: 'buy', label: 'Buy', color: 'bg-bull/20 text-bull border-bull/40' },
  { value: 'sell', label: 'Sell', color: 'bg-bear/20 text-bear border-bear/40' },
  { value: 'neutral', label: 'Neutral', color: 'bg-neutral/20 text-neutral border-neutral/40' },
];

const biasColor = (b: string) => BIASES.find((x) => x.value === b)?.color ?? BIASES[2].color;
const biasLabel = (b: string) => BIASES.find((x) => x.value === b)?.label ?? 'Neutral';

async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' }));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function AdminChartsPage({ markets }: { markets: Market[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Chart | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [filterMarket, setFilterMarket] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 9;

  const [marketId, setMarketId] = useState(markets[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('chart');
  const [chartDate, setChartDate] = useState(new Date().toISOString().slice(0, 10));
  const [chartTime, setChartTime] = useState(new Date().toTimeString().slice(0, 5));
  const [timeframe, setTimeframe] = useState('1D');
  const [bias, setBias] = useState<'buy' | 'sell' | 'neutral'>('neutral');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [existingUrl, setExistingUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCharts = useCallback(async () => {
    setLoadingCharts(true);
    let q = supabase.from('charts').select('*').order('is_pinned', { ascending: false }).order('chart_date', { ascending: false });
    if (filterMarket !== 'all') q = q.eq('market_id', filterMarket);
    const { data, error: fetchErr } = await q;
    if (fetchErr) console.error('Failed to fetch charts:', fetchErr.message);
    setCharts((data as Chart[]) ?? []);
    setLoadingCharts(false);
  }, [filterMarket]);

  useEffect(() => { fetchCharts(); }, [fetchCharts]);

  const filteredCharts = charts.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (c.title?.toLowerCase().includes(s)) || (c.description?.toLowerCase().includes(s));
  });
  const totalPages = Math.max(1, Math.ceil(filteredCharts.length / pageSize));
  const pagedCharts = filteredCharts.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => { if (page >= totalPages) setPage(totalPages - 1); }, [totalPages, page]);

  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setCategory('chart');
    setChartDate(new Date().toISOString().slice(0, 10));
    setChartTime(new Date().toTimeString().slice(0, 5));
    setTimeframe('1D');
    setBias('neutral');
    setImageFile(null);
    setPreviewUrl('');
    setExistingUrl('');
    setError(null);
    setSuccess(null);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    setError(null);
    setCompressing(true);
    const compressed = await compressImage(file);
    setCompressing(false);
    setImageFile(compressed);
    setPreviewUrl(URL.createObjectURL(compressed));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop() || 'webp';
    const fileName = `charts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('uploads')
      .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
    if (upErr) {
      setError(`Upload failed: ${upErr.message}`);
      return null;
    }
    const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return pubData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    let finalUrl = existingUrl;

    if (imageFile) {
      setUploading(true);
      const uploaded = await uploadFile();
      setUploading(false);
      if (!uploaded) { setSaving(false); return; }
      finalUrl = uploaded;
    }

    if (!finalUrl) {
      setError('Please upload a chart image.');
      setSaving(false);
      return;
    }

    const payload: Partial<Chart> = {
      market_id: marketId || null,
      title,
      description,
      category,
      chart_date: chartDate,
      chart_time: chartTime || null,
      timeframe,
      bias,
      image_url: finalUrl,
    };

    let dbError: string | null = null;

    if (editing) {
      const { error: updateErr } = await supabase.from('charts').update(payload).eq('id', editing.id);
      if (updateErr) dbError = updateErr.message;
    } else {
      const { error: insertErr } = await supabase.from('charts').insert(payload);
      if (insertErr) dbError = insertErr.message;
    }

    setSaving(false);

    if (dbError) {
      setError(dbError);
    } else {
      setSuccess(editing ? 'Chart updated successfully!' : 'Chart published successfully!');
      setTimeout(() => { setShowForm(false); resetForm(); fetchCharts(); }, 1200);
    }
  };

  const handleEdit = (c: Chart) => {
    setEditing(c);
    setMarketId(c.market_id ?? markets[0]?.id ?? '');
    setTitle(c.title);
    setDescription(c.description);
    setCategory(c.category);
    setChartDate(c.chart_date);
    setChartTime(c.chart_time ?? '');
    setTimeframe(c.timeframe || '1D');
    setBias(c.bias || 'neutral');
    setExistingUrl(c.image_url);
    setPreviewUrl('');
    setImageFile(null);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this chart? This cannot be undone.')) return;
    const { error: delErr } = await supabase.from('charts').delete().eq('id', id);
    if (delErr) { setError(`Delete failed: ${delErr.message}`); return; }
    fetchCharts();
  };

  const togglePin = async (c: Chart) => {
    const { error: pinErr } = await supabase.from('charts').update({ is_pinned: !c.is_pinned }).eq('id', c.id);
    if (pinErr) { setError(`Failed to pin: ${pinErr.message}`); return; }
    fetchCharts();
  };

  const marketName = (id: string | null) => markets.find((m) => m.id === id)?.symbol ?? '—';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl mb-1">Upload Charts</h2>
          <p className="text-sm text-soft">Upload chart images for any trading pair. Charts appear automatically on the pair page.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold whitespace-nowrap">
          <ImagePlus className="w-4 h-4" /> Upload New Chart
        </button>
      </div>

      {error && !showForm && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search charts by title or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="input-field w-full rounded-xl pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setFilterMarket('all'); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filterMarket === 'all' ? 'btn-gold' : 'btn-ghost'}`}
          >
            All Markets
          </button>
          {markets.slice(0, 8).map((m) => (
            <button
              key={m.id}
              onClick={() => { setFilterMarket(m.id); setPage(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filterMarket === m.id ? 'btn-gold' : 'btn-ghost'}`}
            >
              {m.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      {loadingCharts ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
      ) : pagedCharts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedCharts.map((c) => (
              <div key={c.id} className="glass rounded-2xl overflow-hidden card-hover">
                <div className="aspect-video bg-white/[0.02] relative group">
                  <img src={c.image_url} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                  {c.is_pinned && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gold-500/90 text-ink-950 text-2xs font-bold flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-2xs font-bold border ${biasColor(c.bias)}`}>
                      {biasLabel(c.bias)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <span className="font-semibold text-sm truncate block mb-1">{c.title || 'Untitled'}</span>
                  <p className="text-2xs text-muted mb-2">
                    {marketName(c.market_id)} · {c.timeframe || '—'} · {formatDate(c.chart_date)}{c.chart_time ? ` ${c.chart_time}` : ''}
                  </p>
                  {c.description && <p className="text-sm text-soft line-clamp-2 mb-3">{c.description}</p>}
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(c)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-ghost text-xs">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => togglePin(c)} className="p-2 rounded-lg btn-ghost text-xs" title={c.is_pinned ? 'Unpin' : 'Pin'}>
                      {c.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-ghost text-xs text-bear ml-auto">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg btn-ghost disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted px-2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg btn-ghost disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <FileImage className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No charts uploaded yet.</p>
          <p className="text-sm text-muted">Click "Upload New Chart" to add one.</p>
        </div>
      )}

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">{editing ? 'Edit Chart' : 'Upload New Chart'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-bull/10 border border-bull/20 text-sm text-bull mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trading Pair Selection */}
              <div>
                <label className="text-sm text-soft mb-1.5 block">Select Trading Pair</label>
                <select value={marketId} onChange={(e) => setMarketId(e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                  {markets.map((m) => (
                    <option key={m.id} value={m.id}>{m.symbol} — {m.name} ({categoryLabel(m.category)})</option>
                  ))}
                </select>
              </div>

              {/* Chart Image Upload — Drag & Drop */}
              <div>
                <label className="text-sm text-soft mb-1.5 block">Upload Image</label>
                {(previewUrl || existingUrl) && (
                  <div className="mb-3 aspect-video rounded-xl overflow-hidden bg-white/[0.02] relative group">
                    <img src={previewUrl || existingUrl} alt="Chart preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPreviewUrl(''); setExistingUrl(''); setImageFile(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg glass-strong text-bear opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                    dragOver ? 'border-gold-500 bg-gold-500/5' : 'border-base hover:border-gold-500/40'
                  }`}
                >
                  {compressing ? (
                    <>
                      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                      <p className="text-sm text-soft">Compressing image...</p>
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                      <p className="text-sm text-soft">Uploading...</p>
                    </>
                  ) : imageFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-bull" />
                      <p className="text-sm font-medium">{imageFile.name}</p>
                      <p className="text-2xs text-muted">{(imageFile.size / 1024).toFixed(0)} KB · Click to replace</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted" />
                      <p className="text-sm text-soft">Drag & drop or click to select</p>
                      <p className="text-2xs text-muted">PNG, JPG, WebP up to 10MB · Auto-compressed to WebP</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={compressing || uploading} />
                </div>
              </div>

              {/* Chart Title */}
              <div>
                <label className="text-sm text-soft mb-1.5 block">Chart Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. BTCUSD — Bullish Order Block Entry"
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-soft mb-1.5 block">Chart Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the chart analysis, key levels, and trade setup..."
                  className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none"
                />
              </div>

              {/* Date, Time, Timeframe */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={chartDate}
                    onChange={(e) => setChartDate(e.target.value)}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Time</label>
                  <input
                    type="time"
                    value={chartTime}
                    onChange={(e) => setChartTime(e.target.value)}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Timeframe</label>
                  <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                    {TIMEFRAMES.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
                  </select>
                </div>
              </div>

              {/* Category & Bias */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                    {CHART_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Buy / Sell / Neutral</label>
                  <div className="flex gap-2">
                    {BIASES.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setBias(b.value)}
                        className={`flex-1 px-3 py-3 rounded-xl text-sm font-bold border transition-all ${
                          bias === b.value ? b.color : 'border-base text-muted hover:text-soft'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving || uploading || compressing} className="flex items-center gap-2 px-6 py-3.5 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 w-full justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Publishing...' : editing ? 'Update Chart' : 'Publish Chart'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
