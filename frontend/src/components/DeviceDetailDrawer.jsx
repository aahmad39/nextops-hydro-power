import React, { useState } from 'react';
import { 
  X, Download, CheckCircle2, AlertTriangle, Activity, 
  RotateCw, Gauge, Zap, Droplet, Shield, Settings2, Sliders 
} from 'lucide-react';

export default function DeviceDetailDrawer({
  nodeDetail,
  telemetry,
  onClose,
  onSetWicketGate,
  onEmergencyTrip,
  onResetPlant
}) {
  const [wicketGateInput, setWicketGateInput] = useState(
    telemetry?.wicket_gate_actual_pct || 82.4
  );

  if (!nodeDetail) return null;

  const node = nodeDetail.node;
  const sensors = nodeDetail.sensors || [];
  const simSpec = nodeDetail.simulation_spec;

  const handleGateChange = (e) => {
    const val = parseFloat(e.target.value);
    setWicketGateInput(val);
    onSetWicketGate(val);
  };

  const handleExportCSV = () => {
    const headers = "Sensor Name,KKS Tag,Value,Unit,Min,Max,Status\n";
    const rows = sensors.map(s => 
      `"${s.sensor_name}","${s.sensor_kks}",${s.value},"${s.unit}",${s.min_limit},${s.max_limit},"${s.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${node.kks_tag}_telemetry.csv`;
    a.click();
  };

  return (
    <aside className="w-full md:w-[440px] xl:w-[480px] bg-white border-l border-slate-200 flex flex-col h-full z-30 shadow-2xl overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 sticky top-0 z-10 backdrop-blur-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-700">
              {node.category || 'HYDRO SYSTEM'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              KKS: {node.kks_tag}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-slate-900 mt-1">
            {node.name}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {node.status || 'OPTIMAL'}
          </span>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Export Sensor CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Card 1: COMPONENT DIGITAL TWIN SIMULATION */}
        <div className="bg-[#0b1329] text-white rounded-xl p-4 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Component Digital Twin Simulation
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {node.short_kks}
            </span>
          </div>

          {/* Dynamic Component Visualizer */}
          <div className="h-36 w-full rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
            {/* Visualizer Variant based on Node Type */}
            {node.node_type === 'Turbine Runner' ? (
              <div className="flex items-center justify-around w-full">
                {/* Rotating Runner SVG */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full animate-spin-runner"
                    style={{ animationDuration: telemetry?.is_tripped ? '0s' : '1.2s' }}
                  >
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="5 3" />
                    <circle cx="50" cy="50" r="14" fill="#0284c7" />
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                      <path
                        key={deg}
                        d="M 50,50 Q 65,30 85,45"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeLinecap="round"
                        transform={`rotate(${deg} 50 50)`}
                      />
                    ))}
                  </svg>
                </div>
                <div className="space-y-1.5 text-right font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Synchronous RPM</div>
                  <div className="text-xl font-black text-cyan-300">
                    {telemetry?.runner_rpm?.toFixed(1) || 375.0} <span className="text-xs">RPM</span>
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Cavitation Index: {telemetry?.cavitation_sigma || 0.118} σ
                  </div>
                </div>
              </div>
            ) : node.node_type === 'Surge Tank' ? (
              <div className="flex items-center justify-around w-full">
                {/* Oscillating Surge Tank SVG */}
                <div className="relative w-16 h-28 border-2 border-slate-600 rounded bg-slate-950 flex flex-col justify-end p-0.5">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600 to-sky-400 rounded-b transition-all duration-300 animate-surge-wave"
                    style={{ height: '65%' }}
                  ></div>
                </div>
                <div className="space-y-1.5 text-right font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Surge Elevation</div>
                  <div className="text-xl font-black text-cyan-300">
                    {telemetry?.surge_tank_level_m?.toFixed(2) || 578.60} <span className="text-xs">m ASL</span>
                  </div>
                  <div className="text-[10px] text-sky-400">
                    Water Hammer Absorbed: 99.4%
                  </div>
                </div>
              </div>
            ) : node.node_type === 'Generator' ? (
              <div className="flex items-center justify-around w-full">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-cyan-500/50 flex items-center justify-center animate-pulse">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-[10px] font-extrabold text-white">
                      11 kV
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-right font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Active Export</div>
                  <div className="text-xl font-black text-emerald-400">
                    {telemetry?.net_generation_mw?.toFixed(1) || 250.0} <span className="text-xs">MW</span>
                  </div>
                  <div className="text-[10px] text-indigo-300">
                    Grid Sync: {telemetry?.grid_frequency_hz?.toFixed(2) || 50.00} Hz
                  </div>
                </div>
              </div>
            ) : (
              /* Generic Hydro Component Visualizer */
              <div className="flex items-center justify-around w-full">
                <div className="w-20 h-20 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center">
                  <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-slate-400 mt-1">SCADA OK</span>
                </div>
                <div className="space-y-1 text-right font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">{node.primary_metric_name}</div>
                  <div className="text-xl font-black text-cyan-300">
                    {node.primary_metric_value} <span className="text-xs">{node.primary_metric_unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Class 1 Sensor Loop</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Primary Large Readout Metric */}
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            {node.primary_metric_name}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {node.primary_metric_value}
            </span>
            <span className="text-sm font-bold text-sky-400 font-mono">
              {node.primary_metric_unit}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Operating within safe design envelope (IEC 60041)</span>
          </div>
        </div>

        {/* Card 3: LIVE INSTRUMENTATION GAUGES (Grid of 6 active sensors) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              <span>Live Instrumentation Gauges</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {sensors.length} Sensors Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {sensors.map((s) => (
              <div
                key={s.id}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors"
              >
                <div className="text-[10px] text-slate-500 font-medium truncate" title={s.sensor_name}>
                  {s.sensor_name}
                </div>
                <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                  {s.value}{' '}
                  <span className="text-[10px] font-normal text-slate-500">{s.unit}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
                  <span>{s.sensor_kks}</span>
                  <span className="text-emerald-600 font-semibold">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: OPERATOR SETPOINT & DISPATCH CONTROLS */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Settings2 className="w-3.5 h-3.5 text-sky-500" />
              <span>Turbine Governor & Dispatch Control</span>
            </span>
            <span className="text-[10px] font-bold text-sky-600">Active Feedback</span>
          </div>

          {/* Wicket Gate Opening Slider */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Wicket Gate (Guide Vane) Opening:</span>
              <span className="font-mono text-sky-600 font-bold">{wicketGateInput}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={wicketGateInput}
              onChange={handleGateChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Closed)</span>
              <span>82.4% (Nominal)</span>
              <span>100% (Peak Flow)</span>
            </div>
          </div>

          {/* Quick Simulation Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onEmergencyTrip}
              className="px-3 py-2 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Emergency Trip</span>
            </button>
            <button
              onClick={onResetPlant}
              className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset Nominal</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

