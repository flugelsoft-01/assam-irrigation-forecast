export interface ZoneSpec {
  id: string
  name: string
  reach: 'head' | 'middle' | 'tail'
  area_ha: number
  crop: string
  crop_stage: string
  growth_day: number
  soil_type: string
  taw_mm: number
  raw_mm: number
  current_depletion_mm: number
  ndvi: number
  geojson_coords: [number, number][]
}

export interface SchemeSummary {
  id: string
  name: string
  district: string
  scheme_type: string
  command_area_ha: number
  canal_capacity_m3_day: number
  conveyance_efficiency: number
  latitude: number
  longitude: number
  elevation_m: number
  data_source_label: string
  zones: ZoneSpec[]
}

export interface WeatherDay {
  date: string
  t_min_c: number
  t_max_c: number
  humidity_pct: number
  wind_ms: number
  solar_mj_m2: number
  rainfall_mm: number
  effective_rainfall_mm: number
  et0_mm: number
  source: string
}

export interface ForecastDriver {
  factor: string
  impact_pct: number
  direction: 'increases' | 'decreases' | 'neutral'
  detail: string
}

export interface SchemeForecastDay {
  date: string
  gross_demand_m3: number
  net_demand_m3: number
  ci_80_low_m3: number
  ci_80_high_m3: number
  ci_95_low_m3: number
  ci_95_high_m3: number
  baseline_static_m3: number
  rainfall_mm: number
  et0_mm: number
  confidence_score: number
}

export interface ZoneForecastDay {
  date: string
  zone_id: string
  zone_name: string
  reach: string
  crop: string
  kc: number
  etc_mm: number
  effective_rain_mm: number
  net_demand_mm: number
  gross_demand_m3: number
  soil_moisture_pct: number
  confidence_score: number
}

export interface ForecastResponse {
  scheme_id: string
  scheme_name: string
  generated_at: string
  data_completeness_pct: number
  model_version: string
  weather_days: WeatherDay[]
  scheme_daily: SchemeForecastDay[]
  zone_daily: ZoneForecastDay[]
  drivers: ForecastDriver[]
}

export interface ZoneAllocation {
  zone_id: string
  zone_name: string
  reach: string
  recommended_m3: number
  demand_m3: number
  adequacy_pct: number
  gate_hours: number
}

export interface ScheduleOption {
  strategy_id: string
  strategy_name: string
  tagline: string
  total_7d_release_m3: number
  baseline_7d_release_m3: number
  water_saved_m3: number
  water_saved_pct: number
  tail_end_adequacy_pct: number
  overall_adequacy_pct: number
  projected_wue_gain_pct: number
  daily_releases_m3: number[]
  zone_allocations: ZoneAllocation[]
}

export interface ScheduleComparisonResponse {
  scheme_id: string
  dates: string[]
  canal_capacity_m3_day: number
  options: ScheduleOption[]
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  scheme_id: string
  strategy_id: string
  engineer_name: string
  role: string
  action: string
  override_m3_day?: number | null
  rationale: string
}

export interface FieldObservationEntry {
  id: string
  timestamp: string
  scheme_id: string
  zone_id: string
  observer_name: string
  observer_role: string
  observed_rainfall_mm: number
  standing_water_cm: number
  gate_hours_actual: number
  notes: string
}

export interface AlertItem {
  id: string
  severity: 'high' | 'medium' | 'info'
  category: string
  title: string
  message: string
  zone_id?: string | null
  recommended_action: string
}

export interface SimulationMetrics {
  scheme_id: string
  simulation_days: number
  data_label: string
  forecast_mape_pct: number
  forecast_rmse_m3: number
  ci_80_coverage_pct: number
  static_total_release_m3: number
  smart_total_release_m3: number
  avoidable_over_irrigation_saved_m3: number
  over_irrigation_reduction_pct: number
  static_tail_deficit_days: number
  smart_tail_deficit_days: number
  tail_deficit_reduction_pct: number
  sample_series: Array<{
    day: number
    date: string
    true_demand_m3: number
    predicted_m3: number
    static_release_m3: number
    rainfall_mm: number
  }>
}
