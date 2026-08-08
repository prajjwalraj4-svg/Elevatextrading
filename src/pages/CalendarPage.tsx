import { useState } from 'react';
import {
  CalendarDays, Clock, AlertTriangle, AlertCircle, Info,
  TrendingUp, TrendingDown, Minus, ChevronRight,
} from 'lucide-react';

interface CalendarEvent {
  time: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  event: string;
  forecast: string;
  previous: string;
  actual: string | null;
  tomorrow?: boolean;
}

const events: CalendarEvent[] = [
  { time: '08:30', currency: 'USD', impact: 'high', event: 'Non-Farm Payrolls', forecast: '185K', previous: '175K', actual: null },
  { time: '08:30', currency: 'USD', impact: 'high', event: 'Unemployment Rate', forecast: '4.1%', previous: '4.1%', actual: null },
  { time: '10:00', currency: 'USD', impact: 'medium', event: 'ISM Services PMI', forecast: '51.0', previous: '48.8', actual: null },
  { time: '12:30', currency: 'EUR', impact: 'medium', event: 'ECB Interest Rate Decision', forecast: '4.25%', previous: '4.25%', actual: null },
  { time: '14:00', currency: 'GBP', impact: 'low', event: 'BoE Gov Bailey Speech', forecast: '—', previous: '—', actual: null },
  { time: '16:00', currency: 'JPY', impact: 'medium', event: 'BoJ Policy Minutes', forecast: '—', previous: '—', actual: null },
  { time: '09:00', currency: 'USD', impact: 'high', event: 'FOMC Statement', forecast: '—', previous: '—', actual: null, tomorrow: true },
  { time: '09:00', currency: 'USD', impact: 'high', event: 'Fed Interest Rate Decision', forecast: '5.25%', previous: '5.25%', actual: null, tomorrow: true },
  { time: '10:30', currency: 'USD', impact: 'high', event: 'FOMC Press Conference', forecast: '—', previous: '—', actual: null, tomorrow: true },
  { time: '08:00', currency: 'EUR', impact: 'low', event: 'German Industrial Production', forecast: '0.3%', previous: '-0.4%', actual: null, tomorrow: true },
];

const impactConfig = {
  high: { color: 'text-bear bg-bear/10 border-bear/20', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'High' },
  medium: { color: 'text-gold-400 bg-gold-500/10 border-gold-500/20', icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Medium' },
  low: { color: 'text-neutral bg-neutral/10 border-neutral/20', icon: <Info className="w-3.5 h-3.5" />, label: 'Low' },
};

export function CalendarPage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const todayEvents = events.filter((e) => !e.tomorrow);
  const tomorrowEvents = events.filter((e) => e.tomorrow);

  const filterEvents = (list: CalendarEvent[]) =>
    filter === 'all' ? list : list.filter((e) => e.impact === filter);

  return (
    <div className="section-pad max-w-[1600px] mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Economic Calendar</h1>
        <p className="text-soft">Track high-impact economic events and their potential market effects</p>
      </div>

      {/* Impact Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'high', 'medium', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'btn-gold' : 'btn-ghost'
            }`}
          >
            {f === 'all' ? 'All Impact' : `${f} Impact`}
          </button>
        ))}
      </div>

      {/* Today's Events */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-gold-400" /> Today's News
          <span className="text-sm text-muted font-normal">({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})</span>
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          {filterEvents(todayEvents).map((e, i) => {
            const cfg = impactConfig[e.impact];
            return (
              <div key={i} className={`flex items-center gap-4 p-4 ${i !== 0 ? 'border-t border-base' : ''} hover:bg-white/5 transition-colors`}>
                <div className="flex items-center gap-2 w-20 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-muted" />
                  <span className="font-mono text-sm">{e.time}</span>
                </div>
                <div className="flex items-center gap-2 w-16 shrink-0">
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-navy-500/10 border border-navy-400/20">{e.currency}</span>
                </div>
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <span className={`text-2xs px-2 py-1 rounded-full border flex items-center gap-1 font-medium ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.event}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm shrink-0">
                  <div className="text-center">
                    <p className="text-2xs text-muted">Forecast</p>
                    <p className="font-mono">{e.forecast}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xs text-muted">Previous</p>
                    <p className="font-mono text-soft">{e.previous}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xs text-muted">Actual</p>
                    <p className="font-mono text-muted">—</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Tomorrow's Events */}
      <div>
        <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-navy-300" /> Tomorrow's News
          <span className="text-sm text-muted font-normal">({new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})</span>
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          {filterEvents(tomorrowEvents).map((e, i) => {
            const cfg = impactConfig[e.impact];
            return (
              <div key={i} className={`flex items-center gap-4 p-4 ${i !== 0 ? 'border-t border-base' : ''} hover:bg-white/5 transition-colors`}>
                <div className="flex items-center gap-2 w-20 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-muted" />
                  <span className="font-mono text-sm">{e.time}</span>
                </div>
                <div className="flex items-center gap-2 w-16 shrink-0">
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-navy-500/10 border border-navy-400/20">{e.currency}</span>
                </div>
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <span className={`text-2xs px-2 py-1 rounded-full border flex items-center gap-1 font-medium ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.event}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm shrink-0">
                  <div className="text-center">
                    <p className="text-2xs text-muted">Forecast</p>
                    <p className="font-mono">{e.forecast}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xs text-muted">Previous</p>
                    <p className="font-mono text-soft">{e.previous}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Trading Sessions Info */}
      <div className="mt-8 glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-sm mb-4">Trading Sessions & Market Hours (UTC)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Sydney', hours: '22:00 - 07:00', active: true },
            { name: 'Tokyo', hours: '00:00 - 09:00', active: true },
            { name: 'London', hours: '08:00 - 17:00', active: true },
            { name: 'New York', hours: '13:00 - 22:00', active: false },
          ].map((s) => (
            <div key={s.name} className={`p-4 rounded-xl border ${s.active ? 'bg-bull/5 border-bull/20' : 'bg-white/[0.02] border-base'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">{s.name}</span>
                <span className={`w-2 h-2 rounded-full ${s.active ? 'bg-bull animate-pulse-glow' : 'bg-neutral'}`} />
              </div>
              <p className="text-2xs text-muted font-mono">{s.hours} UTC</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
