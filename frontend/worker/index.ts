import type {
  AlertItem,
  AuditLogEntry,
  FieldObservationEntry,
  ForecastDriver,
  ForecastResponse,
  ScheduleComparisonResponse,
  ScheduleOption,
  SchemeForecastDay,
  SchemeSummary,
  SimulationMetrics,
  WeatherDay,
  ZoneAllocation,
  ZoneForecastDay,
} from '../src/types'

export interface Env {
  ASSETS: Fetcher
}

const SCHEMES: Record<string, SchemeSummary> = {
  'assam-mi-kamrup-01': {
    id: 'assam-mi-kamrup-01',
    name: 'Kalangpar Minor Irrigation Scheme (Synthetic Pilot)',
    district: 'Kamrup (Rural)',
    scheme_type: 'Surface Lift + Gravity Minor Canal',
    command_area_ha: 420.0,
    canal_capacity_m3_day: 24500.0,
    conveyance_efficiency: 0.72,
    latitude: 26.18,
    longitude: 91.74,
    elevation_m: 56.0,
    data_source_label: 'SYNTHETIC_DEMO_ASSAM_MI (Public FAO-56 + Synthetic Command Profile)',
    zones: [
      {
        id: 'z-head',
        name: 'Head Reach — Sali Paddy Block A',
        reach: 'head',
        area_ha: 145.0,
        crop: 'Sali Paddy',
        crop_stage: 'Panicle Initiation',
        growth_day: 62,
        soil_type: 'Alluvial Silty Clay Loam',
        taw_mm: 145.0,
        raw_mm: 72.5,
        current_depletion_mm: 18.0,
        ndvi: 0.74,
        geojson_coords: [
          [26.186, 91.732],
          [26.186, 91.742],
          [26.178, 91.742],
          [26.178, 91.732],
        ],
      },
      {
        id: 'z-mid',
        name: 'Middle Reach — Mixed Paddy & Vegetables',
        reach: 'middle',
        area_ha: 150.0,
        crop: 'Sali Paddy',
        crop_stage: 'Tillering / Mid-Vegetative',
        growth_day: 45,
        soil_type: 'Alluvial Clay Loam',
        taw_mm: 135.0,
        raw_mm: 67.5,
        current_depletion_mm: 34.0,
        ndvi: 0.66,
        geojson_coords: [
          [26.178, 91.734],
          [26.178, 91.746],
          [26.170, 91.746],
          [26.170, 91.734],
        ],
      },
      {
        id: 'z-tail',
        name: 'Tail Reach — Mustard & Rabi Pulses',
        reach: 'tail',
        area_ha: 125.0,
        crop: 'Mustard',
        crop_stage: 'Flowering / Pod Formation',
        growth_day: 48,
        soil_type: 'Sandy Clay Loam',
        taw_mm: 115.0,
        raw_mm: 57.5,
        current_depletion_mm: 49.0,
        ndvi: 0.52,
        geojson_coords: [
          [26.17, 91.736],
          [26.17, 91.749],
          [26.161, 91.749],
          [26.161, 91.736],
        ],
      },
    ],
  },
  'assam-mi-nagaon-02': {
    id: 'assam-mi-nagaon-02',
    name: 'Jamuna-Dabaka Micro-Command (Synthetic Pilot)',
    district: 'Nagaon / Hojai',
    scheme_type: 'Solar Micro-Lift & Lined Distributary',
    command_area_ha: 260.0,
    canal_capacity_m3_day: 16800.0,
    conveyance_efficiency: 0.8,
    latitude: 26.12,
    longitude: 92.85,
    elevation_m: 72.0,
    data_source_label: 'SYNTHETIC_DEMO_ASSAM_MI (Public FAO-56 + Synthetic Command Profile)',
    zones: [
      {
        id: 'z-n-head',
        name: 'Head Block — Boro Paddy',
        reach: 'head',
        area_ha: 95.0,
        crop: 'Boro Paddy',
        crop_stage: 'Active Vegetative',
        growth_day: 38,
        soil_type: 'Silty Clay',
        taw_mm: 150.0,
        raw_mm: 75.0,
        current_depletion_mm: 22.0,
        ndvi: 0.69,
        geojson_coords: [
          [26.126, 92.842],
          [26.126, 92.851],
          [26.119, 92.851],
          [26.119, 92.842],
        ],
      },
      {
        id: 'z-n-mid',
        name: 'Mid Block — Rabi Vegetables',
        reach: 'middle',
        area_ha: 85.0,
        crop: 'Rabi Vegetables',
        crop_stage: 'Fruiting / Mid-Season',
        growth_day: 52,
        soil_type: 'Loam',
        taw_mm: 125.0,
        raw_mm: 56.0,
        current_depletion_mm: 38.0,
        ndvi: 0.63,
        geojson_coords: [
          [26.119, 92.845],
          [26.119, 92.855],
          [26.112, 92.855],
          [26.112, 92.845],
        ],
      },
      {
        id: 'z-n-tail',
        name: 'Tail Block — Pulses (Black Gram)',
        reach: 'tail',
        area_ha: 80.0,
        crop: 'Pulses',
        crop_stage: 'Pod Filling',
        growth_day: 44,
        soil_type: 'Sandy Loam',
        taw_mm: 110.0,
        raw_mm: 50.0,
        current_depletion_mm: 43.0,
        ndvi: 0.55,
        geojson_coords: [
          [26.112, 92.847],
          [26.112, 92.857],
          [26.105, 92.857],
          [26.105, 92.847],
        ],
      },
    ],
  },
}

const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-init-001',
    timestamp: '2026-11-25T07:15:00+05:30',
    scheme_id: 'assam-mi-kamrup-01',
    strategy_id: 'balanced-equity',
    engineer_name: 'R. Kalita (AE, Irrigation)',
    role: 'Assistant Engineer (Irrigation Dept.)',
    action: 'approve',
    rationale:
      'Approved Balanced Equity schedule; tail-reach mustard flowering prioritized ahead of Day 3 rain.',
  },
]

const FIELD_OBSERVATIONS: FieldObservationEntry[] = [
  {
    id: 'obs-init-001',
    timestamp: '2026-11-25T06:45:00+05:30',
    scheme_id: 'assam-mi-kamrup-01',
    zone_id: 'z-tail',
    observer_name: 'B. Das (WUA Secretary)',
    observer_role: 'WUA Representative',
    observed_rainfall_mm: 0.0,
    standing_water_cm: 0.5,
    gate_hours_actual: 5.5,
    notes: 'Tail-end minor 3 received reduced flow yesterday evening; soil surface cracking in outer plots.',
  },
]

const CROP_KC_CURVES: Record<string, [number, number, number, number, number, number, number]> = {
  'Sali Paddy': [25, 30, 45, 25, 1.05, 1.2, 0.9],
  'Boro Paddy': [25, 30, 40, 25, 1.05, 1.2, 0.9],
  Mustard: [18, 25, 35, 22, 0.35, 1.15, 0.35],
  'Rabi Vegetables': [20, 25, 35, 20, 0.5, 1.05, 0.8],
  Pulses: [15, 25, 30, 20, 0.4, 1.05, 0.35],
}

function seededRand(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function addDaysIso(startIso: string, offset: number): string {
  const d = new Date(`${startIso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}

function computeFao56Et0(
  tMin: number,
  tMax: number,
  humidity: number,
  wind: number,
  solar: number,
  elevation: number
): number {
  const tMean = 0.5 * (tMin + tMax)
  const p = 101.3 * Math.pow((293.0 - 0.0065 * elevation) / 293.0, 5.26)
  const gamma = 0.000665 * p
  const eTmin = 0.6108 * Math.exp((17.27 * tMin) / (tMin + 237.3))
  const eTmax = 0.6108 * Math.exp((17.27 * tMax) / (tMax + 237.3))
  const es = 0.5 * (eTmin + eTmax)
  const ea = es * (humidity / 100.0)
  const delta =
    (4098.0 * (0.6108 * Math.exp((17.27 * tMean) / (tMean + 237.3)))) / Math.pow(tMean + 237.3, 2)
  const rNs = (1.0 - 0.23) * solar
  const rNl = Math.max(1.2, 0.22 * solar * (1.0 - 0.005 * humidity))
  const rN = Math.max(1.0, rNs - rNl)
  const u2 = Math.max(0.5, wind)
  const num = 0.408 * delta * rN + gamma * (900.0 / (tMean + 273.0)) * u2 * Math.max(0.0, es - ea)
  const den = delta + gamma * (1.0 + 0.34 * u2)
  return Math.round(Math.max(0.8, num / den) * 100) / 100
}

function getCropKc(crop: string, growthDay: number, ndvi = 0.65): number {
  const [dIni, dDev, dMid, dLate, kcIni, kcMid, kcEnd] = CROP_KC_CURVES[crop] ?? [
    20, 25, 35, 20, 0.5, 1.1, 0.6,
  ]
  let baseKc = kcIni
  if (growthDay <= dIni) {
    baseKc = kcIni
  } else if (growthDay <= dIni + dDev) {
    const frac = (growthDay - dIni) / Math.max(1, dDev)
    baseKc = kcIni + frac * (kcMid - kcIni)
  } else if (growthDay <= dIni + dDev + dMid) {
    baseKc = kcMid
  } else {
    const frac = Math.min(1.0, (growthDay - dIni - dDev - dMid) / Math.max(1, dLate))
    baseKc = kcMid - frac * (kcMid - kcEnd)
  }
  const ndviAdj = 1.0 + Math.max(-0.06, Math.min(0.06, (ndvi - 0.65) * 0.2))
  return Math.round(baseKc * ndviAdj * 1000) / 1000
}

function computeEffectiveRain(rain: number): number {
  if (rain <= 2.0) return 0.0
  if (rain <= 50.0) return Math.round(((rain * (125.0 - 0.2 * rain)) / 125.0) * 0.85 * 100) / 100
  return Math.round(Math.min(rain * 0.65, 42.0) * 100) / 100
}

function generateWeather(startIso: string, days: number, seed: number, includeRainEvent: boolean) {
  const rand = seededRand(seed)
  const out = []
  for (let i = 0; i < days; i++) {
    const tMean = 24.5 + 4.0 * Math.sin((2 * Math.PI * (i + 30)) / 365.0) + (rand() - 0.5) * 1.4
    const diurnal = 7.2 + rand() * 2.2
    const tMin = Math.round((tMean - diurnal / 2.0) * 10) / 10
    const tMax = Math.round((tMean + diurnal / 2.0) * 10) / 10
    let humidity = Math.max(52, Math.min(96, 78 + (rand() - 0.5) * 11))
    const wind = Math.max(0.5, Math.min(3.8, 1.4 + (rand() - 0.5) * 0.6))
    let solar = Math.max(8.5, Math.min(22.5, 16.5 - 0.08 * Math.max(0, humidity - 70) + (rand() - 0.5) * 2.2))
    let rain = 0.0
    if (rand() < 0.28) {
      rain = Math.round(-Math.log(Math.max(0.01, rand())) * 13.5 * 10) / 10
    }
    if (includeRainEvent && days <= 14 && (i === 2 || i === 3)) {
      rain = i === 2 ? 24.5 : 14.0
      solar = Math.max(9.5, solar - 4.0)
      humidity = Math.min(94.0, humidity + 10.0)
    }
    out.push({
      date: addDaysIso(startIso, i),
      t_min_c: tMin,
      t_max_c: tMax,
      humidity_pct: Math.round(humidity * 10) / 10,
      wind_ms: Math.round(wind * 100) / 100,
      solar_mj_m2: Math.round(solar * 10) / 10,
      rainfall_mm: Math.round(rain * 10) / 10,
    })
  }
  return out
}

function buildForecast(scheme: SchemeSummary, days = 7): ForecastResponse {
  const rawWeather = generateWeather('2026-11-26', days, 77, true)
  const weatherDays: WeatherDay[] = rawWeather.map((w) => ({
    ...w,
    effective_rainfall_mm: computeEffectiveRain(w.rainfall_mm),
    et0_mm: computeFao56Et0(
      w.t_min_c,
      w.t_max_c,
      w.humidity_pct,
      w.wind_ms,
      w.solar_mj_m2,
      scheme.elevation_m
    ),
    source: 'Assam Synthetic / Open-Meteo Calibrated',
  }))

  const depletions: Record<string, number> = {}
  scheme.zones.forEach((z) => {
    depletions[z.id] = z.current_depletion_mm
  })

  const staticDailyM3 =
    Math.round(((scheme.command_area_ha * 10.0 * 5.2) / scheme.conveyance_efficiency) * 10) / 10
  const zoneDaily: ZoneForecastDay[] = []
  const schemeDaily: SchemeForecastDay[] = []

  weatherDays.forEach((wd, dayIdx) => {
    let dayGross = 0
    let dayNet = 0
    let day80L = 0
    let day80H = 0
    let day95L = 0
    let day95H = 0
    const confs: number[] = []

    scheme.zones.forEach((z) => {
      const kc = getCropKc(z.crop, z.growth_day + dayIdx, z.ndvi)
      const etcMm = Math.round(wd.et0_mm * kc * 100) / 100
      const dep = Math.max(0, Math.min(z.taw_mm, depletions[z.id] + etcMm - wd.effective_rainfall_mm))
      const triggerMm = 0.55 * z.raw_mm
      let netMm = Math.max(0, dep - triggerMm + 0.35 * etcMm)
      if (wd.rainfall_mm >= 12.0) netMm *= 0.25

      const factor = (z.area_ha * 10.0) / scheme.conveyance_efficiency
      const grossM3 = Math.round(netMm * factor * 10) / 10
      const ci80L = Math.round(Math.max(0, (netMm - 0.42) * factor) * 10) / 10
      const ci80H = Math.round(Math.max(grossM3 + 50, (netMm + 0.52) * factor) * 10) / 10
      const ci95L = Math.round(Math.max(0, (netMm - 0.72) * factor) * 10) / 10
      const ci95H = Math.round(Math.max(ci80H + 40, (netMm + 0.92) * factor) * 10) / 10

      depletions[z.id] = Math.max(0, dep - netMm)
      const smPct = Math.round(Math.max(15, Math.min(98, 100 * (1 - depletions[z.id] / z.taw_mm))) * 10) / 10
      const cScore =
        Math.round(Math.max(0.68, 0.94 - 0.022 * dayIdx - (wd.rainfall_mm > 10 ? 0.05 : 0)) * 100) / 100
      confs.push(cScore)

      zoneDaily.push({
        date: wd.date,
        zone_id: z.id,
        zone_name: z.name,
        reach: z.reach,
        crop: z.crop,
        kc,
        etc_mm: etcMm,
        effective_rain_mm: wd.effective_rainfall_mm,
        net_demand_mm: Math.round(netMm * 100) / 100,
        gross_demand_m3: grossM3,
        soil_moisture_pct: smPct,
        confidence_score: cScore,
      })

      dayGross += grossM3
      dayNet += netMm * z.area_ha * 10.0
      day80L += ci80L
      day80H += ci80H
      day95L += ci95L
      day95H += ci95H
    })

    schemeDaily.push({
      date: wd.date,
      gross_demand_m3: Math.round(dayGross * 10) / 10,
      net_demand_m3: Math.round(dayNet * 10) / 10,
      ci_80_low_m3: Math.round(day80L * 10) / 10,
      ci_80_high_m3: Math.round(day80H * 10) / 10,
      ci_95_low_m3: Math.round(day95L * 10) / 10,
      ci_95_high_m3: Math.round(day95H * 10) / 10,
      baseline_static_m3: staticDailyM3,
      rainfall_mm: wd.rainfall_mm,
      et0_mm: wd.et0_mm,
      confidence_score: Math.round((confs.reduce((a, b) => a + b, 0) / confs.length) * 100) / 100,
    })
  })

  const drivers: ForecastDriver[] = [
    {
      factor: 'Forecasted Convective Rainfall (Days 3–4)',
      impact_pct: -31.5,
      direction: 'decreases',
      detail: '38.5 mm cumulative rainfall reduces mid-week net irrigation demand and triggers rain-halt savings.',
    },
    {
      factor: 'Crop Phenology (Panicle Initiation & Flowering)',
      impact_pct: 24.0,
      direction: 'increases',
      detail: 'Peak Kc (1.15–1.20) in Head Sali Paddy & Tail Mustard elevates daily ETc requirements.',
    },
    {
      factor: 'Tail-Reach Root-Zone Depletion',
      impact_pct: 16.8,
      direction: 'increases',
      detail: 'Initial tail depletion (49 mm / 85% of RAW) requires priority restoration on Days 1–2.',
    },
    {
      factor: 'Conveyance Efficiency (72–80%)',
      impact_pct: 12.4,
      direction: 'neutral',
      detail: 'Accounts for unlined/lined canal seepage losses between headworks and field outlets.',
    },
  ]

  return {
    scheme_id: scheme.id,
    scheme_name: scheme.name,
    generated_at: new Date().toISOString().slice(0, 19),
    data_completeness_pct: 92.5,
    model_version: 'JalSankalp-FAO56-EdgeWorker-v1.0',
    weather_days: weatherDays,
    scheme_daily: schemeDaily,
    zone_daily: zoneDaily,
    drivers,
  }
}

function buildSchedules(scheme: SchemeSummary, forecast: ForecastResponse): ScheduleComparisonResponse {
  const dates = forecast.scheme_daily.map((d) => d.date)
  const baseline7d = forecast.scheme_daily.reduce((a, d) => a + d.baseline_static_m3, 0)
  const zone7d: Record<string, number> = {}
  scheme.zones.forEach((z) => {
    zone7d[z.id] = 0
  })
  forecast.zone_daily.forEach((zd) => {
    zone7d[zd.zone_id] += zd.gross_demand_m3
  })

  const strategies = [
    {
      id: 'water-saving',
      name: 'Water-Saving & Rain-Deferral',
      tagline: 'Minimizes canal release by leveraging Day 3–4 rainfall & soil storage',
      ratio: 0.88,
      tailBoost: 1.0,
    },
    {
      id: 'balanced-equity',
      name: 'Balanced Equity (Recommended)',
      tagline: 'Optimal trade-off between water savings and tail-reach adequacy',
      ratio: 1.0,
      tailBoost: 1.08,
    },
    {
      id: 'peak-yield',
      name: 'Peak-Yield Protection',
      tagline: 'Buffers critical flowering/panicle stages using 80% upper confidence bound',
      ratio: 1.12,
      tailBoost: 1.12,
    },
  ]

  const cap = scheme.canal_capacity_m3_day
  const options: ScheduleOption[] = strategies.map((strat) => {
    const dailyReleases = forecast.scheme_daily.map((d) => {
      let target = Math.min(cap, d.gross_demand_m3 * strat.ratio)
      if (d.rainfall_mm >= 12 && strat.id === 'water-saving') target *= 0.65
      return Math.round(Math.min(cap, Math.max(0, target)) * 10) / 10
    })
    const total7d = Math.round(dailyReleases.reduce((a, b) => a + b, 0) * 10) / 10
    const savedM3 = Math.round(Math.max(0, baseline7d - total7d) * 10) / 10
    const savedPct = Math.round((savedM3 / Math.max(1, baseline7d)) * 1000) / 10

    const weights = scheme.zones.map(
      (z) => zone7d[z.id] * (z.reach === 'tail' ? strat.tailBoost : 1.0)
    )
    const wSum = Math.max(1, weights.reduce((a, b) => a + b, 0))
    let tailAdeq = 95.0
    const adeqList: number[] = []

    const zoneAllocations: ZoneAllocation[] = scheme.zones.map((z, idx) => {
      const dz = Math.max(1, zone7d[z.id])
      const alloc = Math.round(total7d * (weights[idx] / wSum) * 10) / 10
      const adeq = Math.round(Math.min(115, (alloc / dz) * 100) * 10) / 10
      adeqList.push(Math.min(100, adeq))
      if (z.reach === 'tail') tailAdeq = adeq
      return {
        zone_id: z.id,
        zone_name: z.name,
        reach: z.reach,
        recommended_m3: alloc,
        demand_m3: Math.round(dz * 10) / 10,
        adequacy_pct: adeq,
        gate_hours: Math.round((alloc / 7.0 / 1400.0) * 10) / 10,
      }
    })

    const overallAdeq = Math.round((adeqList.reduce((a, b) => a + b, 0) / adeqList.length) * 10) / 10
    const wueGain = Math.round(Math.max(4, savedPct * 0.72 + (tailAdeq - 75) * 0.15) * 10) / 10

    return {
      strategy_id: strat.id,
      strategy_name: strat.name,
      tagline: strat.tagline,
      total_7d_release_m3: total7d,
      baseline_7d_release_m3: Math.round(baseline7d * 10) / 10,
      water_saved_m3: savedM3,
      water_saved_pct: savedPct,
      tail_end_adequacy_pct: tailAdeq,
      overall_adequacy_pct: overallAdeq,
      projected_wue_gain_pct: wueGain,
      daily_releases_m3: dailyReleases,
      zone_allocations: zoneAllocations,
    }
  })

  return {
    scheme_id: scheme.id,
    dates,
    canal_capacity_m3_day: cap,
    options,
  }
}

function buildSimulation(scheme: SchemeSummary): SimulationMetrics {
  const weather = generateWeather('2026-06-01', 180, 99, false)
  const rand = seededRand(2026)
  const staticDaily = (scheme.command_area_ha * 10.0 * 5.2) / scheme.conveyance_efficiency
  let staticTotal = 0
  let smartTotal = 0
  let avoidableOver = 0
  let ciHits = 0
  let sumApe = 0
  let nonzeroCount = 0
  let sumSqErr = 0
  let staticTailDef = 0
  let smartTailDef = 0
  const tailZone = scheme.zones.find((z) => z.reach === 'tail') ?? scheme.zones[0]
  let tailDepStatic = 35.0
  let tailDepSmart = 35.0
  const sampleSeries = []

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i]
    const et0 = computeFao56Et0(
      w.t_min_c,
      w.t_max_c,
      w.humidity_pct,
      w.wind_ms,
      w.solar_mj_m2,
      scheme.elevation_m
    )
    const effRain = computeEffectiveRain(w.rainfall_mm)
    let predM3 = 0
    let trueM3 = 0
    for (const z of scheme.zones) {
      const kc = getCropKc(z.crop, ((z.growth_day + i) % 110) + 10, z.ndvi)
      const netReq = Math.max(0, et0 * kc - effRain)
      const factor = (z.area_ha * 10.0) / scheme.conveyance_efficiency
      const pz = netReq * factor
      const tz = Math.max(0, pz * (1 + (rand() - 0.5) * 0.12))
      predM3 += pz
      trueM3 += tz
    }
    const smartRel = Math.min(scheme.canal_capacity_m3_day, predM3)
    const band = Math.max(350, 0.11 * predM3)
    if (trueM3 >= predM3 - band && trueM3 <= predM3 + band) ciHits++
    if (trueM3 > 500) {
      sumApe += Math.abs(trueM3 - predM3) / trueM3
      nonzeroCount++
    }
    sumSqErr += Math.pow(trueM3 - predM3, 2)
    staticTotal += staticDaily
    smartTotal += smartRel
    if (staticDaily > trueM3 && w.rainfall_mm > 5) {
      avoidableOver += Math.max(0, (staticDaily - smartRel) * 0.85)
    }

    const tailEtc = et0 * getCropKc(tailZone.crop, ((tailZone.growth_day + i) % 100) + 10, tailZone.ndvi)
    const staticShare = (staticDaily * 0.22 * scheme.conveyance_efficiency) / (tailZone.area_ha * 10.0)
    const smartShare = (smartRel * 0.32 * scheme.conveyance_efficiency) / (tailZone.area_ha * 10.0)
    tailDepStatic = Math.max(0, Math.min(tailZone.taw_mm, tailDepStatic + tailEtc - effRain - staticShare))
    tailDepSmart = Math.max(0, Math.min(tailZone.taw_mm, tailDepSmart + tailEtc - effRain - smartShare))
    if (tailDepStatic > tailZone.raw_mm) staticTailDef++
    if (tailDepSmart > tailZone.raw_mm) smartTailDef++

    if (i < 30) {
      sampleSeries.push({
        day: i + 1,
        date: w.date,
        true_demand_m3: Math.round(trueM3),
        predicted_m3: Math.round(predM3),
        static_release_m3: Math.round(staticDaily),
        rainfall_mm: w.rainfall_mm,
      })
    }
  }

  return {
    scheme_id: scheme.id,
    simulation_days: 180,
    data_label: 'SYNTHETIC_180D_ASSAM_MI_BACKTEST',
    forecast_mape_pct: Math.round((sumApe / Math.max(1, nonzeroCount)) * 10000) / 100,
    forecast_rmse_m3: Math.round(Math.sqrt(sumSqErr / 180) * 10) / 10,
    ci_80_coverage_pct: Math.round((ciHits / 180) * 1000) / 10,
    static_total_release_m3: Math.round(staticTotal),
    smart_total_release_m3: Math.round(smartTotal),
    avoidable_over_irrigation_saved_m3: Math.round(avoidableOver),
    over_irrigation_reduction_pct: Math.round((avoidableOver / Math.max(1, staticTotal)) * 1000) / 10,
    static_tail_deficit_days: staticTailDef,
    smart_tail_deficit_days: smartTailDef,
    tail_deficit_reduction_pct:
      staticTailDef > 0 ? Math.round(((staticTailDef - smartTailDef) / staticTailDef) * 1000) / 10 : 0,
    sample_series: sampleSeries,
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/api/health') {
      return json({ status: 'ok', service: 'JalSankalp Cloudflare Worker API', version: '1.0.0' })
    }
    if (path === '/api/schemes') {
      return json(Object.values(SCHEMES))
    }
    if (path.startsWith('/api/forecast/')) {
      const sid = path.replace('/api/forecast/', '')
      const scheme = SCHEMES[sid]
      if (!scheme) return json({ detail: 'Scheme not found' }, 404)
      const days = Math.max(3, Math.min(14, Number(url.searchParams.get('days') ?? 7)))
      return json(buildForecast(scheme, days))
    }
    if (path.startsWith('/api/schedules/')) {
      const sid = path.replace('/api/schedules/', '')
      const scheme = SCHEMES[sid]
      if (!scheme) return json({ detail: 'Scheme not found' }, 404)
      return json(buildSchedules(scheme, buildForecast(scheme, 7)))
    }
    if (path === '/api/approve' && request.method === 'POST') {
      const body = (await request.json()) as Partial<AuditLogEntry>
      if (!body.scheme_id || !SCHEMES[body.scheme_id]) return json({ detail: 'Scheme not found' }, 404)
      const entry: AuditLogEntry = {
        id: `aud-${crypto.randomUUID().slice(0, 8)}`,
        timestamp: new Date().toISOString().slice(0, 19),
        scheme_id: body.scheme_id,
        strategy_id: body.strategy_id ?? 'balanced-equity',
        engineer_name: body.engineer_name ?? 'Authorized Engineer',
        role: body.role ?? 'Assistant Engineer (Irrigation Dept.)',
        action: body.action ?? 'approve',
        override_m3_day: body.override_m3_day ?? null,
        rationale: body.rationale ?? '',
      }
      AUDIT_LOGS.unshift(entry)
      return json(entry)
    }
    if (path.startsWith('/api/audit/')) {
      const sid = path.replace('/api/audit/', '')
      return json(AUDIT_LOGS.filter((a) => a.scheme_id === sid))
    }
    if (path === '/api/observations' && request.method === 'POST') {
      const body = (await request.json()) as Partial<FieldObservationEntry>
      if (!body.scheme_id || !SCHEMES[body.scheme_id]) return json({ detail: 'Scheme not found' }, 404)
      const entry: FieldObservationEntry = {
        id: `obs-${crypto.randomUUID().slice(0, 8)}`,
        timestamp: new Date().toISOString().slice(0, 19),
        scheme_id: body.scheme_id,
        zone_id: body.zone_id ?? '',
        observer_name: body.observer_name ?? 'Field Observer',
        observer_role: body.observer_role ?? 'Scheme Operator',
        observed_rainfall_mm: Number(body.observed_rainfall_mm ?? 0),
        standing_water_cm: Number(body.standing_water_cm ?? 0),
        gate_hours_actual: Number(body.gate_hours_actual ?? 0),
        notes: body.notes ?? '',
      }
      FIELD_OBSERVATIONS.unshift(entry)
      return json(entry)
    }
    if (path.startsWith('/api/observations/')) {
      const sid = path.replace('/api/observations/', '')
      return json(FIELD_OBSERVATIONS.filter((o) => o.scheme_id === sid))
    }
    if (path.startsWith('/api/alerts/')) {
      const sid = path.replace('/api/alerts/', '')
      const scheme = SCHEMES[sid]
      if (!scheme) return json({ detail: 'Scheme not found' }, 404)
      const forecast = buildForecast(scheme, 7)
      const alerts: AlertItem[] = []
      const rainDay = forecast.weather_days.find((d) => d.rainfall_mm >= 15)
      if (rainDay) {
        alerts.push({
          id: 'al-rain-01',
          severity: 'high',
          category: 'Rain-Halt Advisory',
          title: `Reduce Headworks Release on ${rainDay.date}`,
          message: `Forecasted rainfall of ${rainDay.rainfall_mm} mm (${rainDay.effective_rainfall_mm} mm effective) reduces net command demand by >30%.`,
          recommended_action: 'Switch to Water-Saving or Balanced Equity schedule to avoid over-irrigation.',
        })
      }
      scheme.zones
        .filter((z) => z.reach === 'tail' && z.current_depletion_mm > 0.75 * z.raw_mm)
        .forEach((tz) => {
          alerts.push({
            id: `al-tail-${tz.id}`,
            severity: 'medium',
            category: 'Tail-End Deficit Risk',
            title: `Priority Allocation Needed: ${tz.name}`,
            message: `Root-zone depletion is ${tz.current_depletion_mm} mm (${Math.round((tz.current_depletion_mm / tz.raw_mm) * 100)}% of RAW) during ${tz.crop_stage}.`,
            zone_id: tz.id,
            recommended_action: 'Allocate rotational priority in Days 1–2 before mid-week rainfall.',
          })
        })
      alerts.push({
        id: 'al-hitl-01',
        severity: 'info',
        category: 'Decision-Support Governance',
        title: 'Human-in-the-Loop Approval Required',
        message: 'All forecasts and schedules are advisory only. Authorized Irrigation Dept. staff must review and approve before gate operation.',
        recommended_action: 'Review Schedule Comparator and log approval.',
      })
      return json(alerts)
    }
    if (path.startsWith('/api/simulation/')) {
      const sid = path.replace('/api/simulation/', '')
      const scheme = SCHEMES[sid]
      if (!scheme) return json({ detail: 'Scheme not found' }, 404)
      return json(buildSimulation(scheme))
    }

    return env.ASSETS.fetch(request)
  },
}
