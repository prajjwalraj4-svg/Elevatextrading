import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Link } from '@/lib/router';
import { FullPageLoader } from '@/components/Loading';
import type { JournalTrade } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  BookOpen, Plus, Trash2, TrendingUp, TrendingDown, Minus,
  Calendar, DollarSign, Target, X, Pencil, Save,
} from 'lucide-react';

export function JournalPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<JournalTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<JournalTrade | null>(null);

  const [pair, setPair] = useState('');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<'open' | 'win' | 'loss' | 'breakeven'>('open');
  const [profit, setProfit] = useState('');
  const [riskReward, setRiskReward] = useState('');

  const fetchTrades = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('journal_trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTrades((data as JournalTrade[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTrades(); }, [user]);

  const resetForm = () => {
    setPair(''); setDirection('long'); setEntryPrice(''); setExitPrice('');
    setStopLoss(''); setTakeProfit(''); setScreenshotUrl(''); setNotes('');
    setResult('open'); setProfit(''); setRiskReward('');
    setEditing(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const payload = {
      pair,
      direction,
      entry_price: parseFloat(entryPrice) || 0,
      exit_price: parseFloat(exitPrice) || 0,
      stop_loss: parseFloat(stopLoss) || 0,
      take_profit: parseFloat(takeProfit) || 0,
      screenshot_url: screenshotUrl,
      notes,
      result,
      profit: parseFloat(profit) || 0,
      risk_reward: riskReward,
    };

    if (editing) {
      await supabase.from('journal_trades').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('journal_trades').insert({ ...payload, user_id: user.id });
    }
    resetForm();
    setShowForm(false);
    fetchTrades();
  };

  const handleEdit = (t: JournalTrade) => {
    setEditing(t);
    setPair(t.pair); setDirection(t.direction); setEntryPrice(String(t.entry_price));
    setExitPrice(String(t.exit_price)); setStopLoss(String(t.stop_loss));
    setTakeProfit(String(t.take_profit)); setScreenshotUrl(t.screenshot_url);
    setNotes(t.notes); setResult(t.result); setProfit(String(t.profit));
    setRiskReward(t.risk_reward);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('journal_trades').delete().eq('id', id);
    fetchTrades();
  };

  if (!user) {
    return (
      <div className="section-pad max-w-2xl mx-auto py-20 text-center">
        <p className="text-xl text-soft mb-4">Please sign in to access your trading journal.</p>
        <Link to="/login" className="btn-gold px-6 py-3 rounded-xl inline-block">Sign In</Link>
      </div>
    );
  }

  if (loading) return <FullPageLoader message="Loading journal..." />;

  const resultIcon = (r: string) => {
    if (r === 'win') return <TrendingUp className="w-4 h-4 text-bull" />;
    if (r === 'loss') return <TrendingDown className="w-4 h-4 text-bear" />;
    if (r === 'breakeven') return <Minus className="w-4 h-4 text-neutral" />;
    return <Calendar className="w-4 h-4 text-muted" />;
  };

  const resultColor = (r: string) => {
    if (r === 'win') return 'text-bull bg-bull/10 border-bull/20';
    if (r === 'loss') return 'text-bear bg-bear/10 border-bear/20';
    if (r === 'breakeven') return 'text-neutral bg-neutral/10 border-neutral/20';
    return 'text-muted bg-white/[0.02] border-base';
  };

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Trading Journal</h1>
          <p className="text-soft">Track your trades, notes, and performance over time</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold">
          <Plus className="w-4 h-4" /> Add Trade
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-strong rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">{editing ? 'Edit Trade' : 'New Trade'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg btn-ghost"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Pair</label>
                  <input type="text" value={pair} onChange={(e) => setPair(e.target.value)} required placeholder="BTCUSD" className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Direction</label>
                  <select value={direction} onChange={(e) => setDirection(e.target.value as 'long' | 'short')} className="input-field w-full rounded-xl px-4 py-2.5 text-sm">
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Entry Price</label>
                  <input type="number" step="any" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Exit Price</label>
                  <input type="number" step="any" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Stop Loss</label>
                  <input type="number" step="any" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Take Profit</label>
                  <input type="number" step="any" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Result</label>
                  <select value={result} onChange={(e) => setResult(e.target.value as JournalTrade['result'])} className="input-field w-full rounded-xl px-4 py-2.5 text-sm">
                    <option value="open">Open</option>
                    <option value="win">Win</option>
                    <option value="loss">Loss</option>
                    <option value="breakeven">Breakeven</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Profit/Loss ($)</label>
                  <input type="number" step="any" value={profit} onChange={(e) => setProfit(e.target.value)} className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-soft mb-1.5 block">Risk Reward</label>
                  <input type="text" value={riskReward} onChange={(e) => setRiskReward(e.target.value)} placeholder="1:2.5" className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Screenshot URL</label>
                <input type="text" value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} placeholder="https://..." className="input-field w-full rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm text-soft mb-1.5 block">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input-field w-full rounded-xl px-4 py-2.5 text-sm resize-none" placeholder="Trade rationale, observations..." />
              </div>
              <button type="submit" className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gold text-sm font-bold">
                <Save className="w-4 h-4" /> {editing ? 'Update Trade' : 'Save Trade'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trades List */}
      {trades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trades.map((t, i) => (
            <div key={t.id} className="glass rounded-2xl p-5 card-hover animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-lg">{t.pair}</span>
                    <span className={`text-2xs px-2 py-0.5 rounded-full border ${t.direction === 'long' ? 'bg-bull/10 text-bull border-bull/20' : 'bg-bear/10 text-bear border-bear/20'}`}>
                      {t.direction.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-2xs text-muted">{formatDate(t.created_at)}</p>
                </div>
                <span className={`text-2xs px-2.5 py-1 rounded-full border flex items-center gap-1 font-semibold capitalize ${resultColor(t.result)}`}>
                  {resultIcon(t.result)} {t.result}
                </span>
              </div>

              {t.screenshot_url && (
                <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-white/[0.02]">
                  <img src={t.screenshot_url} alt="Trade screenshot" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <p className="text-2xs text-muted">Entry</p>
                  <p className="font-mono text-sm">{t.entry_price || '—'}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <p className="text-2xs text-muted">Exit</p>
                  <p className="font-mono text-sm">{t.exit_price || '—'}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <p className="text-2xs text-muted">P/L</p>
                  <p className={`font-mono text-sm font-semibold ${t.profit > 0 ? 'text-bull' : t.profit < 0 ? 'text-bear' : 'text-muted'}`}>
                    ${t.profit || 0}
                  </p>
                </div>
              </div>

              {t.notes && <p className="text-sm text-soft line-clamp-2 mb-3">{t.notes}</p>}

              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(t)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-ghost text-xs">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-ghost text-xs text-bear">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
                {t.risk_reward && <span className="text-2xs text-muted ml-auto flex items-center gap-1"><Target className="w-3 h-3" /> {t.risk_reward}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
          <p className="text-soft mb-2">No trades recorded yet.</p>
          <p className="text-sm text-muted mb-4">Start tracking your trades to monitor your performance.</p>
          <button onClick={() => setShowForm(true)} className="btn-gold px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm font-bold">
            <Plus className="w-4 h-4" /> Add Your First Trade
          </button>
        </div>
      )}
    </div>
  );
}
