import React from 'react';
import { Filter, Play, Pause, FastForward } from 'lucide-react';

export default function CycleFilters({
  activeCycle,
  onSelectCycle,
  flowSpeed,
  onSetFlowSpeed,
  isPaused,
  onTogglePause,
  scadaStatus
}) {
  const cycles = [
    { id: 'all', label: 'All Systems' },
    { id: 'hydraulic', label: 'Hydraulic Flow Loop' },
    { id: 'turbogenerator', label: 'Turbogenerator' },
    { id: 'substation', label: 'Substation & Grid' },
    { id: 'tailrace', label: 'Tailrace & Reservoir' }
  ];

  const speeds = [0.5, 1.0, 1.5, 2.0];

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Cycle Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center space-x-1 text-slate-500 font-semibold uppercase tracking-wider mr-1 text-[11px]">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Cycle:</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {cycles.map((c) => {
            const isActive = activeCycle === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCycle(c.id)}
                className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Flow Multiplier & SCADA Active Status */}
      <div className="flex items-center space-x-4">
        {/* Flow Speed Controls */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Flow:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSetFlowSpeed(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                flowSpeed === s && !isPaused
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={onTogglePause}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              isPaused
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            title={isPaused ? "Resume simulation flow" : "Pause simulation flow"}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
          </button>
        </div>

        {/* Live SCADA indicator */}
        <div className="hidden md:flex items-center space-x-1.5 text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{scadaStatus || 'Unit 2 • 250 MW Francis SCADA Active'}</span>
        </div>
      </div>
    </div>
  );
}

