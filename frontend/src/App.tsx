import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CloudRain,
  Droplets,
  Info,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CommandMap } from './components/CommandMap'
import { ForecastChart } from './components/ForecastChart'
import type {
  AlertItem,
  AuditLogEntry,
  FieldObservationEntry,
  ForecastResponse,
  ScheduleComparisonResponse,
  SchemeSummary,
  SimulationMetrics,
} from './types'

type TabId = 'forecast' | 'schedules' | 'alerts' | 'simulation'

export default function App() {
  const [schemes, setSchemes] = useState<SchemeSummary[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [tab, setTab] = useState<TabId>('forecast')
  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [schedules, setSchedules] = useState<ScheduleComparisonResponse | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [observations, setObservations] = useState<FieldObservationEntry[]>([])
  const [simulation, setSimulation] = useState<SimulationMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  // Approval form state
  const [selectedStrategy, setSelectedStrategy] = useState('balanced-equity')
  const [engineerName, setEngineerName] = useState('R. Kalita (AE, Irrigation)')
  const [approvalAction, setApprovalAction] = useState<'approve' | 'override'>('approve')
  const [overrideVal, setOverrideVal] = useState('')
  const [rationale, setRationale] = useState(
    'Verified crop stage and Day 3-4 rain forecast; approving balanced tail-equity schedule.'
  )
  const [approvalToast, setApprovalToast] = useState<string | null>(null)

  // Field observation form state
  const [obsZoneId, setObsZoneId] = useState('')
  const [obsName, setObsName] = useState('M. Bora (Scheme Operator)')
  const [obsRole, setObsRole] = useState<'Scheme Operator' | 'WUA Representative' | 'Field Engineer'>(
    'Scheme Operator'
  )
  const [obsRain, setObsRain] = useState('0')
  const [obsWater, setObsWater] = useState('2.0')
  const [obsHours, setObsHours] = useState('6.0')
  const [obsNotes, setObsNotes] = useState('Headworks gauge normal; minor distributary 2 cleared.')

  useEffect(() => {
    fetch('/api/schemes')
      .then((r) => r.json())
      .then((data: SchemeSummary[]) => {
        setSchemes(data)
        if (data.length > 0) {
          setSelectedId(data[0].id)
          if (data[0].zones.length > 0) setObsZoneId(data[0].zones[0].id)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    const scheme = schemes.find((s) => s.id === selectedId)
    if (scheme && scheme.zones.length > 0) setObsZoneId(scheme.zones[0].id)

    Promise.all([
      fetch(`/api/forecast/${selectedId}?days=7`).then((r) => r.json()),
      fetch(`/api/schedules/${selectedId}`).then((r) => r.json()),
      fetch(`/api/alerts/${selectedId}`).then((r) => r.json()),
      fetch(`/api/audit/${selectedId}`).then((r) => r.json()),
      fetch(`/api/observations/${selectedId}`).then((r) => r.json()),
      fetch(`/api/simulation/${selectedId}`).then((r) => r.json()),
    ])
      .then(([f, sc, al, au, ob, sim]) => {
        setForecast(f)
        setSchedules(sc)
        setAlerts(al)
        setAuditLogs(au)
        setObservations(ob)
        setSimulation(sim)
      })
      .finally(() => setLoading(false))
  }, [selectedId, schemes])

  const activeScheme = schemes.find((s) => s.id === selectedId) || null
  const recommendedSchedule =
    schedules?.options.find((o) => o.strategy_id === 'balanced-equity') || schedules?.options[0]

  const total7dForecast = forecast
    ? Math.round(forecast.scheme_daily.reduce((acc, d) => acc + d.gross_demand_m3, 0))
    : 0
  const avgConfidence = forecast
    ? Math.round(
        (forecast.scheme_daily.reduce((acc, d) => acc + d.confidence_score, 0) /
          Math.max(1, forecast.scheme_daily.length)) *
          100
      )
    : 0

  async function handleApprovalSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    const res = await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheme_id: selectedId,
        strategy_id: selectedStrategy,
        engineer_name: engineerName,
        role: 'Assistant Engineer (Irrigation Dept.)',
        action: approvalAction,
        override_m3_day: approvalAction === 'override' && overrideVal ? Number(overrideVal) : null,
        rationale,
      }),
    })
    if (res.ok) {
      const entry: AuditLogEntry = await res.json()
      setAuditLogs((prev) => [entry, ...prev])
      setApprovalToast(`Logged ${entry.action.toUpperCase()} by ${entry.engineer_name}`)
      setTimeout(() => setApprovalToast(null), 4000)
    }
  }

  async function handleObservationSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || !obsZoneId) return
    const res = await fetch('/api/observations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheme_id: selectedId,
        zone_id: obsZoneId,
        observer_name: obsName,
        observer_role: obsRole,
        observed_rainfall_mm: Number(obsRain) || 0,
        standing_water_cm: Number(obsWater) || 0,
        gate_hours_actual: Number(obsHours) || 0,
        notes: obsNotes,
      }),
    })
    if (res.ok) {
      const entry: FieldObservationEntry = await res.json()
      setObservations((prev) => [entry, ...prev])
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  JalSankalp
                </h1>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200">
                  NESFIC-D-01 · Assam Irrigation Dept.
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Command-Area Water Demand Forecasting &amp; Human-in-the-Loop Scheduling
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-200">
              <Info className="h-3.5 w-3.5" />
              Synthetic &amp; Public Data Prototype
            </span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm focus:border-teal-600 focus:outline-none"
              aria-label="Select Irrigation Scheme"
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.command_area_ha} ha)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 pt-1">
            {[
              { id: 'forecast', label: 'GIS & Demand Forecast', icon: MapPin },
              { id: 'schedules', label: 'Schedule Comparator & Approval', icon: SlidersHorizontal },
              { id: 'alerts', label: `Alerts & WUA Check-In (${alerts.length})`, icon: AlertTriangle },
              { id: 'simulation', label: '180-Day Simulation & Evidence', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as TabId)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-teal-700 text-teal-800 bg-teal-50/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Advisory Banner */}
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sky-700" />
            <span>
              <strong>Decision-Support Boundary:</strong> Recommendations are advisory for authorized Irrigation Department staff. No autonomous gate or pump actuation is performed.
            </span>
          </div>
          {activeScheme && (
            <span className="hidden sm:inline font-medium text-sky-800">
              Capacity: {activeScheme.canal_capacity_m3_day.toLocaleString()} m³/day · Conveyance Eff: {Math.round(activeScheme.conveyance_efficiency * 100)}%
            </span>
          )}
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>7-Day Gross Demand Forecast</span>
              <Activity className="h-4 w-4 text-teal-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {total7dForecast.toLocaleString()} <span className="text-sm font-normal text-slate-500">m³</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              FAO-56 Penman-Monteith + Quantile ML
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Projected Water Saved vs. Static</span>
              <TrendingDown className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">
              {recommendedSchedule ? `${recommendedSchedule.water_saved_pct}%` : '—'}
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({recommendedSchedule ? recommendedSchedule.water_saved_m3.toLocaleString() : 0} m³)
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Via rain-deferral &amp; crop-stage alignment
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Tail-Reach Delivery Adequacy</span>
              <CheckCircle2 className="h-4 w-4 text-sky-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {recommendedSchedule ? `${recommendedSchedule.tail_end_adequacy_pct}%` : '—'}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Equitable allocation across head/mid/tail
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Model Confidence &amp; Inputs</span>
              <CloudRain className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {avgConfidence}%
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({forecast?.data_completeness_pct ?? 0}% complete)
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              80% &amp; 95% calibrated prediction bands
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Loading hydrological forecasts and schedule optimization...
          </div>
        ) : (
          <>
            {/* TAB 1: GIS & FORECAST */}
            {tab === 'forecast' && activeScheme && forecast && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                          Command-Area GIS &amp; Reach Stress
                        </h2>
                        <p className="text-xs text-slate-500">
                          Click any zone polygon for soil depletion, crop stage &amp; NDVI
                        </p>
                      </div>
                    </div>
                    <CommandMap scheme={activeScheme} />
                  </div>

                  <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                          7-Day Command Demand Forecast with Uncertainty Bounds
                        </h2>
                        <p className="text-xs text-slate-500">
                          Model: {forecast.model_version} · Compares smart demand vs. static baseline
                        </p>
                      </div>
                    </div>
                    <ForecastChart data={forecast.scheme_daily} />
                  </div>
                </div>

                {/* Drivers & Zone Breakdown */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">
                      Key Forecast Inputs &amp; Drivers
                    </h2>
                    <div className="space-y-3">
                      {forecast.drivers.map((drv, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800">
                              {drv.factor}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                drv.direction === 'decreases'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : drv.direction === 'increases'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {drv.impact_pct > 0 ? `+${drv.impact_pct}%` : `${drv.impact_pct}%`}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{drv.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">
                      Zone-Wise Crop Water Balance (Day 1 Snapshot)
                    </h2>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2 pr-3 font-medium">Zone / Reach</th>
                          <th className="py-2 pr-3 font-medium">Crop &amp; Stage</th>
                          <th className="py-2 pr-3 font-medium">Kc</th>
                          <th className="py-2 pr-3 font-medium">ETc (mm)</th>
                          <th className="py-2 pr-3 font-medium">Gross Demand</th>
                          <th className="py-2 font-medium">Soil Moisture</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeScheme.zones.map((z) => {
                          const zf = forecast.zone_daily.find(
                            (d) => d.zone_id === z.id && d.date === forecast.weather_days[0].date
                          )
                          return (
                            <tr key={z.id}>
                              <td className="py-2.5 pr-3 font-medium text-slate-900">
                                {z.name}
                                <div className="text-[11px] font-normal text-slate-500">
                                  {z.area_ha} ha · {z.soil_type}
                                </div>
                              </td>
                              <td className="py-2.5 pr-3 text-slate-700">
                                {z.crop}
                                <div className="text-[11px] text-slate-500">{z.crop_stage}</div>
                              </td>
                              <td className="py-2.5 pr-3 font-mono text-slate-700">
                                {zf?.kc ?? '—'}
                              </td>
                              <td className="py-2.5 pr-3 font-mono text-slate-700">
                                {zf?.etc_mm ?? '—'}
                              </td>
                              <td className="py-2.5 pr-3 font-semibold text-teal-800">
                                {zf ? `${zf.gross_demand_m3.toLocaleString()} m³` : '—'}
                              </td>
                              <td className="py-2.5">
                                <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-800">
                                  {zf?.soil_moisture_pct ?? '—'}%
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SCHEDULE COMPARATOR & APPROVAL */}
            {tab === 'schedules' && schedules && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {schedules.options.map((opt) => {
                    const isSelected = selectedStrategy === opt.strategy_id
                    return (
                      <div
                        key={opt.strategy_id}
                        onClick={() => setSelectedStrategy(opt.strategy_id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {opt.strategy_name}
                          </h3>
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectedStrategy(opt.strategy_id)}
                            className="mt-1 accent-teal-700"
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{opt.tagline}</p>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-white p-2 border border-slate-100">
                            <div className="text-slate-500">7-Day Release</div>
                            <div className="font-bold text-slate-900">
                              {opt.total_7d_release_m3.toLocaleString()} m³
                            </div>
                          </div>
                          <div className="rounded-lg bg-white p-2 border border-slate-100">
                            <div className="text-slate-500">Water Saved</div>
                            <div className="font-bold text-emerald-700">
                              {opt.water_saved_pct}% ({opt.water_saved_m3.toLocaleString()} m³)
                            </div>
                          </div>
                          <div className="rounded-lg bg-white p-2 border border-slate-100">
                            <div className="text-slate-500">Tail Adequacy</div>
                            <div className="font-bold text-sky-800">
                              {opt.tail_end_adequacy_pct}%
                            </div>
                          </div>
                          <div className="rounded-lg bg-white p-2 border border-slate-100">
                            <div className="text-slate-500">WUE Gain</div>
                            <div className="font-bold text-teal-800">
                              +{opt.projected_wue_gain_pct}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Human-in-the-loop Approval Form */}
                  <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-1 text-sm font-semibold text-slate-900">
                      Authorized Staff Review &amp; Approval
                    </h2>
                    <p className="mb-4 text-xs text-slate-500">
                      Every release schedule must be reviewed and signed off by an Irrigation Department engineer.
                    </p>
                    <form onSubmit={handleApprovalSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="mb-1 block font-medium text-slate-700">
                          Authorized Engineer Name
                        </label>
                        <input
                          value={engineerName}
                          onChange={(e) => setEngineerName(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block font-medium text-slate-700">Action</label>
                          <select
                            value={approvalAction}
                            onChange={(e) =>
                              setApprovalAction(e.target.value as 'approve' | 'override')
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          >
                            <option value="approve">Approve Recommended</option>
                            <option value="override">Manual Override</option>
                          </select>
                        </div>
                        {approvalAction === 'override' && (
                          <div>
                            <label className="mb-1 block font-medium text-slate-700">
                              Override (m³/day)
                            </label>
                            <input
                              type="number"
                              value={overrideVal}
                              onChange={(e) => setOverrideVal(e.target.value)}
                              placeholder="e.g. 16500"
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block font-medium text-slate-700">
                          Approval / Override Rationale
                        </label>
                        <textarea
                          value={rationale}
                          onChange={(e) => setRationale(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
                      >
                        Approve &amp; Log Release Schedule
                      </button>
                      {approvalToast && (
                        <div className="rounded-lg bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                          {approvalToast}
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Audit Trail */}
                  <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">
                      Immutable Decision Audit Log
                    </h2>
                    <div className="space-y-2.5 max-h-80 overflow-y-auto">
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">
                              {log.engineer_name}
                            </span>
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 font-semibold text-teal-800 uppercase">
                              {log.action} · {log.strategy_id}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600">{log.rationale}</p>
                          <div className="mt-1 text-[11px] text-slate-400">
                            {log.timestamp} · ID: {log.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ALERTS & WUA CHECK-IN */}
            {tab === 'alerts' && activeScheme && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-6 space-y-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Active Field &amp; Planner Advisories
                  </h2>
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className={`rounded-xl border p-4 ${
                        al.severity === 'high'
                          ? 'border-red-200 bg-red-50/70'
                          : al.severity === 'medium'
                          ? 'border-amber-200 bg-amber-50/70'
                          : 'border-sky-200 bg-sky-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          {al.category}
                        </span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-700 border border-slate-200">
                          {al.severity}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-slate-900">{al.title}</h3>
                      <p className="mt-1 text-xs text-slate-700">{al.message}</p>
                      <p className="mt-2 text-xs font-medium text-slate-800">
                        Recommended Action: {al.recommended_action}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">
                      Operator / WUA Field Observation Check-In
                    </h2>
                    <form onSubmit={handleObservationSubmit} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block font-medium text-slate-700">Zone</label>
                          <select
                            value={obsZoneId}
                            onChange={(e) => setObsZoneId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
                          >
                            {activeScheme.zones.map((z) => (
                              <option key={z.id} value={z.id}>
                                {z.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block font-medium text-slate-700">Role</label>
                          <select
                            value={obsRole}
                            onChange={(e) =>
                              setObsRole(
                                e.target.value as
                                  | 'Scheme Operator'
                                  | 'WUA Representative'
                                  | 'Field Engineer'
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
                          >
                            <option value="Scheme Operator">Scheme Operator</option>
                            <option value="WUA Representative">WUA Representative</option>
                            <option value="Field Engineer">Field Engineer</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="mb-1 block font-medium text-slate-700">
                            Local Rain (mm)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={obsRain}
                            onChange={(e) => setObsRain(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block font-medium text-slate-700">
                            Standing Water (cm)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={obsWater}
                            onChange={(e) => setObsWater(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block font-medium text-slate-700">
                            Gate Hours
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={obsHours}
                            onChange={(e) => setObsHours(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block font-medium text-slate-700">Observer</label>
                        <input
                          value={obsName}
                          onChange={(e) => setObsName(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-medium text-slate-700">Field Notes</label>
                        <input
                          value={obsNotes}
                          onChange={(e) => setObsNotes(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Submit Field Observation
                      </button>
                    </form>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">
                      Recent Field Observations
                    </h3>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {observations.map((obs) => (
                        <div key={obs.id} className="rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>{obs.observer_name}</span>
                            <span className="text-slate-500">{obs.observer_role}</span>
                          </div>
                          <div className="mt-1 text-slate-600">
                            Rain: {obs.observed_rainfall_mm} mm · Standing Water: {obs.standing_water_cm} cm · Gate: {obs.gate_hours_actual} hrs
                          </div>
                          <div className="mt-0.5 text-slate-700">{obs.notes}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 180-DAY SIMULATION */}
            {tab === 'simulation' && simulation && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">180-Day Forecast MAPE</div>
                    <div className="mt-1 text-2xl font-bold text-teal-800">
                      {simulation.forecast_mape_pct}%
                    </div>
                    <div className="text-xs text-slate-500">
                      RMSE: {simulation.forecast_rmse_m3.toLocaleString()} m³/day
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">80% CI Empirical Coverage</div>
                    <div className="mt-1 text-2xl font-bold text-sky-800">
                      {simulation.ci_80_coverage_pct}%
                    </div>
                    <div className="text-xs text-slate-500">Well-calibrated uncertainty</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">Avoidable Over-Irrigation Saved</div>
                    <div className="mt-1 text-2xl font-bold text-emerald-700">
                      {simulation.over_irrigation_reduction_pct}%
                    </div>
                    <div className="text-xs text-slate-500">
                      {simulation.avoidable_over_irrigation_saved_m3.toLocaleString()} m³ saved
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">Tail-Reach Deficit Days</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">
                      {simulation.smart_tail_deficit_days}{' '}
                      <span className="text-sm font-normal text-slate-500">
                        vs. {simulation.static_tail_deficit_days} static
                      </span>
                    </div>
                    <div className="text-xs text-emerald-700 font-medium">
                      {simulation.tail_deficit_reduction_pct}% reduction in tail stress
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="mb-1 text-sm font-semibold text-slate-900">
                    30-Day Sample Window: Static Release vs. JalSankalp Demand Forecast
                  </h2>
                  <p className="mb-4 text-xs text-slate-500">
                    Dataset Label: {simulation.data_label}
                  </p>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simulation.sample_series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line
                          type="monotone"
                          dataKey="static_release_m3"
                          stroke="#94a3b8"
                          strokeDasharray="5 5"
                          dot={false}
                          name="Static Baseline Release (m³)"
                        />
                        <Line
                          type="monotone"
                          dataKey="true_demand_m3"
                          stroke="#0284c7"
                          strokeWidth={2}
                          dot={false}
                          name="Simulated Crop Demand (m³)"
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted_m3"
                          stroke="#0f766e"
                          strokeWidth={2}
                          dot={false}
                          name="JalSankalp Forecast (m³)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600">
            <strong className="text-slate-800">Disclaimer:</strong> JalSankalp is a prototype decision-support
            application built for the North East Seva First Innovation Challenge (
            <a
              href="https://startup.assam.gov.in/nesfic26/problem-statements/nesfic-d-01"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-teal-700 underline hover:text-teal-800"
            >
              NESFIC-D-01
            </a>
            ) using public FAO-56 agronomic models and clearly labelled synthetic Assam Minor Irrigation
            datasets. No unconfirmed departmental data is assumed. All forecasts and schedules remain advisory
            for authorized Irrigation Department staff; no autonomous gate or pump actuation is performed.
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-2 text-xs text-slate-500 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                <strong className="text-slate-700">Lead Applicant:</strong> Kalyanjit Hatibaruah
              </span>
              <span>·</span>
              <span>Guwahati, Assam, India</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href="https://github.com/flugelsoft-01/assam-irrigation-forecast"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-teal-700 underline"
              >
                Source Repository
              </a>
              <span>&copy; {new Date().getFullYear()} Flugelsoft Labs. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
