import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Chart, Market } from '@/types';
import { formatDate, categoryColor } from '@/lib/utils';
import {
  Video, Plus, Trash2, X, Save, Upload,
  AlertCircle, CheckCircle, Loader2, Play,
} from 'lucide-react';

export function AdminVideoPage({ markets }: { markets: Market[] }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [videos, setVideos] = useState<Chart[]>([]);
  const [marketId, setMarketId] = useState(markets[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [chartDate, setChartDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchVideos = async () => {
    const { data } = await supabase.from('charts').select('*').eq('category', 'video').order('chart_date', { ascending: false });
    setVideos((data as Chart[]) ?? []);
  };

  useEffect(() => { fetchVideos(); }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setVideoFile(null); setVideoUrl('');
    setChartDate(new Date().toISOString().slice(0, 10)); setError(null); setSuccess(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setError(null);
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!videoFile || !user) return null;
    const ext = videoFile.name.split('.').pop();
    const fileName = `videos/${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('uploads').upload(fileName, videoFile, { cacheControl: '3600', upsert: false });
    if (upErr) { setError(upErr.message); return null; }
    const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return pubData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);

    let finalUrl = videoUrl;
    if (videoFile) {
      setUploading(true);
      finalUrl = (await uploadFile()) ?? '';
      setUploading(false);
      if (!finalUrl) { setSaving(false); return; }
    }

    if (!finalUrl) { setError('Please upload a video file or provide a video URL.'); setSaving(false); return; }

    const { error } = await supabase.from('charts').insert({
      market_id: marketId || null, title, description, category: 'video',
      video_url: finalUrl, image_url: finalUrl, chart_date: chartDate,
    });

    setSaving(false);
    if (error) setError(error.message);
    else { setSuccess('Video uploaded!'); setTimeout(() => { setShowForm(false); resetForm(); fetchVideos(); }, 1200); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    await supabase.from('charts').delete().eq('id', id);
    fetchVideos();
  };

  const marketName = (id: string | null) => markets.find((m) => m.id === id)?.symbol ?? 'General';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl mb-1">Upload Video Analysis</h2>
          <p className="text-sm text-soft">Upload video analysis and breakdowns for any trading pair</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold whitespace-nowrap">
          <Plus className="w-4 h-4" /> Upload Video
        </button>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <div key={v.id} className="glass rounded-2xl overflow-hidden card-hover">
              <div className="aspect-video bg-ink-900 relative flex items-center justify-center">
                {v.video_url.includes('youtube') || v.video_url.includes('youtu.be') ? (
                  <iframe src={v.video_url} className="w-full h-full" allowFullScreen />
                ) : (
                  <video src={v.video_url} controls className="w-full h-full" />
                )}
                {!v.video_url.includes('youtube') && !v.video_url.includes('youtu.be') && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-12 h-12 text-gold-400/80" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-sm truncate mb-1">{v.title || 'Untitled'}</p>
                <p className="text-2xs text-muted mb-2">{marketName(v.market_id)} · {formatDate(v.chart_date)}</p>
                {v.description && <p className="text-sm text-soft line-clamp-2 mb-3">{v.description}</p>}
                <button onClick={() => handleDelete(v.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-ghost text-xs text-bear">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No video analysis uploaded yet.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">Upload Video Analysis</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4"><AlertCircle className="w-4 h-4" /> {error}</div>}
            {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-bull/10 border border-bull/20 text-sm text-bull mb-4"><CheckCircle className="w-4 h-4" /> {success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-soft mb-1.5 block">Trading Pair</label>
                <select value={marketId} onChange={(e) => setMarketId(e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                  {markets.map((m) => <option key={m.id} value={m.id}>{m.symbol} — {m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-soft mb-1.5 block">Video Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. BTCUSD — Live Market Structure Breakdown" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>

              <div>
                <label className="text-sm text-soft mb-1.5 block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the video analysis..." className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none" />
              </div>

              <div>
                <label className="text-sm text-soft mb-1.5 block">Video File</label>
                <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-base hover:border-gold-500/40 transition-colors cursor-pointer">
                  {videoFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-bull" />
                      <p className="text-sm font-medium">{videoFile.name}</p>
                      <p className="text-2xs text-muted">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                      <p className="text-sm text-soft">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted" />
                      <p className="text-sm text-soft">Click to select a video file</p>
                      <p className="text-2xs text-muted">MP4, WebM up to 100MB</p>
                    </>
                  )}
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                </label>
                <p className="text-2xs text-muted mt-2 text-center">Or paste a video URL (YouTube, Vimeo, direct link)</p>
                <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="input-field w-full rounded-xl px-4 py-2.5 text-sm mt-2" />
              </div>

              <div>
                <label className="text-sm text-soft mb-1.5 block">Date</label>
                <input type="date" value={chartDate} onChange={(e) => setChartDate(e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>

              <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 px-6 py-3.5 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 w-full justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Upload Video'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
