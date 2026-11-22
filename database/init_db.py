"""
NextOps SCADA - Hydro Power Plant Database Initializer & Seeder
Supports SQLite (hydro_scada.db) or PostgreSQL via DATABASE_URL
"""
import sqlite3
import os
import random
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "hydro_scada.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def init_database():
    print(f"[DB] Initializing Hydro SCADA Database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Read and execute schema
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        cursor.executescript(f.read())

    # Insert Plant Metadata
    cursor.execute("DELETE FROM plant_metadata")
    cursor.execute("""
        INSERT INTO plant_metadata (
            id, name, plant_type, unit_id, installed_capacity_mw, design_head_m,
            design_flow_m3s, turbine_type, generator_rating_mva, grid_frequency_hz,
            river_basin, commission_year, scada_status
        ) VALUES (
            'HP-UNIT-2', 'NextOps Hydro Basin', 'High-Head Storage & Run-of-River',
            'Unit 2', 250.0, 142.5, 195.4, 'Vertical Francis Turbogenerator',
            280.0, 50.00, 'Alaknanda High Basin - Cascade Section', 2024,
            'Unit 2 • 250 MW Francis SCADA Active'
        )
    """)

    # Insert Subsystems
    subsystems = [
        ("sub-1", "1. WATER INTAKE & RESERVOIR", 1, "10HA", "Upper reservoir catchment, intake gates, trash racks, and desilting basins."),
        ("sub-2", "2. PENSTOCK & SURGE TANK", 2, "10HB", "Steel-lined pressure tunnel, differential surge tank, and spherical main inlet valves."),
        ("sub-3", "3. HYDRO TURBOGENERATOR", 3, "10HC", "Vertical Francis runner, spiral casing volute, wicket gates, and digital speed governor."),
        ("sub-4", "4. GENERATOR & EXCITATION", 4, "10HD", "16-pole 3-phase synchronous hydro generator, brushless excitation, and AVR."),
        ("sub-5", "5. DRAFT TUBE & TAILRACE", 5, "10HE", "Hydraulic diffuser draft tube, downstream tailrace canal, and environmental monitoring."),
        ("sub-6", "6. STEP-UP SUBSTATION & GRID", 6, "10HF", "11kV/400kV generator step-up transformers, SF6 switchgear, and national grid interconnect.")
    ]

    cursor.execute("DELETE FROM plant_subsystems")
    cursor.executemany("INSERT INTO plant_subsystems VALUES (?, ?, ?, ?, ?)", subsystems)

    # Insert Equipment Nodes (18 Nodes)
    nodes = [
        # (id, subsystem_id, name, kks_tag, short_kks, node_type, category, metric_name, metric_val, unit, min_lim, max_lim, status, status_msg, cycle_group, x, y)
        (
            "RESERVOIR-01", "sub-1", "Upper Reservoir & Gravity Dam", "10HAA01", "10HAA01",
            "Reservoir", "WATER INTAKE", "Water Level Elevation", 584.2, "m ASL",
            550.0, 590.0, "OPTIMAL", "Normal high water level - storage at 92.4% capacity",
            "Tailrace & Reservoir", 120, 310
        ),
        (
            "INTAKE-GATE-01", "sub-1", "Intake Trash Rack & Sluice Gate", "10HAB01", "10HAB01",
            "Intake Gate", "WATER INTAKE", "Intake Gate Position", 100.0, "% Open",
            90.0, 100.0, "OPTIMAL", "Trash rack differential head within safe 0.12 m envelope",
            "Hydraulic Flow Loop", 175, 335
        ),
        (
            "DESILTER-01", "sub-1", "Underground Desilting Basin", "10HAC01", "10HAC01",
            "Desilting", "WATER INTAKE", "Suspended Silt Concentration", 0.08, "g/L",
            0.0, 0.25, "OPTIMAL", "Continuous flushing active - Quartz particle PPM < 75",
            "Hydraulic Flow Loop", 220, 355
        ),
        (
            "PENSTOCK-01", "sub-1", "High-Pressure Steel Penstock", "10HBA01", "10HBA01",
            "Penstock", "PRESSURE TUNNEL", "Penstock Static & Dyn Pressure", 14.2, "bar",
            12.0, 16.5, "OPTIMAL", "Velocity 4.2 m/s, acoustic flowmeter synced",
            "Hydraulic Flow Loop", 310, 420
        ),
        (
            "SURGE-TANK-01", "sub-2", "Differential Surge Chamber", "10HBB01", "10HBB01",
            "Surge Tank", "PRESSURE TUNNEL", "Surge Water Column Elevation", 578.6, "m",
            560.0, 595.0, "OPTIMAL", "Mass oscillation damped; water hammer pressure absorbed",
            "Hydraulic Flow Loop", 270, 260
        ),
        (
            "MIV-VALVE-01", "sub-2", "Main Inlet Spherical Valve (MIV)", "10HBC01", "10HBC01",
            "Main Valve", "PRESSURE TUNNEL", "Spherical Seal Integrity", 100.0, "% Open",
            98.0, 100.0, "OPTIMAL", "Counterweight locked, bypass equalized, seals tight",
            "Hydraulic Flow Loop", 375, 480
        ),
        (
            "SPIRAL-CASE-01", "sub-3", "Turbine Spiral Casing (Volute)", "10HCA01", "10HCA01",
            "Spiral Case", "TURBINE", "Inlet Volute Static Pressure", 13.9, "bar",
            11.5, 15.0, "OPTIMAL", "Circumferential velocity distribution balanced",
            "Turbogenerator", 440, 500
        ),
        (
            "WICKET-GATES-01", "sub-3", "Guide Vanes (Wicket Gates)", "10HCB01", "10HCB01",
            "Wicket Gates", "TURBINE", "Guide Vane Servomotor Stroke", 82.4, "% Open",
            0.0, 100.0, "OPTIMAL", "Digital governor modulating for 50.00 Hz grid frequency",
            "Turbogenerator", 480, 485
        ),
        (
            "FRANCIS-RUNNER-01", "sub-3", "Francis Hydro Runner (13-Blade)", "10HCC01", "10HCC01",
            "Turbine Runner", "TURBINE", "Runner Rotational Speed", 375.0, "RPM",
            374.0, 376.0, "OPTIMAL", "Cavitation inception index sigma = 0.118 (safe)",
            "Turbogenerator", 530, 490
        ),
        (
            "BEARINGS-01", "sub-3", "Turbine & Generator Thrust Bearings", "10HCD01", "10HCD01",
            "Bearings", "TURBINE", "Thrust Bearing Metal Temp", 44.8, "°C",
            30.0, 65.0, "OPTIMAL", "Babbitt metal temp nominal, oil wedge film 48 um",
            "Turbogenerator", 530, 440
        ),
        (
            "GOVERNOR-01", "sub-3", "Digital Electro-Hydraulic Governor", "10HCE01", "10HCE01",
            "Governor", "TURBINE", "Frequency Droop Setting", 4.0, "% Droop",
            2.0, 6.0, "OPTIMAL", "Primary frequency response active (PFR ±5%)",
            "Turbogenerator", 530, 400
        ),
        (
            "GENERATOR-01", "sub-4", "Synchronous Hydro Generator", "10HDA01", "10HDA01",
            "Generator", "GENERATOR", "Active Electric Power Output", 250.0, "MW",
            0.0, 260.0, "OPTIMAL", "Power factor 0.95 lag, reactive reserve +42 MVAR",
            "Turbogenerator", 600, 430
        ),
        (
            "AVR-EXCITER-01", "sub-4", "Static Excitation & AVR System", "10HDB01", "10HDB01",
            "Excitation", "GENERATOR", "Terminal Voltage Sync", 11.0, "kV",
            10.45, 11.55, "OPTIMAL", "Thyristor bridge active, field current 1,420 A DC",
            "Turbogenerator", 610, 380
        ),
        (
            "STATOR-COOL-01", "sub-4", "Generator Closed Air/Water Cooling", "10HDC01", "10HDC01",
            "Cooling", "GENERATOR", "Stator Winding Core Temp", 52.3, "°C",
            35.0, 80.0, "OPTIMAL", "Closed water circuits: heat exchangers delta-T 4.2°C",
            "Turbogenerator", 620, 470
        ),
        (
            "DRAFT-TUBE-01", "sub-5", "Hydraulic Elbow Draft Tube", "10HEA01", "10HEA01",
            "Draft Tube", "TAILRACE", "Draft Tube Cone Pressure", -0.15, "bar",
            -0.35, 0.1, "OPTIMAL", "Diffuser recovery factor Cp = 0.82; vortex core aerated",
            "Tailrace & Reservoir", 500, 570
        ),
        (
            "TAILRACE-01", "sub-5", "Tailrace Discharge Channel", "10HEB01", "10HEB01",
            "Tailrace", "TAILRACE", "Total Discharged Water Flow", 195.4, "m³/s",
            150.0, 220.0, "OPTIMAL", "River return stage 412.3 m ASL, zero turbulence surging",
            "Tailrace & Reservoir", 360, 590
        ),
        (
            "ENV-MONITOR-01", "sub-5", "Eco-Hydrology & Water Quality", "10HEC01", "10HEC01",
            "Eco Monitor", "TAILRACE", "Dissolved Oxygen (DO)", 8.4, "mg/L",
            6.5, 12.0, "OPTIMAL", "Water temp 14.2°C; environmental minimum flow compliant",
            "Tailrace & Reservoir", 260, 590
        ),
        (
            "TRANSFORMER-01", "sub-6", "Generator Step-Up Transformer (GSU)", "10HFA01", "10HFA01",
            "Transformer", "SUBSTATION & GRID", "Secondary Line Voltage", 400.0, "kV",
            380.0, 420.0, "OPTIMAL", "Rating 300 MVA, oil top temp 56.4°C, DGA gases normal",
            "Substation & Grid", 710, 480
        ),
        (
            "TRANSMISSION-01", "sub-6", "400 kV Switchyard & Power Grid", "10HFC01", "10HFC01",
            "Grid Lines", "SUBSTATION & GRID", "Grid Intertie Frequency", 50.00, "Hz",
            49.85, 50.15, "OPTIMAL", "Phase angle 12.4°, synced with Regional Load Despatch",
            "Substation & Grid", 840, 430
        )
    ]

    cursor.execute("DELETE FROM equipment_nodes")
    cursor.executemany("""
        INSERT INTO equipment_nodes (
            id, subsystem_id, name, kks_tag, short_kks, node_type, category,
            primary_metric_name, primary_metric_value, primary_metric_unit,
            nominal_min, nominal_max, status, status_message, cycle_group,
            schematic_x, schematic_y
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, nodes)

    # Insert Live Sensors (6 sensors for each equipment node for the right drawer panel)
    sensor_templates = {
        "RESERVOIR-01": [
            ("Reservoir Water Elevation", "10HAA01-LT01", 584.2, "m ASL", 550.0, 590.0),
            ("Active Storage Volume", "10HAA01-VOL", 142.8, "M m³", 80.0, 160.0),
            ("Inflow Catchment Rate", "10HAA01-FT01", 204.5, "m³/s", 100.0, 350.0),
            ("Spillway Radial Gate Status", "10HAA01-POS", 0.0, "% Open", 0.0, 100.0),
            ("Water Temp at Intake Depth", "10HAA01-TT01", 11.8, "°C", 5.0, 20.0),
            ("Dam Seepage Piezometer", "10HAA01-PZ01", 1.4, "L/min", 0.0, 5.0),
        ],
        "PENSTOCK-01": [
            ("Static + Dynamic Head Pressure", "10HBA01-PT01", 14.2, "bar", 10.0, 18.0),
            ("Acoustic Penstock Flow Velocity", "10HBA01-FT01", 4.22, "m/s", 2.0, 6.0),
            ("Penstock Outer Shell Temp", "10HBA01-TT01", 12.4, "°C", 0.0, 35.0),
            ("Expansion Joint Axial Shift", "10HBA01-DT01", 4.2, "mm", -10.0, 10.0),
            ("Water Hammer Acoustic Transient", "10HBA01-VT01", 0.02, "bar/s", -1.0, 1.0),
            ("Penstock Discharge Mass", "10HBA01-MT01", 195.4, "t/s", 100.0, 240.0),
        ],
        "SURGE-TANK-01": [
            ("Surge Water Column Elevation", "10HBB01-LT01", 578.6, "m", 560.0, 595.0),
            ("Chamber Air Pressure", "10HBB01-PT01", 1.02, "bar", 0.9, 1.3),
            ("Surge Orifice Flow Rate", "10HBB01-FT01", 12.4, "m³/s", -40.0, 40.0),
            ("Oscillation Damping Rate", "10HBB01-ZT01", 99.4, "%", 90.0, 100.0),
            ("Internal Water Temperature", "10HBB01-TT01", 12.1, "°C", 4.0, 25.0),
            ("Structural Strain Gauge", "10HBB01-ST01", 124.0, "ue", 0.0, 350.0),
        ],
        "MIV-VALVE-01": [
            ("Spherical Plug Stroke", "10HBC01-POS", 100.0, "% Open", 98.0, 100.0),
            ("Upstream Pipe Pressure", "10HBC01-PT01", 14.2, "bar", 11.0, 17.0),
            ("Downstream Casing Pressure", "10HBC01-PT02", 14.1, "bar", 11.0, 17.0),
            ("Bypass Valve Differential Pressure", "10HBC01-DPT", 0.08, "bar", 0.0, 0.5),
            ("Hydraulic Actuator Oil Pressure", "10HBC01-OPT", 148.0, "bar", 130.0, 170.0),
            ("Counterweight Safety Latch", "10HBC01-Z01", 1.0, "LOCKED", 1.0, 1.0),
        ],
        "SPIRAL-CASE-01": [
            ("Spiral Casing Volute Pressure", "10HCA01-PT01", 13.9, "bar", 11.0, 16.5),
            ("Circumferential Velocity Head", "10HCA01-VT01", 7.8, "m/s", 4.0, 10.0),
            ("Inlet Manifold Water Temp", "10HCA01-TT01", 13.6, "°C", 5.0, 22.0),
            ("Stay Vane Static Stress", "10HCA01-ST01", 86.4, "MPa", 0.0, 160.0),
            ("Drain Valve Seal Status", "10HCA01-ZS01", 100.0, "% Closed", 100.0, 100.0),
            ("Air Release Valve Pressure", "10HCA01-AV01", 0.0, "bar", -0.2, 0.5),
        ],
        "WICKET-GATES-01": [
            ("Guide Vane Opening Angle", "10HCB01-POS", 82.4, "%", 0.0, 100.0),
            ("Regulating Ring Servomotor Stroke", "10HCB01-LT01", 284.0, "mm", 0.0, 350.0),
            ("Hydraulic Governor Oil Pressure", "10HCB01-OPT", 145.2, "bar", 130.0, 165.0),
            ("Shear Pin Failure Detection", "10HCB01-SP01", 0.0, "ALARM", 0.0, 0.0),
            ("Wicket Gate Clearance Leakage", "10HCB01-LKG", 0.04, "L/s", 0.0, 0.5),
            ("Operating Torque Load", "10HCB01-TQ01", 18.6, "kN·m", 0.0, 35.0),
        ],
        "FRANCIS-RUNNER-01": [
            ("Runner Synchronous Speed", "10HCC01-ST01", 375.0, "RPM", 374.0, 376.0),
            ("Mechanical Shaft Power", "10HCC01-PW01", 256.4, "MW", 0.0, 270.0),
            ("Francis Hydraulic Efficiency", "10HCC01-ETA", 93.8, "%", 85.0, 96.0),
            ("Runner Radial Vibration (Peak)", "10HCC01-VT01", 1.24, "mm/s", 0.0, 4.5),
            ("Cavitation Inception Sigma", "10HCC01-SIG", 0.118, "index", 0.08, 0.30),
            ("Hydraulic Thrust Force", "10HCC01-TF01", 420.0, "kN", 200.0, 600.0),
        ],
        "BEARINGS-01": [
            ("Thrust Bearing Pad Temp (Max)", "10HCD01-TT01", 44.8, "°C", 30.0, 65.0),
            ("Upper Guide Bearing Temp", "10HCD01-TT02", 42.1, "°C", 30.0, 65.0),
            ("Lower Turbine Guide Bearing Temp", "10HCD01-TT03", 46.3, "°C", 30.0, 65.0),
            ("Lubricating Oil Flow Rate", "10HCD01-FT01", 68.0, "L/min", 50.0, 90.0),
            ("Oil Sump Oil Level", "10HCD01-LT01", 78.4, "%", 60.0, 95.0),
            ("Shaft Runout Orbital Eccentricity", "10HCD01-XT01", 32.0, "um", 0.0, 90.0),
        ],
        "GOVERNOR-01": [
            ("Grid Frequency Track", "10HCE01-HZ01", 50.00, "Hz", 49.85, 50.15),
            ("Speed Droop Characteristic", "10HCE01-DP01", 4.0, "%", 2.0, 6.0),
            ("Governor Mode Selection", "10HCE01-MD01", 1.0, "AUTO-DROOP", 1.0, 1.0),
            ("PID Controller Error Signal", "10HCE01-ER01", 0.002, "%", -0.5, 0.5),
            ("Emergency Trip Solenoid", "10HCE01-TR01", 0.0, "ARMED", 0.0, 0.0),
            ("Servomotor Actuation Velocity", "10HCE01-VT01", 12.4, "mm/s", 0.0, 50.0),
        ],
        "GENERATOR-01": [
            ("Generator Active Power", "10HDA01-MW01", 250.0, "MW", 0.0, 260.0),
            ("Generator Reactive Power", "10HDA01-MVR", 42.0, "MVAR", -50.0, 90.0),
            ("Stator Phase Current", "10HDA01-IA01", 13.8, "kA", 0.0, 15.5),
            ("Power Factor (cos phi)", "10HDA01-PF01", 0.95, "lag", 0.85, 1.0),
            ("Generator Core Temp", "10HDA01-TT01", 62.4, "°C", 30.0, 95.0),
            ("Rotor Earth Fault Leakage", "10HDA01-RF01", 0.0, "mA", 0.0, 10.0),
        ],
        "AVR-EXCITER-01": [
            ("Generator Terminal Voltage", "10HDB01-VT01", 11.0, "kV", 10.45, 11.55),
            ("Rotor Excitation DC Current", "10HDB01-IDC", 1420.0, "A", 400.0, 1800.0),
            ("Exciter Field DC Voltage", "10HDB01-VDC", 168.0, "V", 50.0, 240.0),
            ("AVR Voltage Reference Setpoint", "10HDB01-REF", 1.00, "p.u.", 0.95, 1.05),
            ("Power System Stabilizer (PSS)", "10HDB01-PSS", 1.0, "ACTIVE", 1.0, 1.0),
            ("Thyristor Bridge Heat Sink Temp", "10HDB01-TT01", 48.6, "°C", 25.0, 75.0),
        ],
        "STATOR-COOL-01": [
            ("Stator Winding Highest Temp", "10HDC01-TT01", 52.3, "°C", 35.0, 85.0),
            ("Cooling Air Inlet Temp", "10HDC01-TT02", 24.2, "°C", 15.0, 35.0),
            ("Cooling Air Outlet Temp", "10HDC01-TT03", 38.6, "°C", 25.0, 50.0),
            ("Cooling Water Flow Rate", "10HDC01-FT01", 450.0, "m³/h", 350.0, 600.0),
            ("Dew Point Condensation Safety", "10HDC01-DP01", 14.8, "°C", 0.0, 20.0),
            ("Cooler Water Differential Pressure", "10HDC01-DPT", 0.45, "bar", 0.2, 0.8),
        ],
        "DRAFT-TUBE-01": [
            ("Draft Tube Elbow Pressure", "10HEA01-PT01", -0.15, "bar", -0.35, 0.1),
            ("Water Outlet Flow Velocity", "10HEA01-VT01", 2.15, "m/s", 1.0, 4.0),
            ("Draft Tube Wall Pressure Pulsation", "10HEA01-PST", 0.035, "bar", 0.0, 0.15),
            ("Aeration Snifting Valve Status", "10HEA01-AV01", 0.0, "% Open", 0.0, 100.0),
            ("Tailwater Backpressure Head", "10HEA01-LT01", 4.2, "m", 2.0, 7.0),
            ("Vortex Core Helical Frequency", "10HEA01-FRQ", 1.85, "Hz", 0.0, 5.0),
        ],
        "TAILRACE-01": [
            ("Total Station Discharge Flow", "10HEB01-FT01", 195.4, "m³/s", 140.0, 225.0),
            ("Tailrace Water Surface Stage", "10HEB01-LT01", 412.3, "m ASL", 408.0, 416.0),
            ("Discharge Channel Flow Velocity", "10HEB01-VT01", 1.84, "m/s", 0.8, 3.5),
            ("Tailrace Gate Position", "10HEB01-POS", 100.0, "% Open", 90.0, 100.0),
            ("Turbulence Kinetic Energy", "10HEB01-TKE", 0.14, "m²/s²", 0.0, 0.5),
            ("Downstream River Gauge Stage", "10HEB01-RIV", 411.8, "m ASL", 407.0, 415.0),
        ],
        "ENV-MONITOR-01": [
            ("Dissolved Oxygen Content (DO)", "10HEC01-DO01", 8.4, "mg/L", 6.5, 12.0),
            ("Tailrace Water Temperature", "10HEC01-TT01", 14.2, "°C", 6.0, 22.0),
            ("Water Turbidity Level", "10HEC01-TUR", 12.4, "NTU", 0.0, 50.0),
            ("pH Index of Discharged River", "10HEC01-PH01", 7.6, "pH", 6.5, 8.5),
            ("Fish Passage Auxiliary Flow", "10HEC01-FSH", 12.0, "m³/s", 8.0, 20.0),
            ("Nitrate & Environmental Index", "10HEC01-NIT", 1.2, "mg/L", 0.0, 5.0),
        ],
        "TRANSFORMER-01": [
            ("Secondary Grid Line Voltage", "10HFA01-VT01", 400.0, "kV", 380.0, 420.0),
            ("Transformer Apparent Power", "10HFA01-MVA", 263.2, "MVA", 0.0, 300.0),
            ("Top Oil Temperature", "10HFA01-TT01", 56.4, "°C", 30.0, 85.0),
            ("Winding Hotspot Temperature", "10HFA01-TT02", 68.2, "°C", 35.0, 105.0),
            ("Buchholz Relay Gas Accumulation", "10HFA01-RL01", 0.0, "NORMAL", 0.0, 0.0),
            ("On-Load Tap Changer Step (OLTC)", "10HFA01-TAP", 7.0, "STEP", 1.0, 17.0),
        ],
        "TRANSMISSION-01": [
            ("Grid Intertie Frequency", "10HFC01-HZ01", 50.00, "Hz", 49.85, 50.15),
            ("Transmission Active Export", "10HFC01-MW01", 248.8, "MW", 0.0, 260.0),
            ("Transmission Reactive Exchange", "10HFC01-MVR", 38.4, "MVAR", -50.0, 90.0),
            ("Line Phase Angle Difference", "10HFC01-ANG", 12.4, "deg", -30.0, 30.0),
            ("Line Surge Arrester Discharge", "10HFC01-ARR", 0.0, "kA", 0.0, 10.0),
            ("Synchrocheck Relay Status", "10HFC01-SYNC", 1.0, "PERMIT", 1.0, 1.0),
        ]
    }

    cursor.execute("DELETE FROM live_sensors")
    sensor_rows = []
    sensor_id_seq = 1
    for node_id, sensors in sensor_templates.items():
        for s_name, s_kks, s_val, s_unit, s_min, s_max in sensors:
            sensor_rows.append((
                f"SENS-{sensor_id_seq:04d}", node_id, s_name, s_kks, s_val, s_unit, s_min, s_max, "NORMAL"
            ))
            sensor_id_seq += 1

    cursor.executemany("""
        INSERT INTO live_sensors (id, node_id, sensor_name, sensor_kks, value, unit, min_limit, max_limit, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sensor_rows)

    # Insert Historical Telemetry (Past 60 minutes, 1 sample every minute)
    cursor.execute("DELETE FROM telemetry_history")
    history_rows = []
    now = datetime.now()
    base_flow = 195.4
    base_head = 142.5

    for m in range(60, -1, -1):
        ts = (now - timedelta(minutes=m)).strftime("%Y-%m-%d %H:%M:%S")
        # realistic minor fluctuations
        variation = (random.random() - 0.5) * 1.5
        flow = round(base_flow + variation * 0.8, 2)
        head = round(base_head + (random.random() - 0.5) * 0.4, 2)
        gate = round(82.4 + (random.random() - 0.5) * 0.6, 1)
        rpm = round(375.0 + (random.random() - 0.5) * 0.15, 2)
        mw = round(250.0 + (random.random() - 0.5) * 2.2, 1)
        eff = round(93.8 + (random.random() - 0.5) * 0.3, 2)
        spiral_p = round(13.9 + (random.random() - 0.5) * 0.1, 2)
        pen_p = round(14.2 + (random.random() - 0.5) * 0.1, 2)
        surge_lvl = round(578.6 + (random.random() - 0.5) * 0.25, 2)
        res_lvl = round(584.2 - (60 - m) * 0.001, 2)
        hz = round(50.00 + (random.random() - 0.5) * 0.04, 2)
        kv = round(11.0 + (random.random() - 0.5) * 0.05, 2)
        t_temp = round(56.4 + (random.random() - 0.5) * 0.4, 1)
        vib = round(1.24 + (random.random() - 0.5) * 0.08, 2)

        history_rows.append((
            ts, mw, head, flow, eff, rpm, gate, spiral_p, pen_p, surge_lvl,
            res_lvl, hz, kv, t_temp, vib
        ))

    cursor.executemany("""
        INSERT INTO telemetry_history (
            timestamp, net_generation_mw, hydraulic_head_m, flow_rate_m3s, turbine_efficiency_pct,
            runner_rpm, wicket_gate_opening_pct, spiral_case_pressure_bar, penstock_pressure_bar,
            surge_tank_level_m, reservoir_level_m, grid_frequency_hz, generator_voltage_kv,
            transformer_temp_c, bearing_vibration_mms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, history_rows)

    # Insert sample alarms
    cursor.execute("DELETE FROM alarms")
    cursor.execute("""
        INSERT INTO alarms (node_id, kks_tag, severity, message, timestamp, acknowledged, resolved)
        VALUES 
        ('INTAKE-GATE-01', '10HAB01', 'INFO', 'Trash rack automated rake cycle completed successfully', datetime('now', '-25 minutes'), 1, 1),
        ('SURGE-TANK-01', '10HBB01', 'ADVISORY', 'Differential surge level within dampening zone - 578.6 m', datetime('now', '-8 minutes'), 1, 0),
        ('FRANCIS-RUNNER-01', '10HCC01', 'INFO', 'Runner synchronization locked at 375.0 RPM - 50.00 Hz', datetime('now', '-2 minutes'), 1, 0)
    """)

    conn.commit()
    conn.close()
    print("[DB] Hydro SCADA database initialization completed with 18 equipment nodes, 102 active sensors, and 60m history!")

if __name__ == "__main__":
    init_database()

