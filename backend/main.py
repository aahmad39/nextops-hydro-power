"""
NextOps SCADA - Hydroelectric Digital Twin Backend Server
FastAPI + WebSocket + SQLite Architecture
"""
import asyncio
import json
import os
import sqlite3
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from hydro_physics import hydro_engine
from copilot_service import copilot_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(simulation_loop())
    yield
    task.cancel()

app = FastAPI(
    title="NextOps SCADA - Hydroelectric Digital Twin API",
    description="Real-time telemetry, physics simulation, and SCADA AI Copilot for Hydro Power Station",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "hydro_scada.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            if dead in self.active_connections:
                self.active_connections.remove(dead)

manager = ConnectionManager()

# Background Simulation Loop
async def simulation_loop():
    tick_count = 0
    while True:
        try:
            snapshot = hydro_engine.tick(1.0)
            payload = json.dumps(snapshot)
            await manager.broadcast(payload)

            tick_count += 1
            # Save periodic history every 30 ticks
            if tick_count % 30 == 0:
                save_telemetry_point(snapshot)
        except Exception as e:
            print(f"[SimLoop Error]: {e}")
        await asyncio.sleep(1.0)

def save_telemetry_point(s: dict):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO telemetry_history (
                timestamp, net_generation_mw, hydraulic_head_m, flow_rate_m3s, turbine_efficiency_pct,
                runner_rpm, wicket_gate_opening_pct, spiral_case_pressure_bar, penstock_pressure_bar,
                surge_tank_level_m, reservoir_level_m, grid_frequency_hz, generator_voltage_kv,
                transformer_temp_c, bearing_vibration_mms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["timestamp"], s["net_generation_mw"], s["hydraulic_head_m"], s["flow_rate_m3s"],
            s["turbine_efficiency_pct"], s["runner_rpm"], s["wicket_gate_actual_pct"],
            s["spiral_case_pressure_bar"], s["penstock_pressure_bar"], s["surge_tank_level_m"],
            s["reservoir_level_m"], s["grid_frequency_hz"], s["terminal_voltage_kv"],
            s["transformer_temp_c"], s["bearing_vibration_mms"]
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DB Save Error]: {e}")



# REST Endpoints
@app.get("/")
def read_root():
    return {
        "app": "NextOps Industrial SCADA",
        "system": "Hydroelectric Power Generation Digital Twin",
        "unit": "Unit 2 - 250 MW Live",
        "docs_url": "/docs",
        "ws_endpoint": "/ws/telemetry"
    }

@app.get("/api/plant/overview")
def get_plant_overview():
    telemetry = hydro_engine.get_telemetry_snapshot()
    return {
        "plant_name": "NextOps Hydro Basin",
        "plant_type": "High-Head Storage & Run-of-River",
        "unit_id": "Unit 2 - 250 MW Live",
        "subtitle": "AI-Powered Telemetry • High-Fidelity Digital Twin",
        "telemetry": telemetry,
        "kpis": [
            {
                "id": "kpi-generation",
                "label": "NET GENERATION",
                "value": f"{telemetry['net_generation_mw']:.1f} MW",
                "subvalue": f"{telemetry['capacity_factor_pct']}% Base Load",
                "badge_color": "emerald",
                "status": "normal" if telemetry['net_generation_mw'] > 100 else "warning"
            },
            {
                "id": "kpi-head-flow",
                "label": "HYDRAULIC HEAD & FLOW",
                "value": f"{telemetry['hydraulic_head_m']:.1f} m",
                "subvalue": f"{telemetry['flow_rate_m3s']:.1f} m³/s",
                "badge_color": "cyan",
                "status": "normal"
            },
            {
                "id": "kpi-efficiency",
                "label": "TURBINE EFFICIENCY",
                "value": f"{telemetry['turbine_efficiency_pct']:.1f}%",
                "subvalue": "Francis Runner η",
                "badge_color": "amber",
                "status": "normal" if telemetry['turbine_efficiency_pct'] > 90 else "advisory"
            },
            {
                "id": "kpi-health-sync",
                "label": "UNIT HEALTH & GRID SYNC",
                "value": f"{telemetry['unit_health_pct']:.1f}%",
                "subvalue": f"{telemetry['grid_frequency_hz']:.2f} Hz Sync",
                "badge_color": "indigo",
                "status": "normal" if telemetry['unit_health_pct'] > 95 else "danger"
            }
        ]
    }

@app.get("/api/systems")
def get_systems():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM plant_subsystems ORDER BY system_index")
    subsystems_rows = cursor.fetchall()

    cursor.execute("SELECT * FROM equipment_nodes")
    nodes_rows = cursor.fetchall()
    conn.close()

    live = hydro_engine.get_telemetry_snapshot()

    # Map dynamic live values into nodes
    def get_live_node_metric(node_id, default_val, unit):
        if node_id == "RESERVOIR-01":
            return live["reservoir_level_m"], "m ASL"
        elif node_id == "PENSTOCK-01":
            return live["penstock_pressure_bar"], "bar"
        elif node_id == "SURGE-TANK-01":
            return live["surge_tank_level_m"], "m"
        elif node_id == "MIV-VALVE-01":
            return (0.0 if live["is_tripped"] else 100.0), "% Open"
        elif node_id == "SPIRAL-CASE-01":
            return live["spiral_case_pressure_bar"], "bar"
        elif node_id == "WICKET-GATES-01":
            return live["wicket_gate_actual_pct"], "% Open"
        elif node_id == "FRANCIS-RUNNER-01":
            return live["runner_rpm"], "RPM"
        elif node_id == "BEARINGS-01":
            return live["bearing_temp_c"], "°C"
        elif node_id == "GENERATOR-01":
            return live["net_generation_mw"], "MW"
        elif node_id == "AVR-EXCITER-01":
            return live["terminal_voltage_kv"], "kV"
        elif node_id == "STATOR-COOL-01":
            return round(35.0 + 17.0 * (live["net_generation_mw"] / 250.0), 1), "°C"
        elif node_id == "DRAFT-TUBE-01":
            return -0.15, "bar"
        elif node_id == "TAILRACE-01":
            return live["flow_rate_m3s"], "m³/s"
        elif node_id == "ENV-MONITOR-01":
            return 8.4, "mg/L"
        elif node_id == "TRANSFORMER-01":
            return live["transformer_voltage_kv"], "kV"
        elif node_id == "TRANSMISSION-01":
            return live["grid_frequency_hz"], "Hz"
        return default_val, unit

    nodes_by_subsystem = {}
    all_nodes_list = []
    for n in nodes_rows:
        val, unit = get_live_node_metric(n["id"], n["primary_metric_value"], n["primary_metric_unit"])
        node_status = "CRITICAL" if (live["is_tripped"] and n["id"] in ["GENERATOR-01", "FRANCIS-RUNNER-01"]) else n["status"]
        node_data = {
            "id": n["id"],
            "subsystem_id": n["subsystem_id"],
            "name": n["name"],
            "kks_tag": n["kks_tag"],
            "short_kks": n["short_kks"],
            "node_type": n["node_type"],
            "category": n["category"],
            "primary_metric_name": n["primary_metric_name"],
            "primary_metric_value": val,
            "primary_metric_unit": unit,
            "status": node_status,
            "status_message": n["status_message"],
            "cycle_group": n["cycle_group"],
            "schematic_x": n["schematic_x"],
            "schematic_y": n["schematic_y"]
        }
        all_nodes_list.append(node_data)
        nodes_by_subsystem.setdefault(n["subsystem_id"], []).append(node_data)

    results = []
    for sub in subsystems_rows:
        results.append({
            "id": sub["id"],
            "name": sub["name"],
            "system_index": sub["system_index"],
            "kks_prefix": sub["kks_prefix"],
            "description": sub["description"],
            "nodes": nodes_by_subsystem.get(sub["id"], [])
        })

    return {
        "total_nodes": len(all_nodes_list),
        "subsystems": results,
        "flat_nodes": all_nodes_list
    }

@app.get("/api/device/{device_id}")
def get_device_detail(device_id: str):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM equipment_nodes WHERE id = ?", (device_id,))
    node = cursor.fetchone()
    if not node:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

    cursor.execute("SELECT * FROM live_sensors WHERE node_id = ?", (device_id,))
    sensors = cursor.fetchall()
    conn.close()

    live = hydro_engine.get_telemetry_snapshot()

    # Dynamic sensor updates based on physics
    sensor_list = []
    for s in sensors:
        s_val = s["value"]
        # Add micro live variation
        if "Pressure" in s["sensor_name"]:
            s_val = live["penstock_pressure_bar"] if "Penstock" in s["sensor_name"] else live["spiral_case_pressure_bar"]
        elif "Flow" in s["sensor_name"] or "FT" in s["sensor_kks"]:
            s_val = live["flow_rate_m3s"]
        elif "Speed" in s["sensor_name"] or "ST01" in s["sensor_kks"]:
            s_val = live["runner_rpm"]
        elif "Active Power" in s["sensor_name"] or "MW" in s["sensor_kks"]:
            s_val = live["net_generation_mw"]
        elif "Frequency" in s["sensor_name"] or "HZ01" in s["sensor_kks"]:
            s_val = live["grid_frequency_hz"]
        elif "Opening" in s["sensor_name"] or "Gate" in s["sensor_name"]:
            s_val = live["wicket_gate_actual_pct"]
        elif "Elevation" in s["sensor_name"] and "Surge" in s["sensor_name"]:
            s_val = live["surge_tank_level_m"]

        sensor_list.append({
            "id": s["id"],
            "sensor_name": s["sensor_name"],
            "sensor_kks": s["sensor_kks"],
            "value": round(float(s_val), 2),
            "unit": s["unit"],
            "min_limit": s["min_limit"],
            "max_limit": s["max_limit"],
            "status": s["status"]
        })

    # Digital twin simulation micro-view spec
    sim_spec = {
        "component_type": node["node_type"],
        "title": f"Component Digital Twin Simulation - {node['name']}",
        "kks": node["kks_tag"],
        "operating_envelope": "OPTIMAL - Within Class 1 Hydro Enclosure",
        "primary_readout": {
            "label": node["primary_metric_name"],
            "value": sensor_list[0]["value"] if sensor_list else node["primary_metric_value"],
            "unit": node["primary_metric_unit"],
            "envelope_status": "Operating within safe design envelope (IEC 60041)"
        }
    }

    return {
        "node": dict(node),
        "simulation_spec": sim_spec,
        "sensors": sensor_list
    }

@app.get("/api/telemetry/history")
def get_telemetry_history():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT timestamp, net_generation_mw, hydraulic_head_m, flow_rate_m3s,
               turbine_efficiency_pct, runner_rpm, wicket_gate_opening_pct,
               spiral_case_pressure_bar, penstock_pressure_bar, surge_tank_level_m
        FROM telemetry_history
        ORDER BY id ASC
        LIMIT 60
    """)
    rows = cursor.fetchall()
    conn.close()

    return {
        "count": len(rows),
        "history": [dict(r) for r in rows]
    }

@app.get("/api/alarms")
def get_alarms():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alarms ORDER BY id DESC LIMIT 20")
    rows = cursor.fetchall()
    conn.close()
    return {"alarms": [dict(r) for r in rows]}

# Control Setpoints
class WicketGateCommand(BaseModel):
    opening_pct: float

@app.post("/api/control/wicket-gate")
def set_wicket_gate(cmd: WicketGateCommand):
    hydro_engine.set_wicket_gate(cmd.opening_pct)
    return {
        "success": True,
        "message": f"Wicket gate setpoint updated to {cmd.opening_pct}%",
        "telemetry": hydro_engine.get_telemetry_snapshot()
    }

class SpeedCommand(BaseModel):
    multiplier: float

@app.post("/api/control/speed")
def set_simulation_speed(cmd: SpeedCommand):
    hydro_engine.set_simulation_speed(cmd.multiplier)
    return {
        "success": True,
        "multiplier": cmd.multiplier,
        "is_paused": hydro_engine.is_paused,
        "message": f"Simulation speed updated to {cmd.multiplier}x"
    }

@app.post("/api/control/trip")
def trip_plant():
    hydro_engine.trip_plant()
    return {
        "success": True,
        "message": "EMERGENCY TRIP INITIATED: Wicket gates closing fast, load rejected.",
        "telemetry": hydro_engine.get_telemetry_snapshot()
    }

@app.post("/api/control/reset")
def reset_plant():
    hydro_engine.reset_nominal()
    return {
        "success": True,
        "message": "Plant operational state restored to 100% nominal dispatch.",
        "telemetry": hydro_engine.get_telemetry_snapshot()
    }

# Copilot AI Chat
class CopilotQuery(BaseModel):
    query: str

@app.post("/api/copilot/chat")
def copilot_chat(payload: CopilotQuery):
    telemetry = hydro_engine.get_telemetry_snapshot()
    response = copilot_service.process_query(payload.query, telemetry)
    return response

# WebSocket
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    # Immediately send initial state
    try:
        await websocket.send_text(json.dumps(hydro_engine.get_telemetry_snapshot()))
        while True:
            data = await websocket.receive_text()
            # client can send commands like ping
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
