import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, navigate } from '@/lib/router';
import { useMarket } from '@/lib/hooks';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MiniChart } from '@/components/AnimatedChart';
import { TradingViewChart } from '@/components/TradingViewChart';
import { useLivePrice } from '@/lib/useLivePrice';
import { FullPageLoader } from '@/components/Loading';
import { formatPrice, categoryColor, categoryLabel, trendBg, trendColor, timeAgo, formatDate } from '@/lib/utils';
import type { Analysis, Chart } from '@/types';
import {
  TrendingUp, TrendingDown, Minus, Target, Shield, Activity, Brain,
  BarChart3, Clock, User, Gauge, Layers, Eye, Zap, ArrowLeft,
  Download, Share2, ZoomIn, ChevronLeft, ChevronRight, X, Pin,
  Upload, Trash2, RefreshCw, Loader2, AlertCircle,
} from 'lucide-react';

const trendIcon = (trend: string) => {
  if (trend === 'bullish') return <TrendingUp className="w-4 h-4" />;
  if (trend === 'bearish') return <TrendingDown className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
};

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

export function PairPage({ symbol }: { symbol: string }) {
  const { market, loading } = useMarket(symbol);
  const { isAdmin } = useAuth();
  const livePrice = useLivePrice(
    market?.symbol ?? symbol,
    market?.category ?? '',
    market?.live_price ?? 0,
    market?.price_change_pct ?? 0,
  );
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [chartIdx, setChartIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<string | null>(null);

  const fetchCharts = useCallback(async () => {
    if (!market) return;
    const { data } = await supabase
      .from('charts')
      .select('*')
      .eq('market_id', market.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    setCharts((data as Chart[]) ?? []);
  }, [market]);

  useEffect(() => {
    if (!market) return;
    supabase
      .from('analysis')
      .select('*')
      .eq('market_id', market.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setAnalysis((data as Analysis) ?? null));

    fetchCharts();
  }, [market, fetchCharts]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !market) return;
    e.target.value = '';

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }

    setUploadError(null);
    setUploading(true);

    const compressed = await compressImage(file);
    const ext = 'webp';
    const fileName = `charts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('uploads')
      .upload(fileName, compressed, { cacheControl: '3600', upsert: false });

    if (upErr) {
      setUploadError(`Upload failed: ${upErr.message}`);
      setUploading(false);
      return;
    }

    const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    const { error: dbErr } = await supabase.from('charts').insert({
      market_id: market.id,
      image_url: pubData.publicUrl,
      title: '',
      description: '',
      category: 'chart',
      chart_date: new Date().toISOString().slice(0, 10),
      chart_time: new Date().toTimeString().slice(0, 5),
      timeframe: '',
      bias: 'neutral',
    });

    setUploading(false);

    if (dbErr) {
      setUploadError(`Save failed: ${dbErr.message}`);
      return;
    }

    fetchCharts();
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const chartId = replaceTargetRef.current;
    if (!file || !chartId) return;
    e.target.value = '';
    replaceTargetRef.current = null;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }

    setUploadError(null);
    setReplacingId(chartId);

    const compressed = await compressImage(file);
    const fileName = `charts/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const { error: upErr } = await supabase.storage
      .from('uploads')
      .upload(fileName, compressed, { cacheControl: '3600', upsert: false });

    if (upErr) {
      setUploadError(`Replace failed: ${upErr.message}`);
      setReplacingId(null);
      return;
    }

    const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    const { error: dbErr } = await supabase.from('charts')
      .update({ image_url: pubData.publicUrl })
      .eq('id', chartId);

    setReplacingId(null);

    if (dbErr) {
      setUploadError(`Update failed: ${dbErr.message}`);
      return;
    }

    fetchCharts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this chart? This cannot be undone.')) return;
    setUploadError(null);
    const { error: delErr } = await supabase.from('charts').delete().eq('id', id);
    if (delErr) {
      setUploadError(`Delete failed: ${delErr.message}`);
      return;
    }
    fetchCharts();
  };

  if (loading) return <FullPageLoader message={`Loading ${symbol}...`} />;

  if (!market) {
    return (
      <div className="section-pad max-w-4xl mx-auto py-20 text-center">
        <p className="text-2xl font-display font-bold mb-4">Market not found</p>
        <Link to="/markets" className="btn-gold px-6 py-3 rounded-xl inline-block">Browse All Markets</Link>
      </div>
    );
  }

  const smcFields = [
    { label: 'Support Zone', value: analysis?.support_zone, icon: <Layers className="w-4 h-4" /> },
    { label: 'Resistance Zone', value: analysis?.resistance_zone, icon: <Layers className="w-4 h-4" /> },
    { label: 'Supply Zone', value: analysis?.supply_zone, icon: <TrendingDown className="w-4 h-4" /> },
    { label: 'Demand Zone', value: analysis?.demand_zone, icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Liquidity Zone', value: analysis?.liquidity_zone, icon: <Activity className="w-4 h-4" /> },
    { label: 'Entry Zone', value: analysis?.entry_zone, icon: <Target className="w-4 h-4" /> },
    { label: 'Stop Loss', value: analysis?.stop_loss, icon: <Shield className="w-4 h-4" /> },
    { label: 'Risk Reward', value: analysis?.risk_reward_ratio, icon: <Gauge className="w-4 h-4" /> },
  ];

  const tpFields = [
    { label: 'Take Profit 1', value: analysis?.take_profit_1 },
    { label: 'Take Profit 2', value: analysis?.take_profit_2 },
    { label: 'Take Profit 3', value: analysis?.take_profit_3 },
  ];

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-8">
      <button onClick={() => navigate('/markets')} className="flex items-center gap-2 text-sm text-soft hover:text-gold-400 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Markets
      </button>

      {/* Header */}
      <div className="glass-strong rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gold opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-2xl font-display font-bold shrink-0">
              {market.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display font-bold text-2xl md:text-3xl">{market.symbol}</h1>
                <span className={`text-2xs px-2 py-1 rounded-full border ${categoryColor(market.category)}`}>
                  {categoryLabel(market.category)}
                </span>
              </div>
              <p className="text-soft">{market.name}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="flex items-center gap-2 md:justify-end mb-1">
              {livePrice.isLive && (
                <span className="flex items-center gap-1.5 text-2xs text-bull font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bull opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-bull" />
                  </span>
                  LIVE
                </span>
              )}
            </div>
            <p className="font-mono font-bold text-3xl md:text-4xl tabular-nums">{formatPrice(livePrice.price)}</p>
            <p className={`text-lg font-semibold tabular-nums ${livePrice.changePct >= 0 ? 'text-bull' : 'text-bear'}`}>
              {livePrice.changePct >= 0 ? '+' : ''}{livePrice.changePct.toFixed(2)}%
              <span className="text-sm text-muted ml-2 tabular-nums">
                ({livePrice.change >= 0 ? '+' : ''}{livePrice.change.toFixed(2)})
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Trends & Bias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Daily Trend', value: market.daily_trend },
          { label: 'Weekly Trend', value: market.weekly_trend },
          { label: 'Monthly Trend', value: market.monthly_trend },
          { label: 'Market Bias', value: market.market_bias },
          { label: 'Institutional Bias', value: market.institutional_bias },
          { label: 'Sentiment', value: analysis?.market_sentiment ?? 'neutral' },
        ].map((item) => (
          <div key={item.label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xs text-muted uppercase tracking-wider mb-2">{item.label}</p>
            <div className={`inline-flex items-center gap-1.5 text-sm font-semibold ${trendColor(item.value)}`}>
              {trendIcon(item.value)}
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {analysis ? (
            <>
              {/* Analysis Card */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-gold-400" />
                  <h2 className="font-display font-bold text-xl">{analysis.title}</h2>
                </div>

                {analysis.content && (
                  <div className="mb-6">
                    <p className="text-soft leading-relaxed">{analysis.content}</p>
                  </div>
                )}

                {analysis.institutional_view && (
                  <div className="mb-4 p-4 rounded-xl bg-navy-500/10 border border-navy-400/20">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-navy-300" /> Institutional View
                    </h3>
                    <p className="text-sm text-soft leading-relaxed">{analysis.institutional_view}</p>
                  </div>
                )}

                {analysis.trade_setup && (
                  <div className="mb-4 p-4 rounded-xl bg-gold-500/10 gold-border">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-gold-400" /> Trade Setup
                    </h3>
                    <p className="text-sm text-soft leading-relaxed">{analysis.trade_setup}</p>
                  </div>
                )}

                {analysis.smc_analysis && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gold-400" /> Smart Money Concept Analysis
                    </h3>
                    <p className="text-sm text-soft leading-relaxed">{analysis.smc_analysis}</p>
                  </div>
                )}

                {analysis.market_structure && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm mb-2">Market Structure</h3>
                    <p className="text-sm text-soft leading-relaxed">{analysis.market_structure}</p>
                  </div>
                )}

                {analysis.risk_warning && (
                  <div className="p-4 rounded-xl bg-bear/5 border border-bear/20">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-bear">
                      <Shield className="w-4 h-4" /> Risk Warning
                    </h3>
                    <p className="text-sm text-soft leading-relaxed">{analysis.risk_warning}</p>
                  </div>
                )}
              </div>

              {/* SMC Zones */}
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-gold-400" /> Zones & Levels
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {smcFields.map((f) => (
                    <div key={f.label} className="p-3 rounded-xl bg-white/[0.02] border border-base">
                      <p className="text-2xs text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                        {f.icon} {f.label}
                      </p>
                      <p className="font-mono text-sm font-semibold">{f.value || '—'}</p>
                    </div>
                  ))}
                </div>

                {/* Take Profits */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {tpFields.map((f, i) => (
                    <div key={f.label} className="p-3 rounded-xl bg-bull/5 border border-bull/20 text-center">
                      <p className="text-2xs text-muted uppercase tracking-wider mb-1">{f.label}</p>
                      <p className="font-mono text-sm font-semibold text-bull">{f.value || '—'}</p>
                    </div>
                  ))}
                </div>

                {/* Support / Resistance */}
                {(analysis.support_levels || analysis.resistance_levels) && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-bull/5 border border-bull/20">
                      <p className="text-2xs text-bull uppercase tracking-wider mb-1">Support</p>
                      <p className="font-mono text-sm">{analysis.support_levels || '—'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-bear/5 border border-bear/20">
                      <p className="text-2xs text-bear uppercase tracking-wider mb-1">Resistance</p>
                      <p className="font-mono text-sm">{analysis.resistance_levels || '—'}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
              <p className="text-soft">No analysis published yet for {market.symbol}.</p>
              <p className="text-sm text-muted mt-2">Check back soon for institutional-grade analysis.</p>
            </div>
          )}

          {/* Latest Chart — Featured */}
          {charts.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-gold-400" /> Latest Chart
              </h2>
              <div className="rounded-xl overflow-hidden border border-base">
                <div className="relative group">
                  <img
                    src={charts[0].image_url}
                    alt={charts[0].title || 'Latest chart'}
                    loading="lazy"
                    className="w-full max-h-[500px] object-contain bg-ink-950 cursor-zoom-in"
                    onClick={() => { setLightbox(charts[0].image_url); setChartIdx(0); }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {charts[0].is_pinned && (
                      <span className="px-2 py-1 rounded-full bg-gold-500/90 text-ink-950 text-2xs font-bold flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                    {charts[0].bias && charts[0].bias !== 'neutral' && (
                      <span className={`px-2 py-1 rounded-full text-2xs font-bold ${
                        charts[0].bias === 'buy' ? 'bg-bull/80 text-ink-950' : 'bg-bear/80 text-ink-950'
                      }`}>
                        {charts[0].bias === 'buy' ? 'BUY' : 'SELL'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{charts[0].title || 'Untitled'}</p>
                    <p className="text-2xs text-muted">
                      {charts[0].timeframe && `${charts[0].timeframe} · `}
                      {formatDate(charts[0].chart_date)}
                      {charts[0].chart_time ? ` ${charts[0].chart_time}` : ''}
                    </p>
                    {charts[0].description && <p className="text-sm text-soft mt-1 line-clamp-2">{charts[0].description}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setLightbox(charts[0].image_url); setChartIdx(0); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg btn-ghost text-xs">
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom
                    </button>
                    <a href={charts[0].image_url} download className="flex items-center gap-1.5 px-3 py-2 rounded-lg btn-ghost text-xs">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(charts[0].image_url); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg btn-ghost text-xs"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => { replaceTargetRef.current = charts[0].id; replaceFileRef.current?.click(); }}
                          disabled={replacingId === charts[0].id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg btn-ghost text-xs disabled:opacity-50"
                        >
                          {replacingId === charts[0].id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Replace
                        </button>
                        <button
                          onClick={() => handleDelete(charts[0].id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg btn-ghost text-xs text-bear"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chart Gallery */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <Eye className="w-5 h-5 text-gold-400" /> Chart Gallery
              </h2>
              {isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 whitespace-nowrap"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : 'Upload Chart'}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleUpload}
              />
              <input
                ref={replaceFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleReplace}
              />
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
                <button onClick={() => setUploadError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
              </div>
            )}

            {charts.length > 1 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {charts.slice(1).map((c, i) => (
                  <div
                    key={c.id}
                    className="relative aspect-video rounded-xl overflow-hidden group border border-base"
                  >
                    <button
                      onClick={() => { setLightbox(c.image_url); setChartIdx(i + 1); }}
                      className="w-full h-full block"
                    >
                      {c.is_pinned && (
                        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-gold-500/90 text-ink-950 text-2xs font-bold flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </div>
                      )}
                      {c.bias && c.bias !== 'neutral' && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-2xs font-bold text-ink-950" style={{ background: c.bias === 'buy' ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>
                          {c.bias === 'buy' ? 'BUY' : 'SELL'}
                        </div>
                      )}
                      <img src={c.image_url} alt={c.title || `Chart ${i + 2}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-gold-400" />
                      </div>
                      {c.title && (
                        <p className="absolute bottom-0 left-0 right-0 p-2 text-2xs text-center bg-gradient-to-t from-ink-950 to-transparent">
                          {c.title}
                        </p>
                      )}
                    </button>
                    {isAdmin && (
                      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {replacingId === c.id ? (
                          <div className="p-1.5 rounded-lg glass-strong"><Loader2 className="w-3.5 h-3.5 text-gold-400 animate-spin" /></div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); replaceTargetRef.current = c.id; replaceFileRef.current?.click(); }}
                            className="p-1.5 rounded-lg glass-strong hover:text-gold-400 transition-colors"
                            title="Replace image"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                          className="p-1.5 rounded-lg glass-strong hover:text-bear transition-colors"
                          title="Delete chart"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-8">No more charts in the gallery. {isAdmin && 'Click "Upload Chart" to add one.'}</p>
            )}
          </div>
        </div>

        {/* Right: Stats Sidebar */}
        <div className="space-y-6">
          {/* Live TradingView Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold-400" /> Live Price Chart
            </h3>
            <div className="h-[400px] rounded-xl overflow-hidden">
              <TradingViewChart symbol={market.symbol} category={market.category} />
            </div>
          </div>

          {/* Analysis Meta */}
          {analysis && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-sm mb-2">Analysis Details</h3>
              {[
                { icon: <User className="w-4 h-4" />, label: 'Analyst', value: analysis.analyst_name || 'ElevateX Team' },
                { icon: <Clock className="w-4 h-4" />, label: 'Last Updated', value: timeAgo(analysis.published_at) },
                { icon: <Gauge className="w-4 h-4" />, label: 'Confidence', value: `${analysis.confidence_score}%` },
                { icon: <Zap className="w-4 h-4" />, label: 'Volatility', value: analysis.estimated_volatility },
                { icon: <Activity className="w-4 h-4" />, label: 'Direction', value: analysis.expected_direction },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted flex items-center gap-2">{item.icon} {item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Probability Meter */}
          {analysis && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm mb-4">Probability Meter</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-bull font-medium">Buy Probability</span>
                    <span className="font-mono font-semibold text-bull">{analysis.buy_probability}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-bull-soft to-bull rounded-full transition-all duration-700" style={{ width: `${analysis.buy_probability}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-bear font-medium">Sell Probability</span>
                    <span className="font-mono font-semibold text-bear">{analysis.sell_probability}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-bear-soft to-bear rounded-full transition-all duration-700" style={{ width: `${analysis.sell_probability}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg btn-ghost text-sm">
                <BarChart3 className="w-4 h-4" /> Live Dashboard
              </button>
              <button onClick={() => navigate('/ai-analysis')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg btn-ghost text-sm">
                <Brain className="w-4 h-4" /> AI Analysis
              </button>
              <Link to="/pricing" className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg btn-gold text-sm">
                <Shield className="w-4 h-4" /> Unlock VIP Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-ink-950/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 p-2 rounded-lg glass" onClick={() => setLightbox(null)}>
            <X className="w-6 h-6" />
          </button>
          <button
            className="absolute left-6 p-2 rounded-lg glass"
            onClick={(e) => { e.stopPropagation(); setChartIdx((i) => (i - 1 + charts.length) % charts.length); setLightbox(charts[(chartIdx - 1 + charts.length) % charts.length]?.image_url); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={lightbox} alt="Chart" className="max-w-full max-h-[85vh] rounded-xl" onClick={(e) => e.stopPropagation()} />
          <button
            className="absolute right-6 p-2 rounded-lg glass"
            onClick={(e) => { e.stopPropagation(); setChartIdx((i) => (i + 1) % charts.length); setLightbox(charts[(chartIdx + 1) % charts.length]?.image_url); }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            <a href={lightbox} download className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm">
              <Download className="w-4 h-4" /> Download
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(lightbox); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
