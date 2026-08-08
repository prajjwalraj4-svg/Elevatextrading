import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-ink-950 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center animate-pulse-glow shadow-gold-lg">
          <Loader2 className="w-8 h-8 text-ink-950 animate-spin" strokeWidth={2.5} />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-gold-500/30 animate-ping" />
      </div>
      <p className="mt-6 font-display font-bold text-xl">
        Elevate<span className="gold-text">X</span>
      </p>
      <p className="text-sm text-muted mt-1">Loading institutional analysis...</p>
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-5 h-5 animate-spin ${className}`} />;
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Spinner className="text-gold-500 w-8 h-8" />
      <p className="mt-4 text-sm text-muted">{message}</p>
    </div>
  );
}
