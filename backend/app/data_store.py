from __future__ import annotations

from datetime import date, timedelta
from typing import Dict, List
import math
import numpy as np

from .models import SchemeSummary, ZoneSpec, AuditLogEntry, FieldObservationEntry


def get_synthetic_schemes() -> Dict[str, SchemeSummary]:
    """
    Returns clearly labelled synthetic Minor/Micro Irrigation schemes representative
    of Assam's agro-climatic conditions (Kamrup & Nagaon districts).
    """
    kamrup = SchemeSummary(
        id="assam-mi-kamrup-01",
        name="Kalangpar Minor Irrigation Scheme (Synthetic Pilot)",
        district="Kamrup (Rural)",
        scheme_type="Surface Lift + Gravity Minor Canal",
        command_area_ha=420.0,
        canal_capacity_m3_day=24500.0,
        conveyance_efficiency=0.72,
        latitude=26.18,
        longitude=91.74,
        elevation_m=56.0,
        data_source_label="SYNTHETIC_DEMO_ASSAM_MI (Public FAO-56 + Synthetic Command Profile)",
        zones=[
            ZoneSpec(
                id="z-head",
                name="Head Reach — Sali Paddy Block A",
                reach="head",
                area_ha=145.0,
                crop="Sali Paddy",
                crop_stage="Panicle Initiation",
                growth_day=62,
                soil_type="Alluvial Silty Clay Loam",
                taw_mm=145.0,
                raw_mm=72.5,
                current_depletion_mm=18.0,
                ndvi=0.74,
                geojson_coords=[
                    [26.186, 91.732],
                    [26.186, 91.742],
                    [26.178, 91.742],
                    [26.178, 91.732],
                ],
            ),
            ZoneSpec(
                id="z-mid",
                name="Middle Reach — Mixed Paddy & Vegetables",
                reach="middle",
                area_ha=150.0,
                crop="Sali Paddy",
                crop_stage="Tillering / Mid-Vegetative",
                growth_day=45,
                soil_type="Alluvial Clay Loam",
                taw_mm=135.0,
                raw_mm=67.5,
                current_depletion_mm=34.0,
                ndvi=0.66,
                geojson_coords=[
                    [26.178, 91.734],
                    [26.178, 91.746],
                    [26.170, 91.746],
                    [26.170, 91.734],
                ],
            ),
            ZoneSpec(
                id="z-tail",
                name="Tail Reach — Mustard & Rabi Pulses",
                reach="tail",
                area_ha=125.0,
                crop="Mustard",
                crop_stage="Flowering / Pod Formation",
                growth_day=48,
                soil_type="Sandy Clay Loam",
                taw_mm=115.0,
                raw_mm=57.5,
                current_depletion_mm=49.0,
                ndvi=0.52,
                geojson_coords=[
                    [26.170, 91.736],
                    [26.170, 91.749],
                    [26.161, 91.749],
                    [26.161, 91.736],
                ],
            ),
        ],
    )

    nagaon = SchemeSummary(
        id="assam-mi-nagaon-02",
        name="Jamuna-Dabaka Micro-Command (Synthetic Pilot)",
        district="Nagaon / Hojai",
        scheme_type="Solar Micro-Lift & Lined Distributary",
        command_area_ha=260.0,
        canal_capacity_m3_day=16800.0,
        conveyance_efficiency=0.80,
        latitude=26.12,
        longitude=92.85,
        elevation_m=72.0,
        data_source_label="SYNTHETIC_DEMO_ASSAM_MI (Public FAO-56 + Synthetic Command Profile)",
        zones=[
            ZoneSpec(
                id="z-n-head",
                name="Head Block — Boro Paddy",
                reach="head",
                area_ha=95.0,
                crop="Boro Paddy",
                crop_stage="Active Vegetative",
                growth_day=38,
                soil_type="Silty Clay",
                taw_mm=150.0,
                raw_mm=75.0,
                current_depletion_mm=22.0,
                ndvi=0.69,
                geojson_coords=[
                    [26.126, 92.842],
                    [26.126, 92.851],
                    [26.119, 92.851],
                    [26.119, 92.842],
                ],
            ),
            ZoneSpec(
                id="z-n-mid",
                name="Mid Block — Rabi Vegetables",
                reach="middle",
                area_ha=85.0,
                crop="Rabi Vegetables",
                crop_stage="Fruiting / Mid-Season",
                growth_day=52,
                soil_type="Loam",
                taw_mm=125.0,
                raw_mm=56.0,
                current_depletion_mm=38.0,
                ndvi=0.63,
                geojson_coords=[
                    [26.119, 92.845],
                    [26.119, 92.855],
                    [26.112, 92.855],
                    [26.112, 92.845],
                ],
            ),
            ZoneSpec(
                id="z-n-tail",
                name="Tail Block — Pulses (Black Gram)",
                reach="tail",
                area_ha=80.0,
                crop="Pulses",
                crop_stage="Pod Filling",
                growth_day=44,
                soil_type="Sandy Loam",
                taw_mm=110.0,
                raw_mm=50.0,
                current_depletion_mm=43.0,
                ndvi=0.55,
                geojson_coords=[
                    [26.112, 92.847],
                    [26.112, 92.857],
                    [26.105, 92.857],
                    [26.105, 92.847],
                ],
            ),
        ],
    )

    return {kamrup.id: kamrup, nagaon.id: nagaon}


def generate_synthetic_weather_series(
    start_date: date, days: int = 180, seed: int = 42, include_rain_event: bool = True
) -> List[dict]:
    """
    Generates realistic Assam sub-tropical monsoon/post-monsoon daily weather series.
    Clearly labelled as synthetic calibrated data for prototype/simulation.
    """
    rng = np.random.default_rng(seed)
    series = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        # Seasonal temperature wave
        t_mean = 24.5 + 4.0 * math.sin(2 * math.pi * (i + 30) / 365.0) + rng.normal(0, 0.8)
        diurnal = 8.0 + rng.uniform(-1.2, 1.5)
        t_min = round(t_mean - diurnal / 2.0, 1)
        t_max = round(t_mean + diurnal / 2.0, 1)
        humidity = float(np.clip(78.0 + rng.normal(0, 6.5), 52.0, 96.0))
        wind = float(np.clip(1.4 + rng.normal(0, 0.35), 0.5, 3.8))
        solar = float(np.clip(16.5 - 0.08 * max(0, humidity - 70) + rng.normal(0, 1.4), 8.5, 22.5))

        # Intermittent convective rainfall events
        rain = 0.0
        if rng.random() < 0.28:
            rain = float(round(rng.exponential(14.0), 1))
        if include_rain_event and days <= 14 and i in (2, 3):
            # Prominent forecasted rainfall event on Day 3 & Day 4 for clear demo signal
            rain = 24.5 if i == 2 else 14.0
            solar = max(9.5, solar - 4.0)
            humidity = min(94.0, humidity + 10.0)

        series.append(
            {
                "date": d.isoformat(),
                "t_min_c": t_min,
                "t_max_c": t_max,
                "humidity_pct": round(humidity, 1),
                "wind_ms": round(wind, 2),
                "solar_mj_m2": round(solar, 1),
                "rainfall_mm": round(rain, 1),
            }
        )
    return series


# In-memory audit & field observation stores for prototype session
AUDIT_LOGS: List[AuditLogEntry] = [
    AuditLogEntry(
        id="aud-init-001",
        timestamp="2026-11-25T07:15:00+05:30",
        scheme_id="assam-mi-kamrup-01",
        strategy_id="balanced-equity",
        engineer_name="R. Kalita (AE, Irrigation)",
        role="Assistant Engineer (Irrigation Dept.)",
        action="approve",
        rationale="Approved Balanced Equity schedule; tail-reach mustard flowering prioritized ahead of Day 3 rain.",
    )
]

FIELD_OBSERVATIONS: List[FieldObservationEntry] = [
    FieldObservationEntry(
        id="obs-init-001",
        timestamp="2026-11-25T06:45:00+05:30",
        scheme_id="assam-mi-kamrup-01",
        zone_id="z-tail",
        observer_name="B. Das (WUA Secretary)",
        observer_role="WUA Representative",
        observed_rainfall_mm=0.0,
        standing_water_cm=0.5,
        gate_hours_actual=5.5,
        notes="Tail-end minor 3 received reduced flow yesterday evening; soil surface cracking in outer plots.",
    )
]
