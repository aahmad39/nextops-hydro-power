# NextOps Industrial - Hydroelectric Power Generation Digital Twin
**AI-Powered Telemetry + High-Fidelity 3-Tier Enterprise Digital Twin**
*Unit 2 • 250 MW Live (Vertical Francis Turbogenerator)*

---

## 🌐 Live Production Deployment (Azure Cloud - Canada Central)

- **Frontend Application (Live UI)**: [http://20.220.216.229](http://20.220.216.229)
- **Backend API Docs (Swagger UI)**: [http://20.151.104.207:8000/docs](http://20.151.104.207:8000/docs)
- **SCADA Plant Overview Endpoint**: [http://20.220.216.229/api/plant/overview](http://20.220.216.229/api/plant/overview)

---

## 🏗️ True 3-Tier Distributed Infrastructure

```
                          [ End User / Web Browser ]
                                      │
                                      ▼ (Port 80)
    ┌────────────────────────────────────────────────────────────────────────┐
    │ TIER 3: FRONTEND VM (vm-hydro-frontend)                                │
    │ Public IP: 20.220.216.229  |  Private IP: 10.0.1.5 (snet-vm)          │
    │ - React 18, Vite, Tailwind CSS, SVG Animated Digital Twin Schematics   │
    │ - Nginx Reverse Proxy with WebSocket Upgrades                          │
    │   • location /     -> Local React Static Bundle                        │
    │   • location /api/ -> Internal Proxy to Backend (10.0.2.4:8000/api/)   │
    │   • location /ws   -> Internal Proxy to Backend (10.0.2.4:8000/ws)     │
    └───────────────────────────────────┬────────────────────────────────────┘
                                        │
                         Internal VNet Subnet-to-Subnet (TCP 8000)
                                        │
                                        ▼
    ┌────────────────────────────────────────────────────────────────────────┐
    │ TIER 2: BACKEND & PHYSICS ENGINE VM (vm-hydro-backend)                 │
    │ Public IP: 20.151.104.207  |  Private IP: 10.0.2.4 (snet-backend)     │
    │ - FastAPI Application with REST APIs & 1-second WebSocket Broadcaster  │
    │ - Hydro Physics: P = η·ρ·g·Q·H, Water Hammer & Surge Damping Equations │
    │ - Systemd Daemon: hydro-backend.service                                │
    └───────────────────────────────────┬────────────────────────────────────┘
                                        │
                      Encrypted PostgreSQL SSL Connection (TCP 5432)
                                        │
                                        ▼
    ┌────────────────────────────────────────────────────────────────────────┐
    │ TIER 1: DATABASE (psql-hydro-canadacen)                                │
    │ Azure Database for PostgreSQL Flexible Server (PostgreSQL 15)          │
    │ Host: psql-hydro-canadacen.postgres.database.azure.com                │
    │ - Database: hydro_scada                                                │
    │ - 18 Equipment Nodes (KKS hierarchy), 102 Sensors, 60m Telemetry       │
    └────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Architecture Components

| Tier | Azure Resource | Type | Region | IP / Endpoint | Description |
|---|---|---|---|---|---|
| **Tier 3 (Web)** | `vm-hydro-frontend` | Ubuntu 22.04 LTS (ARM64) | Canada Central | `20.220.216.229` (Private: `10.0.1.5`) | Hosts React SPA & Nginx Reverse Proxy |
| **Tier 2 (App)** | `vm-hydro-backend` | Ubuntu 22.04 LTS (ARM64) | Canada Central | `20.151.104.207` (Private: `10.0.2.4`) | Runs FastAPI Uvicorn service and physics simulation |
| **Tier 1 (Data)** | `psql-hydro-canadacen` | Azure PostgreSQL Flexible Server | Canada Central | `psql-hydro-canadacen.postgres.database.azure.com` | Managed PostgreSQL 15 SCADA Database |
| **Network** | `vnet-hydro-canadacentral` | Virtual Network (`10.0.0.0/16`) | Canada Central | Subnets: `snet-vm` (`10.0.1.0/24`), `snet-backend` (`10.0.2.0/24`) | Secure inter-tier communication |
| **Security** | `nsg-hydro-vm` | Network Security Group | Canada Central | Inbound: 80 (HTTP), 22 (SSH), 8000 (API) | Firewall rules guarding both subnets |

---

## 📁 Repository Structure

```
nextops-hydro-power/
├── frontend/               # TIER 3: React + Tailwind + Digital Twin SVG Schematics
│   ├── src/
│   │   ├── components/     # Digital Twin, KPI Bar, Systems Tree, Copilot Modal
│   │   ├── App.jsx         # WebSocket telemetry listener & state
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── backend/                # TIER 2: FastAPI + Hydro Physics + SCADA Telemetry
│   ├── main.py             # REST endpoints, WebSocket broadcaster, PostgreSQL connector
│   ├── hydro_physics.py    # Fluid dynamic calculations & runner power curve
│   ├── copilot_service.py  # Diagnostic AI Copilot service
│   └── requirements.txt
│
├── database/               # TIER 1: Database Initialization & Schema
│   ├── schema.sql          # SCADA relational schema (PostgreSQL & SQLite compatible)
│   ├── init_db.py          # Database initializer and seeder
│   └── hydro_scada.db      # Local testing SQLite database
│
├── setup_frontend_vm.sh    # Production deployment script for Frontend VM
├── setup_backend_vm.sh     # Production deployment script for Backend VM
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Database
```bash
cd database
python init_db.py
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to test locally!
