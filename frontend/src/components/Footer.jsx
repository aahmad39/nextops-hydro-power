import React from 'react';
import { Heart, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Footer({ telemetry, isConnected }) {
  const isTripped = telemetry?.is_tripped;
  const health = telemetry?.unit_health_pct ?? 99.9;

  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-2.5 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 z-10">
      {/* Left Footer Branding */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 font-medium">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          <span>at</span>
          <span className="font-bold text-slate-700">DevOps Insiders</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center space-x-1.5 font-medium">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-slate-600">
            {isConnected ? 'Synchronized' : 'Reconnecting to SCADA Gateway...'}
          </span>
        </div>
      </div>

      {/* Right Footer Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-slate-600">
          <Activity className="w-3.5 h-3.5 text-sky-500" />
          <span className="font-medium">SCADA Instrumentation Synced</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center space-x-1.5">
          <ShieldCheck className={`w-4 h-4 ${isTripped ? 'text-rose-500' : 'text-emerald-600'}`} />
          <span className="font-semibold text-slate-700">
            Health Score:{' '}
            <span className={isTripped ? 'text-rose-600 font-mono font-bold' : 'text-emerald-600 font-mono font-bold'}>
              {health.toFixed(1)}%
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

