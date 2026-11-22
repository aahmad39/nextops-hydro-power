import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import KpiBar from './components/KpiBar';
import CycleFilters from './components/CycleFilters';
import PlantSystemsExplorer from './components/PlantSystemsExplorer';
import HydroDigitalTwin from './components/HydroDigitalTwin';
import DeviceDetailDrawer from './components/DeviceDetailDrawer';
import NextOpsCopilotModal from './components/NextOpsCopilotModal';
import Footer from './components/Footer';
import { Bot, Sparkles } from 'lucide-react';

export default function App() {
  const [telemetry, setTelemetry] = useState({
    net_generation_mw: 250.0,
    rated_capacity_mw: 250.0,
    capacity_factor_pct: 98.4,
    hydraulic_head_m: 142.5,
    flow_rate_m3s: 195.4,
    turbine_efficiency_pct: 93.8,
    unit_health_pct: 99.9,
    grid_frequency_hz: 50.00,
    runner_rpm: 375.0,
    wicket_gate_actual_pct: 82.4,
    wicket_gate_target_pct: 82.4,
    spiral_case_pressure_bar: 13.9,
    penstock_pressure_bar: 14.2,
    surge_tank_level_m: 578.6,
    reservoir_level_m: 584.2,
    tailrace_level_m: 412.3,
    terminal_voltage_kv: 11.0,
    transformer_voltage_kv: 400.0,
    transformer_temp_c: 56.4,
    bearing_temp_c: 44.8,
    bearing_vibration_mms: 1.24,
    cavitation_sigma: 0.118,
    is_tripped: false,
    is_paused: false,
    flow_multiplier: 1.0,
    scada_status: 'Unit 2 • 250 MW Francis SCADA Active'
  });

  const [subsystems, setSubsystems] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState('FRANCIS-RUNNER-01');
  const [selectedNodeDetail, setSelectedNodeDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCycle, setActiveCycle] = useState('all');
  const [flowSpeed, setFlowSpeed] = useState(1.0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);

  // 1. Fetch Systems List
  const fetchSystems = async () => {
    try {
      const res = await fetch('/api/systems');
      if (res.ok) {
        const data = await res.json();
        setSubsystems(data.subsystems || []);
      }
    } catch (err) {
      console.error('Failed to load systems:', err);
    }
  };

  // 2. Fetch Device Detail
  const fetchDeviceDetail = async (nodeId) => {
    if (!nodeId) {
      setSelectedNodeDetail(null);
      return;
    }
    try {
      const res = await fetch(`/api/device/${nodeId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedNodeDetail(data);
      }
    } catch (err) {
      console.error('Failed to load device detail:', err);
    }
  };

  // 3. WebSocket Real-time Connection
  useEffect(() => {
    fetchSystems();
    fetchDeviceDetail(selectedNodeId);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;

    const connectWs = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.net_generation_mw !== undefined) {
            setTelemetry(data);
            setIsPaused(data.is_paused);
            setFlowSpeed(data.flow_multiplier || 1.0);
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        setTimeout(connectWs, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WS error, fallback polling active:', err);
        ws.close();
      };
    };

    connectWs();

    // Fallback polling every 5s if WS drops
    const pollInterval = setInterval(() => {
      if (!isConnected) {
        fetch('/api/plant/overview')
          .then((r) => r.json())
          .then((d) => {
            if (d && d.telemetry) {
              setTelemetry(d.telemetry);
            }
          })
          .catch(() => {});
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Update device detail when selectedNodeId changes
  useEffect(() => {
    fetchDeviceDetail(selectedNodeId);
  }, [selectedNodeId]);

  // Controls Handlers
  const handleSetFlowSpeed = async (multiplier) => {
    setFlowSpeed(multiplier);
    setIsPaused(false);
    try {
      await fetch('/api/control/speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiplier })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePause = async () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    try {
      await fetch('/api/control/speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiplier: nextPaused ? 0.0 : flowSpeed })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetWicketGate = async (opening_pct) => {
    try {
      await fetch('/api/control/wicket-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opening_pct })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmergencyTrip = async () => {
    try {
      await fetch('/api/control/trip', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetPlant = async () => {
    try {
      await fetch('/api/control/reset', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* 1. Header */}
      <Header
        telemetry={telemetry}
        isConnected={isConnected}
        onRefresh={() => {
          fetchSystems();
          fetchDeviceDetail(selectedNodeId);
        }}
        onEmergencyTrip={handleEmergencyTrip}
        onResetPlant={handleResetPlant}
      />

      {/* 2. Top KPI Cards */}
      <KpiBar telemetry={telemetry} />

      {/* 3. Cycle & Flow Controls Bar */}
      <CycleFilters
        activeCycle={activeCycle}
        onSelectCycle={setActiveCycle}
        flowSpeed={flowSpeed}
        onSetFlowSpeed={handleSetFlowSpeed}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        scadaStatus={telemetry.scada_status}
      />

      {/* 4. Main Body: Left Explorer + Center Digital Twin + Right Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Plant Systems Explorer */}
        <PlantSystemsExplorer
          subsystems={subsystems}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isCollapsed={isExplorerCollapsed}
          onToggleCollapse={() => setIsExplorerCollapsed(!isExplorerCollapsed)}
        />

        {/* Center Canvas: High-Fidelity Animated Hydro Digital Twin */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-100/60 flex flex-col">
          <HydroDigitalTwin
            telemetry={telemetry}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            activeCycle={activeCycle}
            flowSpeed={flowSpeed}
            isPaused={isPaused}
          />
        </main>

        {/* Right Detail Panel Drawer (Slides out on node click) */}
        {selectedNodeDetail && (
          <DeviceDetailDrawer
            nodeDetail={selectedNodeDetail}
            telemetry={telemetry}
            onClose={() => setSelectedNodeDetail(null)}
            onSetWicketGate={handleSetWicketGate}
            onEmergencyTrip={handleEmergencyTrip}
            onResetPlant={handleResetPlant}
          />
        )}
      </div>

      {/* 5. Floating NextOps Copilot SCADA Button (Matches screenshot exact placement & styling) */}
      <div className="fixed bottom-12 right-6 z-40">
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-full px-4 py-2.5 shadow-xl shadow-sky-500/30 flex items-center space-x-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-xs font-black tracking-tight flex items-center space-x-1">
              <span>NextOps Copilot</span>
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </div>
            <div className="text-[9px] text-cyan-100 font-medium">
              SCADA LangChain Agent
            </div>
          </div>
        </button>
      </div>

      {/* Copilot Chat Modal / Drawer */}
      <NextOpsCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        telemetry={telemetry}
      />

      {/* 6. Footer */}
      <Footer telemetry={telemetry} isConnected={isConnected} />
    </div>
  );
}

