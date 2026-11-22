import React from 'react';
import { Zap, Droplet, Gauge, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

export default function KpiBar({ telemetry }) {
  const isTripped = telemetry?.is_tripped;
  const netGen = telemetry?.net_generation_mw ?? 250.0;
  const capacityPct = telemetry?.capacity_factor_pct ?? 98.4;
  const head = telemetry?.hydraulic_head_m ?? 142.5;
  const flow = telemetry?.flow_rate_m3s ?? 195.4;
  const eff = telemetry?.turbine_efficiency_pct ?? 93.8;
  const health = telemetry?.unit_health_pct ?? 99.9;
  const freq = telemetry?.grid_frequency_hz ?? 50.00;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4 bg-slate-50/70 border-b border-slate-200/80">
      {/* 1. NET GENERATION */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
            isTripped 
              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}>
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Net Generation
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${isTripped ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`}></span>
            </div>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                {netGen.toFixed(1)} <span className="text-sm font-semibold text-slate-600">MW</span>
              </span>
              <span className={`text-xs font-semibold ${isTripped ? 'text-rose-600' : 'text-emerald-600'}`}>
                {capacityPct}% Base Load
              </span>
            </div>
          </div>
        </div>
        <div className="hidden xl:block text-right">
          <div className="text-[10px] text-slate-400 font-mono">Rated 250 MW</div>
          <div className="text-[11px] font-medium text-slate-600">PF 0.95 Lag</div>
        </div>
      </div>

      {/* 2. HYDRAULIC HEAD & FLOW */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Hydraulic Head & Flow
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                {head.toFixed(1)} <span className="text-sm font-semibold text-slate-600">m</span>
              </span>
              <span className="text-xs font-semibold text-sky-600 font-mono">
                • {flow.toFixed(1)} m³/s
              </span>
            </div>
          </div>
        </div>
        <div className="hidden xl:block text-right">
          <div className="text-[10px] text-slate-400 font-mono">Penstock 14.2 bar</div>
          <div className="text-[11px] font-medium text-slate-600">Velocity 4.2 m/s</div>
        </div>
      </div>

      {/* 3. CYCLE EFFICIENCY */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Cycle Efficiency
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                {eff.toFixed(1)}%
              </span>
              <span className="text-xs font-semibold text-amber-700">
                • Francis Runner η
              </span>
            </div>
          </div>
        </div>
        <div className="hidden xl:block text-right">
          <div className="text-[10px] text-slate-400 font-mono">Speed 375 RPM</div>
          <div className="text-[11px] font-medium text-slate-600">IEC 60041 Compliant</div>
        </div>
      </div>

      {/* 4. UNIT HEALTH & GRID SYNC */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
            isTripped 
              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
              : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Unit Health & Grid Sync
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                {health.toFixed(1)}%
              </span>
              <span className="text-xs font-semibold text-indigo-700 font-mono">
                • {freq.toFixed(2)} Hz Sync
              </span>
            </div>
          </div>
        </div>
        <div className="hidden xl:block text-right">
          <div className="text-[10px] text-slate-400 font-mono">Switchyard 400 kV</div>
          <div className="text-[11px] font-medium text-slate-600">Synchrocheck Locked</div>
        </div>
      </div>
    </div>
  );
}

