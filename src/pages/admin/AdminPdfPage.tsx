import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { PdfReport, Market } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  FileText, Plus, Trash2, X, Save, Upload, Download,
  AlertCircle, CheckCircle, Loader2, FileUp,
} from 'lucide-react';

export function AdminPdfPage({ markets }: { markets: Market[] }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<PdfReport[]>([]);
  const [marketId, setMarketId] = useState(markets[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState('weekly');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchReports = async () => {
    const { data } = await supabase.from('pdf_reports').select('*').order('published_at', { ascending: false });
    setReports((data as PdfReport[]) ?? []);
  };

  useEffect(() => { fetchReports(); }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setReportType('weekly'); setPdfFile(null); setFileUrl('');
    setError(null); setSuccess(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setError(null);
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!pdfFile || !user) return null;
    const ext = pdfFile.name.split('.').pop();
    const fileName = `pdfs/${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('uploads').upload(fileName, pdfFile, { cacheControl: '3600', upsert: false });
    if (upErr) { setError(upErr.message); return null; }
    const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return pubData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);

    let finalUrl = fileUrl;
    let fileName = '';
    if (pdfFile) {
      setUploading(true);
      finalUrl = (await uploadFile()) ?? '';
      setUploading(false);
      fileName = pdfFile.name;
      if (!finalUrl) { setSaving(false); return; }
    }

    if (!finalUrl) { setError('Please upload a PDF file or provide a URL.'); setSaving(false); return; }

    const { error } = await supabase.from('pdf_reports').insert({
      market_id: marketId || null, title, description, file_url: finalUrl,
      file_name: fileName, report_type: reportType,
    });

    setSaving(false);
    if (error) setError(error.message);
    else { setSuccess('PDF report uploaded!'); setTimeout(() => { setShowForm(false); resetForm(); fetchReports(); }, 1200); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this PDF report?')) return;
    await supabase.from('pdf_reports').delete().eq('id', id);
    fetchReports();
  };

  const marketName = (id: string | null) => markets.find((m) => m.id === id)?.symbol ?? 'General';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl mb-1">Upload PDF Reports</h2>
          <p className="text-sm text-soft">Upload weekly, monthly, and special PDF analysis reports</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold whitespace-nowrap">
          <Plus className="w-4 h-4" /> Upload PDF
        </button>
      </div>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-bear/10 border border-bear/20 flex items-center justify-center text-bear shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.title}</p>
                  <p className="text-2xs text-muted">{marketName(r.market_id)} · {r.report_type} · {formatDate(r.published_at)}</p>
                </div>
              </div>
              {r.description && <p className="text-sm text-soft line-clamp-2 mb-3">{r.description}</p>}
              <div className="flex items-center gap-2">
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-ghost text-xs">
                  <Download className="w-3 h-3" /> Download
                </a>
                <button onClick={() => handleDelete(r.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-ghost text-xs text-bear ml-auto">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No PDF reports uploaded yet.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">Upload PDF Report</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-bear/10 border border-bear/20 text-sm text-bear mb-4"><AlertCircle className="w-4 h-4" /> {error}</div>}
            {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-bull/10 border border-bull/20 text-sm text-bull mb-4"><CheckCircle className="w-4 h-4" /> {success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-soft mb-1.5 block">Trading Pair (optional)</label>
                <select value={marketId} onChange={(e) => setMarketId(e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                  <option value="">General / All Markets</option>
                  {markets.map((m) => <option key={m.id} value={m.id}>{m.symbol} — {m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-soft mb-1.5 block">Report Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Weekly Market Outlook — Aug 2026" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>

              <div>
                <label className="text-sm text-soft mb-1.5 block">Report Type</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field w-full rounded-xl px-4 py-3 text-sm">
                  <option value="daily">Daily Report</option>
                  <option value="weekly">Weekly Report</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="special">Special Report</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-soft mb-1.5 block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief description of the report contents..." className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none" />
              </div>

              <div>
                <label className="text-sm text-soft mb-1.5 block">PDF File</label>
                <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-base hover:border-gold-500/40 transition-colors cursor-pointer">
                  {pdfFile ? (
                    <>
                      <FileUp className="w-8 h-8 text-bull" />
                      <p className="text-sm font-medium">{pdfFile.name}</p>
                      <p className="text-2xs text-muted">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                      <p className="text-sm text-soft">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted" />
                      <p className="text-sm text-soft">Click to select a PDF file</p>
                      <p className="text-2xs text-muted">PDF up to 50MB</p>
                    </>
                  )}
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={uploading} />
                </label>
                <p className="text-2xs text-muted mt-2 text-center">Or paste a PDF URL below</p>
                <input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." className="input-field w-full rounded-xl px-4 py-2.5 text-sm mt-2" />
              </div>

              <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 px-6 py-3.5 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 w-full justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Upload PDF Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
