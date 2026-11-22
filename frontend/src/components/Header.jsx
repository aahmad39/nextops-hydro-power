import React from 'react';
import { Share2, RefreshCw, Maximize2, Activity, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Header({ telemetry, onRefresh, isConnected, onEmergencyTrip, onResetPlant }) {
  const isTripped = telemetry?.is_tripped;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand & Title */}
      <div className="flex items-center space-x-4">
        {/* NextOps Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-cyan-500/20 tracking-wider">
            <span>∿</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">NextOps</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                INDUSTRIAL
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide">
              AI-Powered Telemetry • High-Fidelity Digital Twin
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

        {/* Plant Station Title & Unit Status */}
        <div className="hidden sm:flex items-center space-x-2.5">
          <h1 className="text-base font-bold text-slate-800 tracking-tight">
            Hydroelectric Power Generation
          </h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isTripped 
              ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isTripped ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`}></span>
            {isTripped ? 'TRIPPED - EMERGENCY SHUTDOWN' : 'Unit 2 • 250 MW Live'}
          </span>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Quick Simulation Trip / Reset Controls */}
        <div className="hidden lg:flex items-center space-x-2 mr-2">
          {isTripped ? (
            <button
              onClick={onResetPlant}
              className="px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Reset plant to nominal 100% capacity"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Nominal</span>
            </button>
          ) : (
            <button
              onClick={onEmergencyTrip}
              className="px-3 py-1.5 text-xs font-bold rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Simulate load rejection and turbine emergency trip"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Trip</span>
            </button>
          )}
        </div>

        {/* Share Button */}
        <button 
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              alert("Dashboard link copied to clipboard!");
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Share URL</span>
        </button>

        {/* Synced Status Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
          <Activity className={`w-3.5 h-3.5 ${isConnected ? 'text-cyan-500 animate-pulse' : 'text-amber-500'}`} />
          <span>Synced:</span>
          <span className="font-semibold text-cyan-600">
            {isConnected ? 'Live SCADA (1s)' : 'Connecting...'}
          </span>
        </div>

        {/* Live Refresh Dropdown */}
        <div className="flex items-center text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <span className="font-medium mr-1">5s Live</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </div>

        {/* Manual Refresh */}
        <button 
          onClick={onRefresh}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Force Telemetry Sync"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button 
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

