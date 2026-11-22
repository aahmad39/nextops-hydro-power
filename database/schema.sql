-- NextOps Industrial SCADA Database Schema
-- Hydroelectric Power Generation Digital Twin
-- Unit 2 - 250 MW Francis Turbogenerator Station

CREATE TABLE IF NOT EXISTS plant_metadata (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plant_type TEXT NOT NULL DEFAULT 'Hydroelectric Storage & Run-of-River',
    unit_id TEXT NOT NULL DEFAULT 'Unit 2',
    installed_capacity_mw REAL NOT NULL DEFAULT 250.0,
    design_head_m REAL NOT NULL DEFAULT 142.5,
    design_flow_m3s REAL NOT NULL DEFAULT 195.4,
    turbine_type TEXT NOT NULL DEFAULT 'Vertical Francis Runner',
    generator_rating_mva REAL NOT NULL DEFAULT 280.0,
    grid_frequency_hz REAL NOT NULL DEFAULT 50.0,
    river_basin TEXT NOT NULL DEFAULT 'Himalayan High Basin / Alaknanda Catchment',
    commission_year INTEGER NOT NULL DEFAULT 2024,
    scada_status TEXT NOT NULL DEFAULT 'Active Synchronized'
);

CREATE TABLE IF NOT EXISTS plant_subsystems (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    system_index INTEGER NOT NULL,
    kks_prefix TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS equipment_nodes (
    id TEXT PRIMARY KEY,
    subsystem_id TEXT NOT NULL,
    name TEXT NOT NULL,
    kks_tag TEXT NOT NULL,
    short_kks TEXT NOT NULL,
    node_type TEXT NOT NULL,
    category TEXT NOT NULL,
    primary_metric_name TEXT NOT NULL,
    primary_metric_value REAL NOT NULL,
    primary_metric_unit TEXT NOT NULL,
    nominal_min REAL,
    nominal_max REAL,
    status TEXT NOT NULL DEFAULT 'OPTIMAL', -- OPTIMAL, ADVISORY, WARNING, CRITICAL
    status_message TEXT,
    cycle_group TEXT NOT NULL, -- Hydraulic Flow Loop, Turbogenerator, Substation & Grid, Tailrace & Reservoir
    schematic_x REAL NOT NULL,
    schematic_y REAL NOT NULL,
    FOREIGN KEY (subsystem_id) REFERENCES plant_subsystems(id)
);

CREATE TABLE IF NOT EXISTS telemetry_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    net_generation_mw REAL NOT NULL,
    hydraulic_head_m REAL NOT NULL,
    flow_rate_m3s REAL NOT NULL,
    turbine_efficiency_pct REAL NOT NULL,
    runner_rpm REAL NOT NULL,
    wicket_gate_opening_pct REAL NOT NULL,
    spiral_case_pressure_bar REAL NOT NULL,
    penstock_pressure_bar REAL NOT NULL,
    surge_tank_level_m REAL NOT NULL,
    reservoir_level_m REAL NOT NULL,
    grid_frequency_hz REAL NOT NULL,
    generator_voltage_kv REAL NOT NULL,
    transformer_temp_c REAL NOT NULL,
    bearing_vibration_mms REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS live_sensors (
    id TEXT PRIMARY KEY,
    node_id TEXT NOT NULL,
    sensor_name TEXT NOT NULL,
    sensor_kks TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    min_limit REAL,
    max_limit REAL,
    status TEXT DEFAULT 'NORMAL',
    FOREIGN KEY (node_id) REFERENCES equipment_nodes(id)
);

CREATE TABLE IF NOT EXISTS alarms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL,
    kks_tag TEXT NOT NULL,
    severity TEXT NOT NULL, -- INFO, ADVISORY, WARNING, CRITICAL
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT 0,
    resolved BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS copilot_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    sender TEXT NOT NULL, -- user, copilot
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    plant_context_snapshot TEXT
);

