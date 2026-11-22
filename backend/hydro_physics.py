"""
NextOps SCADA - High-Fidelity Hydroelectric Physics & Telemetry Engine
Simulates fluid dynamics, water hammer in penstock, surge chamber damping,
Francis turbine runner efficiency, synchronous generation, and electrical grid sync.
"""
import math
import random
import time

class HydroPhysicsEngine:
    def __init__(self):
        # Design Constants
        self.rated_power_mw = 250.0
        self.rated_head_m = 142.5
        self.rated_flow_m3s = 195.4
        self.synchronous_rpm = 375.0  # 16-pole 50 Hz machine
        self.generator_efficiency = 0.985
        self.transformer_efficiency = 0.992
        self.rho = 1000.0  # kg/m^3 (water density)
        self.g = 9.80665   # m/s^2

        # Operational State
        self.is_tripped = False
        self.flow_multiplier = 1.0
        self.is_paused = False

        # Physical state variables
        self.reservoir_elevation_m = 584.20
        self.tailrace_elevation_m = 412.30
        self.wicket_gate_target_pct = 82.4
        self.wicket_gate_actual_pct = 82.4
        self.gate_servo_speed = 3.5  # % per second maximum servo slew rate

        # Penstock & Surge Tank dynamics
        self.surge_tank_level = 578.60
        self.surge_velocity = 0.0
        self.penstock_flow_m3s = 195.4
        self.spiral_case_pressure_bar = 13.90
        self.penstock_pressure_bar = 14.20

        # Turbine Runner
        self.runner_rpm = 375.0
        self.turbine_efficiency_pct = 93.85
        self.cavitation_sigma = 0.118
        self.bearing_temp_c = 44.8
        self.vibration_mms = 1.24

        # Electrical Generation & Grid
        self.net_generation_mw = 250.0
        self.reactive_power_mvar = 42.0
        self.terminal_voltage_kv = 11.00
        self.grid_frequency_hz = 50.00
        self.transformer_voltage_kv = 400.0
        self.transformer_temp_c = 56.4
        self.unit_health_pct = 99.9

        self.last_tick_time = time.time()

    def set_wicket_gate(self, opening_pct: float):
        self.wicket_gate_target_pct = max(0.0, min(100.0, float(opening_pct)))
        if self.is_tripped and self.wicket_gate_target_pct > 0.0:
            self.is_tripped = False

    def set_simulation_speed(self, multiplier: float):
        if multiplier <= 0.0:
            self.is_paused = True
        else:
            self.is_paused = False
            self.flow_multiplier = max(0.2, min(5.0, float(multiplier)))

    def trip_plant(self):
        """Simulate emergency turbine trip / load rejection"""
        self.is_tripped = True
        self.wicket_gate_target_pct = 0.0
        self.unit_health_pct = 72.0

    def reset_nominal(self):
        """Restore nominal 100% capacity operating conditions"""
        self.is_tripped = False
        self.wicket_gate_target_pct = 82.4
        self.flow_multiplier = 1.0
        self.is_paused = False
        self.unit_health_pct = 99.9

    def tick(self, dt: float = 1.0):
        if self.is_paused:
            return self.get_telemetry_snapshot()

        effective_dt = dt * self.flow_multiplier

        # 1. Wicket gate servomotor slewing
        gate_diff = self.wicket_gate_target_pct - self.wicket_gate_actual_pct
        max_step = self.gate_servo_speed * effective_dt
        if abs(gate_diff) <= max_step:
            self.wicket_gate_actual_pct = self.wicket_gate_target_pct
        else:
            self.wicket_gate_actual_pct += math.copysign(max_step, gate_diff)

        # 2. Hydraulic Flow & Head calculations
        gross_head = 147.0 + (self.reservoir_elevation_m - 584.2)  # gross head ~147 m
        gate_fraction = self.wicket_gate_actual_pct / 100.0

        # Darcy friction loss in penstock (6.2m diameter penstock)
        target_flow = self.rated_flow_m3s * (gate_fraction / 0.824)
        # Flow inertia response (penstock water column)
        self.penstock_flow_m3s += (target_flow - self.penstock_flow_m3s) * min(1.0, 0.4 * effective_dt)

        penstock_velocity = self.penstock_flow_m3s / (math.pi * (6.2 / 2) ** 2)  # 6.2m diameter penstock (~6.4 m/s)
        friction_loss_m = 0.014 * (420.0 / 6.2) * (penstock_velocity ** 2) / (2 * self.g)  # ~4.5 m loss
        net_head = max(0.0, gross_head - friction_loss_m)
        self.rated_head_m = net_head

        # 3. Surge Tank Oscillation (water hammer dampening)
        # Second order mass oscillator
        surge_target = self.reservoir_elevation_m - friction_loss_m * 0.35
        accel = -0.15 * (self.surge_tank_level - surge_target) - 0.4 * self.surge_velocity
        self.surge_velocity += accel * effective_dt
        self.surge_tank_level += self.surge_velocity * effective_dt

        # Pressures
        self.penstock_pressure_bar = round((net_head * self.rho * self.g) / 1e5 / 10.0 + (random.random() - 0.5) * 0.05, 2)
        self.spiral_case_pressure_bar = round(self.penstock_pressure_bar * 0.98 + (random.random() - 0.5) * 0.04, 2)

        # 4. Francis Turbine Runner Efficiency curve
        # Francis efficiency peak is around 85% flow
        if gate_fraction > 0.05:
            q_ratio = self.penstock_flow_m3s / self.rated_flow_m3s
            eff_peak = 0.942
            self.turbine_efficiency_pct = max(60.0, min(95.0, (eff_peak - 0.28 * ((q_ratio - 0.88) ** 2)) * 100))
        else:
            self.turbine_efficiency_pct = 0.0

        # 5. Mechanical and Electrical Power
        if not self.is_tripped and gate_fraction > 0.02:
            mech_power_watts = (
                self.rho * self.g * self.penstock_flow_m3s * net_head * (self.turbine_efficiency_pct / 100.0)
            )
            raw_mw = (mech_power_watts / 1e6) * self.generator_efficiency * self.transformer_efficiency
            # Micro electrical noise
            jitter = (random.random() - 0.5) * 0.8
            self.net_generation_mw = round(max(0.0, raw_mw + jitter), 1)

            # Runner RPM and Grid Frequency
            # Governed tightly to 50 Hz (375 RPM)
            rpm_noise = (random.random() - 0.5) * 0.12
            self.runner_rpm = round(self.synchronous_rpm + rpm_noise, 2)
            self.grid_frequency_hz = round(50.00 + (rpm_noise / self.synchronous_rpm) * 50.0, 2)

            # Vibration and Temperatures
            self.vibration_mms = round(1.10 + 0.35 * (self.net_generation_mw / self.rated_power_mw) + (random.random() - 0.5) * 0.06, 2)
            self.bearing_temp_c = round(38.0 + 7.5 * (self.net_generation_mw / self.rated_power_mw) + (random.random() - 0.5) * 0.2, 1)
            self.transformer_temp_c = round(44.0 + 13.0 * (self.net_generation_mw / self.rated_power_mw) + (random.random() - 0.5) * 0.3, 1)
            self.terminal_voltage_kv = round(11.00 + (random.random() - 0.5) * 0.04, 2)
            self.transformer_voltage_kv = round(400.0 + (random.random() - 0.5) * 0.6, 1)
            self.unit_health_pct = 99.9
        else:
            # Tripped or shut down state
            self.net_generation_mw = 0.0
            self.runner_rpm = max(0.0, round(self.runner_rpm * 0.95, 1))
            self.grid_frequency_hz = 50.00
            self.vibration_mms = 0.08
            self.bearing_temp_c = max(25.0, round(self.bearing_temp_c - 0.2, 1))
            self.transformer_temp_c = max(30.0, round(self.transformer_temp_c - 0.1, 1))
            self.unit_health_pct = 72.0 if self.is_tripped else 95.0

        return self.get_telemetry_snapshot()

    def get_telemetry_snapshot(self):
        gross_head = self.reservoir_elevation_m - self.tailrace_elevation_m
        return {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "net_generation_mw": self.net_generation_mw,
            "rated_capacity_mw": self.rated_power_mw,
            "capacity_factor_pct": round((self.net_generation_mw / self.rated_power_mw) * 100, 1),
            "hydraulic_head_m": round(self.rated_head_m + (random.random() - 0.5) * 0.2, 1),
            "flow_rate_m3s": round(self.penstock_flow_m3s, 1),
            "turbine_efficiency_pct": round(self.turbine_efficiency_pct, 1),
            "unit_health_pct": self.unit_health_pct,
            "grid_frequency_hz": self.grid_frequency_hz,
            "runner_rpm": self.runner_rpm,
            "wicket_gate_actual_pct": round(self.wicket_gate_actual_pct, 1),
            "wicket_gate_target_pct": round(self.wicket_gate_target_pct, 1),
            "spiral_case_pressure_bar": self.spiral_case_pressure_bar,
            "penstock_pressure_bar": self.penstock_pressure_bar,
            "surge_tank_level_m": round(self.surge_tank_level, 2),
            "reservoir_level_m": round(self.reservoir_elevation_m, 2),
            "tailrace_level_m": round(self.tailrace_elevation_m, 2),
            "terminal_voltage_kv": self.terminal_voltage_kv,
            "transformer_voltage_kv": self.transformer_voltage_kv,
            "transformer_temp_c": self.transformer_temp_c,
            "bearing_temp_c": self.bearing_temp_c,
            "bearing_vibration_mms": self.vibration_mms,
            "cavitation_sigma": self.cavitation_sigma,
            "is_tripped": self.is_tripped,
            "is_paused": self.is_paused,
            "flow_multiplier": self.flow_multiplier,
            "scada_status": "TRIPPED EMERGENCY" if self.is_tripped else "Unit 2 • 250 MW Francis SCADA Active"
        }

hydro_engine = HydroPhysicsEngine()
