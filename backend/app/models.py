from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class ZoneSpec(BaseModel):
    id: str
    name: str
    reach: Literal["head", "middle", "tail"]
    area_ha: float
    crop: str
    crop_stage: str
    growth_day: int
    soil_type: str
    taw_mm: float
    raw_mm: float
    current_depletion_mm: float
    ndvi: float
    geojson_coords: List[List[float]]


class SchemeSummary(BaseModel):
    id: str
    name: str
    district: str
    scheme_type: str
    command_area_ha: float
    canal_capacity_m3_day: float
    conveyance_efficiency: float
    latitude: float
    longitude: float
    elevation_m: float
    data_source_label: str
    zones: List[ZoneSpec]


class WeatherDay(BaseModel):
    date: str
    t_min_c: float
    t_max_c: float
    humidity_pct: float
    wind_ms: float
    solar_mj_m2: float
    rainfall_mm: float
    effective_rainfall_mm: float
    et0_mm: float
    source: str = "Assam Synthetic / Open-Meteo Calibrated"


class ForecastDriver(BaseModel):
    factor: str
    impact_pct: float
    direction: Literal["increases", "decreases", "neutral"]
    detail: str


class ZoneForecastDay(BaseModel):
    date: str
    zone_id: str
    zone_name: str
    reach: str
    crop: str
    kc: float
    etc_mm: float
    effective_rain_mm: float
    net_demand_mm: float
    gross_demand_m3: float
    ci_80_low_m3: float
    ci_80_high_m3: float
    ci_95_low_m3: float
    ci_95_high_m3: float
    soil_moisture_pct: float
    confidence_score: float


class SchemeForecastDay(BaseModel):
    date: str
    gross_demand_m3: float
    net_demand_m3: float
    ci_80_low_m3: float
    ci_80_high_m3: float
    ci_95_low_m3: float
    ci_95_high_m3: float
    baseline_static_m3: float
    rainfall_mm: float
    et0_mm: float
    confidence_score: float


class ForecastResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    generated_at: str
    data_completeness_pct: float
    model_version: str
    weather_days: List[WeatherDay]
    scheme_daily: List[SchemeForecastDay]
    zone_daily: List[ZoneForecastDay]
    drivers: List[ForecastDriver]


class ZoneAllocation(BaseModel):
    zone_id: str
    zone_name: str
    reach: str
    recommended_m3: float
    demand_m3: float
    adequacy_pct: float
    gate_hours: float


class ScheduleOption(BaseModel):
    strategy_id: str
    strategy_name: str
    tagline: str
    total_7d_release_m3: float
    baseline_7d_release_m3: float
    water_saved_m3: float
    water_saved_pct: float
    tail_end_adequacy_pct: float
    overall_adequacy_pct: float
    projected_wue_gain_pct: float
    daily_releases_m3: List[float]
    zone_allocations: List[ZoneAllocation]


class ScheduleComparisonResponse(BaseModel):
    scheme_id: str
    dates: List[str]
    canal_capacity_m3_day: float
    options: List[ScheduleOption]


class ApprovalRequest(BaseModel):
    scheme_id: str
    strategy_id: str
    engineer_name: str = Field(..., min_length=2)
    role: str = "Assistant Engineer (Irrigation Dept.)"
    action: Literal["approve", "override"]
    override_m3_day: Optional[float] = None
    rationale: str = Field(..., min_length=3)


class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    scheme_id: str
    strategy_id: str
    engineer_name: str
    role: str
    action: str
    override_m3_day: Optional[float] = None
    rationale: str


class FieldObservationRequest(BaseModel):
    scheme_id: str
    zone_id: str
    observer_name: str
    observer_role: Literal["Scheme Operator", "WUA Representative", "Field Engineer"]
    observed_rainfall_mm: float = 0.0
    standing_water_cm: float = 0.0
    gate_hours_actual: float = 0.0
    notes: str = ""


class FieldObservationEntry(FieldObservationRequest):
    id: str
    timestamp: str


class AlertItem(BaseModel):
    id: str
    severity: Literal["high", "medium", "info"]
    category: str
    title: str
    message: str
    zone_id: Optional[str] = None
    recommended_action: str


class SimulationMetrics(BaseModel):
    scheme_id: str
    simulation_days: int
    data_label: str
    forecast_mape_pct: float
    forecast_rmse_m3: float
    ci_80_coverage_pct: float
    static_total_release_m3: float
    smart_total_release_m3: float
    avoidable_over_irrigation_saved_m3: float
    over_irrigation_reduction_pct: float
    static_tail_deficit_days: int
    smart_tail_deficit_days: int
    tail_deficit_reduction_pct: float
    sample_series: List[dict]
