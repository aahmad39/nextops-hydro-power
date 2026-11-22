import React, { useState } from 'react';
import { 
  Waves, Gauge, Zap, Wind, Droplet, ArrowRight, ShieldCheck, 
  RotateCw, AlertTriangle, Layers, Radio
} from 'lucide-react';

export default function HydroDigitalTwin({
  telemetry,
  selectedNodeId,
  onSelectNode,
  activeCycle,
  flowSpeed,
  isPaused
}) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const isTripped = telemetry?.is_tripped;
  const netGen = telemetry?.net_generation_mw ?? 250.0;
  const head = telemetry?.hydraulic_head_m ?? 142.5;
  const flow = telemetry?.flow_rate_m3s ?? 195.4;
  const rpm = telemetry?.runner_rpm ?? 375.0;
  const eff = telemetry?.turbine_efficiency_pct ?? 93.8;
  const gatePct = telemetry?.wicket_gate_actual_pct ?? 82.4;
  const surgeLvl = telemetry?.surge_tank_level_m ?? 578.6;
  const resLvl = telemetry?.reservoir_level_m ?? 584.2;
  const penPressure = telemetry?.penstock_pressure_bar ?? 14.2;
  const spiralPressure = telemetry?.spiral_case_pressure_bar ?? 13.9;

  // Animation durations based on flow speed
  const speedFactor = isPaused ? 0 : flowSpeed;
  const waterFlowDuration = speedFactor > 0 ? `${1.2 / speedFactor}s` : '0s';
  const runnerSpinDuration = speedFactor > 0 && !isTripped ? `${1.4 / speedFactor}s` : '0s';
  const electricPulseDuration = speedFactor > 0 && !isTripped ? `${0.9 / speedFactor}s` : '0s';

  // Helper to determine if a node is dimmed based on active cycle
  const isDimmed = (category) => {
    if (activeCycle === 'all') return false;
    if (activeCycle === 'hydraulic' && (category === 'hydraulic' || category === 'water')) return false;
    if (activeCycle === 'turbogenerator' && (category === 'turbogenerator' || category === 'turbine' || category === 'generator')) return false;
    if (activeCycle === 'substation' && (category === 'substation' || category === 'grid')) return false;
    if (activeCycle === 'tailrace' && (category === 'tailrace' || category === 'reservoir')) return false;
    return true;
  };

  return (
    <div className="relative w-full h-full min-h-[580px] bg-gradient-to-b from-[#e0f2fe]/40 via-[#f0f9ff]/70 to-[#f8fafc] overflow-hidden select-none border border-slate-200/60 rounded-xl shadow-inner flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Dynamic Background SVG with Mountain Landscape, Reservoir, Dam, Powerhouse & Grid */}
      <svg
        viewBox="0 0 1100 580"
        className="w-full h-full max-h-[720px] transition-all duration-500"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Water Gradients */}
          <linearGradient id="reservoirGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="penstockWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="damConcreteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="powerhouseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="generatorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
          </linearGradient>

          {/* Electric Spark Glow Filter */}
          <filter id="glowElectric" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. SCENIC MOUNTAIN BACKDROP */}
        <g id="mountains" className="opacity-90">
          {/* Distant Mountain Peaks */}
          <polygon points="40,240 180,90 280,240" fill="#93c5fd" opacity="0.35" />
          <polygon points="180,90 220,135 200,140 180,90" fill="#ffffff" opacity="0.9" /> {/* Snow Cap */}
          <polygon points="200,240 330,75 480,240" fill="#60a5fa" opacity="0.3" />
          <polygon points="330,75 365,120 340,125 330,75" fill="#ffffff" opacity="0.9" /> {/* Snow Cap */}

          {/* Midground Ridge */}
          <path
            d="M 0,260 Q 120,200 240,250 T 460,270 L 460,400 L 0,400 Z"
            fill="#cbd5e1"
            opacity="0.6"
          />
          {/* Alpine Trees on Ridge */}
          {[60, 90, 140, 180, 220, 360, 410].map((tx, idx) => (
            <polygon
              key={`tree-${idx}`}
              points={`${tx},235 ${tx - 6},250 ${tx + 6},250`}
              fill="#334155"
              opacity="0.4"
            />
          ))}
        </g>

        {/* 2. UPPER RESERVOIR & CONCRETE GRAVITY DAM */}
        <g id="reservoir-dam" className={`transition-opacity duration-300 ${isDimmed('reservoir') ? 'opacity-30' : 'opacity-100'}`}>
          {/* Water Reservoir Body */}
          <path
            d="M 10,240 Q 80,235 150,240 L 150,380 L 10,380 Z"
            fill="url(#reservoirGrad)"
          />
          {/* Animated Water Surface Waves */}
          <path
            d="M 10,240 Q 40,236 80,240 T 150,240"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Concrete Dam Wall */}
          <path
            d="M 150,230 L 175,230 L 210,380 L 150,380 Z"
            fill="url(#damConcreteGrad)"
            stroke="#334155"
            strokeWidth="2"
          />
          {/* Dam Crest Roadway */}
          <rect x="150" y="226" width="30" height="6" fill="#334155" rx="1" />

          {/* Intake Trash Rack Screen & Sluice Gate */}
          <rect x="165" y="310" width="16" height="40" fill="#1e293b" rx="2" />
          <line x1="168" y1="315" x2="168" y2="345" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="173" y1="315" x2="173" y2="345" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="178" y1="315" x2="178" y2="345" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
        </g>

        {/* 3. DIFFERENTIAL SURGE TANK (Vertical Chamber on mountain slope) */}
        <g id="surge-tank" className={`transition-opacity duration-300 ${isDimmed('hydraulic') ? 'opacity-30' : 'opacity-100'}`}>
          {/* Surge Tank Shell */}
          <rect x="270" y="140" width="36" height="150" fill="#e2e8f0" stroke="#475569" strokeWidth="3" rx="4" />
          <ellipse cx="288" cy="140" rx="18" ry="6" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          {/* Surge Tank Water Column (Dynamic Height according to surge level) */}
          <rect x="273" y="190" width="30" height="98" fill="url(#reservoirGrad)" />
          {/* Water meniscus oscillation */}
          <ellipse cx="288" cy="190" rx="15" ry="4" fill="#38bdf8" className="animate-surge-wave" />
          {/* Tank Level Gauge Markings */}
          <line x1="300" y1="160" x2="306" y2="160" stroke="#64748b" strokeWidth="1.5" />
          <line x1="298" y1="190" x2="306" y2="190" stroke="#0284c7" strokeWidth="2" />
          <line x1="300" y1="220" x2="306" y2="220" stroke="#64748b" strokeWidth="1.5" />
          {/* Surge Riser Pipe */}
          <rect x="282" y="288" width="12" height="30" fill="#64748b" stroke="#334155" strokeWidth="2" />
        </g>

        {/* 4. HIGH-PRESSURE STEEL PENSTOCK */}
        <g id="penstock" className={`transition-opacity duration-300 ${isDimmed('hydraulic') ? 'opacity-30' : 'opacity-100'}`}>
          {/* Main Penstock Pipe (Outer Steel Casing) */}
          <path
            d="M 180,340 L 285,340 L 370,430 L 440,430"
            fill="none"
            stroke="#475569"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Water Stream (Core) */}
          <path
            d="M 180,340 L 285,340 L 370,430 L 440,430"
            fill="none"
            stroke="url(#penstockWaterGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Animated Water Pulses / Dash Effect */}
          {speedFactor > 0 && (
            <path
              d="M 180,340 L 285,340 L 370,430 L 440,430"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="4"
              strokeDasharray="10 8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: `dashWater ${waterFlowDuration} linear infinite`
              }}
            />
          )}

          {/* Penstock Saddle Supports */}
          <polygon points="310,380 325,410 335,410 320,380" fill="#334155" />
          <polygon points="350,420 360,450 370,450 360,420" fill="#334155" />

          {/* Main Inlet Valve (MIV) Housing */}
          <rect x="390" y="415" width="22" height="30" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="3" />
          <circle cx="401" cy="430" r="6" fill={isTripped ? "#ef4444" : "#10b981"} />
        </g>

        {/* 5. POWERHOUSE STRUCTURE (Cutaway Architectural View) */}
        <g id="powerhouse" className={`transition-opacity duration-300 ${isDimmed('turbogenerator') ? 'opacity-30' : 'opacity-100'}`}>
          {/* Powerhouse Concrete Building Enclosure */}
          <path
            d="M 430,280 L 670,280 L 670,520 L 430,520 Z"
            fill="url(#powerhouseGrad)"
            stroke="#475569"
            strokeWidth="3"
            rx="6"
          />
          {/* Powerhouse Roof Parapet & Crane Rail */}
          <rect x="426" y="274" width="248" height="8" fill="#334155" rx="2" />
          <line x1="440" y1="300" x2="660" y2="300" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4" />
          <text x="445" y="296" fontSize="10" fill="#64748b" fontWeight="bold">MACHINE HALL (UNIT 2 - 250 MW)</text>

          {/* Machine Foundation Bed (Heavy Concrete Plinth) */}
          <rect x="445" y="465" width="210" height="48" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" rx="3" />

          {/* Francis Spiral Casing (Scroll Case Volute) */}
          <path
            d="M 440,430 C 470,410 540,410 560,440 C 570,470 540,490 500,485 C 470,480 460,455 480,440"
            fill="#0369a1"
            stroke="#0284c7"
            strokeWidth="4"
            opacity="0.9"
          />

          {/* Wicket Gates (Guide Vanes Ring) */}
          <circle cx="510" cy="455" r="28" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* FRANCIS TURBINE RUNNER (Rotating Blades) */}
          <g transform="translate(510, 455)">
            <g
              style={{
                animation: runnerSpinDuration !== '0s' ? `spinRunner ${runnerSpinDuration} linear infinite` : 'none',
                transformOrigin: '0 0'
              }}
            >
              {/* Central Hub */}
              <circle cx="0" cy="0" r="10" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
              {/* Runner Blades (13-Blade Francis Geometry) */}
              {[0, 27.7, 55.4, 83.1, 110.8, 138.5, 166.2, 193.9, 221.6, 249.3, 277, 304.7, 332.4].map((deg, i) => (
                <path
                  key={`blade-${i}`}
                  d="M 0,0 Q 14,8 24,0"
                  fill="none"
                  stroke={isTripped ? "#94a3b8" : "#e0f2fe"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
          </g>

          {/* Heavy Forged Vertical Shaft */}
          <rect x="506" y="365" width="8" height="70" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          {/* Shaft Thrust Bearing Collar */}
          <rect x="500" y="395" width="20" height="10" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" rx="1" />

          {/* SYNCHRONOUS HYDRO GENERATOR */}
          <rect x="475" y="325" width="70" height="42" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" rx="4" />
          {/* Generator Stator Magnetic Flux Animation */}
          <rect
            x="480"
            y="330"
            width="60"
            height="32"
            fill="url(#generatorGlow)"
            className={speedFactor > 0 && !isTripped ? "animate-pulse" : ""}
            rx="2"
          />
          {/* Stator Pole Bars */}
          <line x1="488" y1="330" x2="488" y2="362" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          <line x1="498" y1="330" x2="498" y2="362" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          <line x1="510" y1="330" x2="510" y2="362" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          <line x1="522" y1="330" x2="522" y2="362" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          <line x1="532" y1="330" x2="532" y2="362" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          {/* Exciter Crown */}
          <rect x="495" y="315" width="30" height="10" fill="#0284c7" stroke="#0369a1" strokeWidth="1" rx="2" />
          <text x="487" y="350" fontSize="9" fill="#ffffff" fontWeight="bold" letterSpacing="1">250 MW</text>

          {/* 11 kV Isolated Phase Bus Duct to Transformer */}
          <path
            d="M 545,340 L 610,340 L 610,410 L 685,410"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {speedFactor > 0 && !isTripped && (
            <path
              d="M 545,340 L 610,340 L 610,410 L 685,410"
              fill="none"
              stroke="#fef08a"
              strokeWidth="2"
              strokeDasharray="6 4"
              style={{
                animation: `dashElectric ${electricPulseDuration} linear infinite`
              }}
            />
          )}

          {/* HYDRAULIC ELBOW DRAFT TUBE (Diffuser) */}
          <path
            d="M 495,482 C 495,510 470,530 420,530 L 300,530 L 300,500 L 485,500 Z"
            fill="url(#reservoirGrad)"
            opacity="0.95"
          />
          {/* Swirling draft tube water flow */}
          {speedFactor > 0 && (
            <path
              d="M 505,485 Q 490,520 440,518 T 320,515"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="3"
              strokeDasharray="8 6"
              style={{
                animation: `dashWater ${waterFlowDuration} linear infinite`
              }}
            />
          )}
        </g>

        {/* 6. TAILRACE & LOWER RIVER DISCHARGE */}
        <g id="tailrace" className={`transition-opacity duration-300 ${isDimmed('tailrace') ? 'opacity-30' : 'opacity-100'}`}>
          {/* Tailrace River Basin */}
          <path
            d="M 0,490 L 340,490 L 340,560 L 0,560 Z"
            fill="url(#reservoirGrad)"
          />
          {/* Animated Downstream River Ripples */}
          <path
            d="M 20,510 Q 70,506 130,510 T 250,510"
            fill="none"
            stroke="#bae6fd"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M 50,535 Q 120,530 190,535 T 310,535"
            fill="none"
            stroke="#bae6fd"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-pulse"
          />
          {/* Riverbed Rocks */}
          <ellipse cx="60" cy="552" rx="14" ry="5" fill="#475569" opacity="0.6" />
          <ellipse cx="140" cy="555" rx="18" ry="6" fill="#334155" opacity="0.5" />
          <ellipse cx="230" cy="550" rx="12" ry="4" fill="#475569" opacity="0.6" />
        </g>

        {/* 7. STEP-UP TRANSFORMER (11 kV to 400 kV) */}
        <g id="transformer" className={`transition-opacity duration-300 ${isDimmed('substation') ? 'opacity-30' : 'opacity-100'}`}>
          {/* Concrete Plinth */}
          <rect x="680" y="440" width="70" height="15" fill="#94a3b8" rx="2" />
          {/* Main Tank Body */}
          <rect x="688" y="375" width="54" height="65" fill="#334155" stroke="#1e293b" strokeWidth="2" rx="3" />
          {/* Cooling Radiator Fins */}
          <line x1="684" y1="385" x2="684" y2="430" stroke="#64748b" strokeWidth="3" />
          <line x1="680" y1="390" x2="680" y2="425" stroke="#64748b" strokeWidth="3" />
          <line x1="746" y1="385" x2="746" y2="430" stroke="#64748b" strokeWidth="3" />
          <line x1="750" y1="390" x2="750" y2="425" stroke="#64748b" strokeWidth="3" />
          {/* Conservator Drum on top */}
          <rect x="696" y="360" width="38" height="12" fill="#64748b" stroke="#334155" strokeWidth="1.5" rx="4" />
          {/* High Voltage Bushings (3-Phase 400 kV Porcelain Insulators) */}
          <polygon points="702,360 706,340 710,360" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
          <polygon points="713,360 717,340 721,360" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
          <polygon points="724,360 728,340 732,360" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
        </g>

        {/* 8. TRANSMISSION TOWERS & 400 kV OVERHEAD GRID */}
        <g id="grid-lines" className={`transition-opacity duration-300 ${isDimmed('substation') ? 'opacity-30' : 'opacity-100'}`}>
          {/* Pylon 1 (Switchyard Gantries) */}
          <path
            d="M 830,460 L 850,260 L 870,460 Z"
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
          />
          {/* Crossarms */}
          <line x1="820" y1="290" x2="880" y2="290" stroke="#334155" strokeWidth="3" />
          <line x1="810" y1="330" x2="890" y2="330" stroke="#334155" strokeWidth="3" />
          <line x1="835" y1="370" x2="865" y2="370" stroke="#475569" strokeWidth="2" />
          {/* Pylon Lattice Bracing */}
          <line x1="838" y1="410" x2="862" y2="370" stroke="#64748b" strokeWidth="1.5" />
          <line x1="862" y1="410" x2="838" y2="370" stroke="#64748b" strokeWidth="1.5" />

          {/* Pylon 2 (Distant Lattice Tower) */}
          <path
            d="M 990,440 L 1005,280 L 1020,440 Z"
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
          />
          <line x1="980" y1="310" x2="1030" y2="310" stroke="#475569" strokeWidth="2" />
          <line x1="975" y1="345" x2="1035" y2="345" stroke="#475569" strokeWidth="2" />

          {/* 400 kV Transmission Power Lines */}
          {/* Top Line */}
          <path
            d="M 720,340 Q 770,290 820,290 T 980,310 T 1100,310"
            fill="none"
            stroke="#eab308"
            strokeWidth="3.5"
          />
          {/* Middle Line */}
          <path
            d="M 728,340 Q 770,330 810,330 T 975,345 T 1100,345"
            fill="none"
            stroke="#eab308"
            strokeWidth="3.5"
          />

          {/* Animated Electrical Wave Energy Pulses */}
          {speedFactor > 0 && !isTripped && (
            <>
              <path
                d="M 720,340 Q 770,290 820,290 T 980,310 T 1100,310"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="8 6"
                style={{
                  animation: `dashElectric ${electricPulseDuration} linear infinite`,
                  filter: 'url(#glowElectric)'
                }}
              />
              <path
                d="M 728,340 Q 770,330 810,330 T 975,345 T 1100,345"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="8 6"
                style={{
                  animation: `dashElectric ${electricPulseDuration} linear infinite`,
                  filter: 'url(#glowElectric)'
                }}
              />
            </>
          )}
        </g>

        {/* 9. CONNECTING POINTER LINES TO TELEMETRY PILLS (Exact style as screenshot) */}
        {/* Reservoir Badge Line */}
        <polyline points="75,260 75,200 100,200" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Surge Tank Line */}
        <polyline points="288,140 288,105 320,105" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Penstock Line */}
        <polyline points="330,380 330,340 350,340" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Francis Turbine Runner Line */}
        <polyline points="510,480 510,505 530,505" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Generator Line */}
        <polyline points="530,325 530,250 560,250" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Transformer Line */}
        <polyline points="715,360 715,305 735,305" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Transmission Line */}
        <polyline points="980,290 980,240 1000,240" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Tailrace River Line */}
        <polyline points="180,510 180,480 200,480" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>

      {/* 10. INTERACTIVE FLOATING SCADA TELEMETRY BADGES (HTML Overlay for crisp fonts & interactions) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* BADGE 1: Upper Reservoir & Dam */}
        <div
          onClick={() => onSelectNode('RESERVOIR-01')}
          className={`absolute left-[5%] top-[30%] sm:top-[32%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
            selectedNodeId === 'RESERVOIR-01' ? 'ring-2 ring-sky-500 scale-105' : ''
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-sky-200 rounded-lg shadow-sm px-2.5 py-1 text-left min-w-[125px]">
            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>Upper Reservoir</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-sky-700">
              {resLvl.toFixed(1)} m • <span className="text-[10px] font-semibold text-slate-500">92.4% Full</span>
            </div>
          </div>
        </div>

        {/* BADGE 2: Surge Tank */}
        <div
          onClick={() => onSelectNode('SURGE-TANK-01')}
          className={`absolute left-[26%] top-[14%] sm:top-[16%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
            selectedNodeId === 'SURGE-TANK-01' ? 'ring-2 ring-sky-500 scale-105' : ''
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-sky-200 rounded-lg shadow-sm px-2.5 py-1 text-left min-w-[130px]">
            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>Surge Chamber</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-cyan-700">
              {surgeLvl.toFixed(1)} m • <span className="text-[10px] font-semibold text-slate-500">Damped</span>
            </div>
          </div>
        </div>

        {/* BADGE 3: Penstock */}
        <div
          onClick={() => onSelectNode('PENSTOCK-01')}
          className={`absolute left-[29%] top-[54%] sm:top-[56%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
            selectedNodeId === 'PENSTOCK-01' ? 'ring-2 ring-sky-500 scale-105' : ''
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-sky-200 rounded-lg shadow-sm px-2.5 py-1 text-left min-w-[130px]">
            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>Penstock Tunnel</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-sky-700">
              {penPressure.toFixed(1)} bar • <span className="text-[10px] font-semibold text-slate-500">{flow.toFixed(1)} m³/s</span>
            </div>
          </div>
        </div>

        {/* BADGE 4: Francis Turbine Runner */}
        <div
          onClick={() => onSelectNode('FRANCIS-RUNNER-01')}
          className={`absolute left-[47%] top-[78%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
            selectedNodeId === 'FRANCIS-RUNNER-01' ? 'ring-2 ring-amber-500 scale-105' : ''
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-amber-200 rounded-lg shadow-sm px-2.5 py-1 text-left min-w-[140px]">
            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>Francis Turbine</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isTripped ? 'bg-rose-500' : 'bg-amber-500 animate-spin'}`}></span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-amber-700">
              {rpm.toFixed(0)} RPM • <span className="text-[10px] font-semibold text-slate-500">{eff.toFixed(1)}% η</span>
            </div>
          </div>
        </div>

        {/* BADGE 5: Synchronous Generator */}
        <div
          onClick={() => onSelectNode('GENERATOR-01')}
          className={`absolute left-[48%] top-[38%] sm:top-[40%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
            selectedNodeId === 'GENERATOR-01' ? 'ring-2 ring-emerald-500 scale-105' : ''
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-emerald-200 rounded-lg shadow-sm px-2.5 py-1 text-left min-w-[145px]">
            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>Generator (Sync)</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isTripped ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`}></span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-emerald-700">
              {netGen.toFixed(1)} MW • <span className="text-[10px] font-semibold text-slate-500">{telemetry?.grid_frequency_hz?.toFixed(2) || '50.00'} Hz</span>
            </div>
          </div>
        </div>

        {/* BADGE 6: Step-Up Transformer */}
        <div
          onClick={() => onSelectNode('TRANSFORMER-01')}
          className={`absolute left-[65%] top-[48%] sm:top-[50%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
            selectedNodeId === 'TRANSFORMER-01' ? 'ring-2 ring-amber-500 scale-105' : ''
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-amber-200 rounded-lg shadow-sm px-2.5 py-1 text-left min-w-[130px]">
            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>GSU Transformer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-amber-700">
              {telemetry?.transformer_voltage_kv?.toFixed(1) || '400.0'} kV • <span className="text-[10px] font-semibold text-slate-500">300 MVA</span>
            </div>
          </div>
        </div>

        {/* BADGE 7: 400 kV Transmission Lines */}
        <div
          onClick={() => onSelectNode('TRANSMISSION-01')}
          className={`absolute right-[4%] top-[36%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
            selectedNodeId === 'TRANSMISSION-01' ? 'ring-2 ring-yellow-500 scale-105' : ''
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-yellow-300 rounded-lg shadow-sm px-2.5 py-1 text-left min-w-[140px]">
            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>Transmission Lines</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-yellow-700">
              400 kV • <span className="text-[10px] font-semibold text-slate-500">50.00 Hz Sync</span>
            </div>
          </div>
        </div>

        {/* BADGE 8: Tailrace Downstream River */}
        <div
          onClick={() => onSelectNode('TAILRACE-01')}
          className={`absolute left-[16%] bottom-[5%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
            selectedNodeId === 'TAILRACE-01' ? 'ring-2 ring-sky-500 scale-105' : ''
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-sky-200 rounded-lg shadow-sm px-2.5 py-1 text-left min-w-[140px]">
            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>Tailrace & River</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-sky-700">
              14.2 °C • <span className="text-[10px] font-semibold text-slate-500">{flow.toFixed(1)} m³/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

