# NextOps Industrial - Hydroelectric Power Generation Digital Twin
**AI-Powered Telemetry + High-Fidelity 3-Tier Digital Twin**
*Unit 2 • 250 MW Live (Vertical Francis Turbogenerator)*

---

## 🌊 Overview

**NextOps Hydro Power** is an enterprise-grade Industrial SCADA and Digital Twin application modeled after high-head storage and run-of-river hydroelectric stations. Built with a clean **3-Tier Separated Architecture** (`frontend/`, `backend/`, and `database/`), it features real-time fluid dynamic physics, animated vector digital twin schematics, KKS tag hierarchy, interactive control drawers, and an AI-powered SCADA LangChain Copilot.

---

## 🏗️ 3-Tier Architecture (`alag-alag`)

```
nextops-hydro-power/
│
├── database/                   # TIER 1: DATABASE
│   ├── schema.sql              # SCADA tables: metadata, subsystems, KKS nodes, telemetry history, alarms, sensors
│   ├── init_db.py              # SQLite & PostgreSQL database initializer and 60m synthetic telemetry seeder
│   └── hydro_scada.db          # Initialized database (18 nodes, 102 sensors, 60m time-series)
│
├── backend/                    # TIER 2: BACKEND API & PHYSICS ENGINE
│   ├── main.py                 # FastAPI application with REST endpoints & 1-second WebSocket broadcaster
│   ├── hydro_physics.py        # Real hydro physics: P = η·ρ·g·Q·H, water hammer, surge damping, Francis runner curves
│   ├── copilot_service.py      # NextOps Copilot AI SCADA diagnostic assistant with IEC-60041 validation
│   └── requirements.txt        # Backend dependencies (fastapi, uvicorn, pydantic, websockets)
│
└── frontend/                   # TIER 3: HIGH-FIDELITY REACT FRONTEND
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx                # Top bar with NextOps Industrial branding, live sync, trip/reset triggers
    │   │   ├── KpiBar.jsx                # 4 live SCADA KPI cards (MW, Head & Flow, Efficiency, Grid Sync)
    │   │   ├── CycleFilters.jsx          # Cycle selector and flow multiplier controls (0.5x, 1x, 1.5x, 2x, pause)
    │   │   ├── PlantSystemsExplorer.jsx  # Left sidebar with KKS tree search and 18 equipment nodes
    │   │   ├── HydroDigitalTwin.jsx      # High-fidelity SVG digital twin with animated water flow, runner spin, electric wave pulses
    │   │   ├── DeviceDetailDrawer.jsx    # Right slide-out panel with micro-twin simulation and 6 active sensor gauges
    │   │   ├── NextOpsCopilotModal.jsx   # SCADA LangChain Copilot floating AI chat assistant
    │   │   └── Footer.jsx                # DevOps Insiders branding and SCADA instrumentation health score
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚡ Key Highlights & Features

1. **High-Fidelity Animated Digital Twin**:
   - Mountain valley with alpine snow peaks & concrete gravity dam.
   - Water reservoir with undulating animated surface waves & elevation gauge ($584.2\text{ m ASL}$).
   - High-pressure penstock with dynamic velocity water flow lines responding to simulation speed.
   - Differential surge tank with oscillating water column dampening water hammer transients.
   - Powerhouse cutaway with **13-blade Francis runner spinning** at governed $375\text{ RPM}$.
   - Synchronous hydro generator with rotating electromagnetic field glow.
   - Hydraulic elbow draft tube diffuser with swirling exit vortex.
   - Downstream tailrace canal returning clean water to the river ($195.4\text{ m}^3\text{/s}$).
   - Step-up transformer ($11\text{ kV} \to 400\text{ kV}$) and 3-phase high-voltage transmission lines with glowing current pulse animations.

2. **KKS Tagged SCADA Subsystems (18 Equipment Nodes)**:
   - `10HAA01`: Upper Reservoir & Gravity Dam
   - `10HAB01`: Intake Trash Rack & Sluice Gate
   - `10HAC01`: Underground Desilting Basin
   - `10HBA01`: High-Pressure Steel Penstock ($14.2\text{ bar}$)
   - `10HBB01`: Differential Surge Chamber ($578.6\text{ m}$)
   - `10HBC01`: Main Inlet Spherical Valve (MIV)
   - `10HCA01`: Turbine Spiral Casing ($13.9\text{ bar}$)
   - `10HCB01`: Guide Vanes / Wicket Gates ($82.4\%$ open)
   - `10HCC01`: Francis Hydro Runner ($375.0\text{ RPM}$, $\eta = 93.8\%$)
   - `10HCD01`: Thrust & Guide Bearings ($44.8^\circ\text{C}$)
   - `10HCE01`: Digital Electro-Hydraulic Governor
   - `10HDA01`: Synchronous Hydro Generator ($250.0\text{ MW}$)
   - `10HDB01`: Static Excitation & AVR System ($11.0\text{ kV}$)
   - `10HDC01`: Closed Air/Water Stator Cooling ($52.3^\circ\text{C}$)
   - `10HEA01`: Hydraulic Elbow Draft Tube ($-0.15\text{ bar}$)
   - `10HEB01`: Tailrace Discharge Channel ($195.4\text{ m}^3\text{/s}$)
   - `10HEC01`: Eco-Hydrology & Dissolved Oxygen ($8.4\text{ mg/L}$)
   - `10HFA01`: Generator Step-Up Transformer ($400\text{ kV} / 300\text{ MVA}$)
   - `10HFC01`: 400 kV Switchyard & Intertie ($50.00\text{ Hz}$)

3. **Interactive Control Drawer**:
   - Click any equipment node or floating badge to slide out the component inspection drawer.
   - Features micro-twin animation, radial gauges, 6 active telemetry sensors, and CSV telemetry export.
   - Real-time wicket gate opening throttle slider and Emergency Trip / Nominal Reset triggers.

4. **NextOps Copilot (SCADA LangChain Agent)**:
   - Specialized hydro engineering diagnostic AI.
   - Evaluates cavitation inception index ($\sigma$), water hammer dampening, reactive power capability, and IEC-60041 efficiency compliance.

---

## 🚀 Quick Start Guide

### 1. Database Initialization
```bash
cd database
python init_db.py
```

### 2. Run Backend API & WebSocket Server
```bash
cd backend
python main.py
# Runs on http://localhost:8000
# API Docs available at http://localhost:8000/docs
```

### 3. Run Frontend
```bash
cd frontend
npm run dev
# Open http://localhost:3000 in your browser!
```

---

## ☁️ Azure Deployment Notes
Configured for deployment to your Azure Resource Group (`nextops-rg-bob`):
- **Backend**: Azure Container Apps / Azure App Service (Python 3.14 / FastAPI).
- **Frontend**: Azure Static Web Apps / Azure Blob Storage CDN.
- **Database**: Azure Database for PostgreSQL or SQLite attached volume.

