import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Droplets,
  HelpCircle,
  Layers,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'

export function TutorialView() {
  const steps = [
    {
      num: '1',
      title: 'Select an Irrigation Scheme',
      icon: Droplets,
      desc: 'Use the dropdown in the top-right header to switch between Minor/Micro Irrigation schemes (e.g., Kalangpar 420 ha or Jamuna-Dabaka 260 ha). All maps, charts, and schedules update immediately.',
    },
    {
      num: '2',
      title: 'Inspect the GIS Map & 7-Day Forecast',
      icon: MapPin,
      desc: 'In "GIS & Demand Forecast", click any Head, Middle, or Tail polygon on the map to see crop stage, soil depletion, and satellite NDVI. On the chart, compare JalSankalp’s forecast (solid teal) against the old fixed release (dashed grey) and rain bars.',
    },
    {
      num: '3',
      title: 'Compare Schedules & Approve (Human-in-the-Loop)',
      icon: SlidersHorizontal,
      desc: 'Open "Schedule Comparator & Approval" to compare 3 strategies: Water-Saving, Balanced Equity, and Peak-Yield. Select one, enter your name and rationale (or a manual override), and click Approve to record it in the immutable audit log.',
    },
    {
      num: '4',
      title: 'Review Alerts, Log Field Check-Ins & Check Evidence',
      icon: CheckCircle2,
      desc: 'Use "Alerts & WUA Check-In" to view rain-halt or tail-deficit warnings and submit ground observations (local rain, standing water, gate hours). Check "180-Day Simulation & Evidence" for backtest accuracy and water savings.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-5">
        <div className="flex items-center gap-2 text-teal-900">
          <BookOpen className="h-5 w-5 text-teal-700" />
          <h2 className="text-base font-bold">What is JalSankalp &amp; Why Does It Matter?</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          In many Minor and Micro Irrigation schemes across Assam, canal and pump water is released using fixed
          schedules or rough operator estimates. When rain falls, water is wasted (over-irrigation); when dry spells
          hit during critical crop stages, tail-end farmers run short (under-irrigation).
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          <strong>JalSankalp</strong> is a decision-support assistant built for the Irrigation Department, Government
          of Assam (NESFIC-D-01). It combines weather forecasts, crop growth stages, soil water balance, and satellite
          greenness to forecast daily water demand—helping engineers schedule fairer, better-timed water releases while
          keeping final approval strictly in human hands.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-900">How to Use the Dashboard (4 Simple Steps)</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {steps.map((st) => {
            const Icon = st.icon
            return (
              <div
                key={st.num}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                    {st.num}
                  </span>
                  <Icon className="h-4 w-4 text-teal-700" />
                  <h4 className="text-sm font-semibold text-slate-900">{st.title}</h4>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{st.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldCheck className="h-4 w-4 text-sky-700" />
          <h3 className="text-sm font-bold">Who Uses JalSankalp?</h3>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <div className="font-semibold text-slate-900">Irrigation Planners &amp; Engineers</div>
            <div className="mt-1 text-slate-600">Review 7-day forecasts, compare schedules, and approve daily releases.</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <div className="font-semibold text-slate-900">Scheme Operators</div>
            <div className="mt-1 text-slate-600">Follow approved gate/pump hours and rain-halt advisories.</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <div className="font-semibold text-slate-900">Water Users&apos; Associations</div>
            <div className="mt-1 text-slate-600">Track equitable turns and submit local rain or field observations.</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <div className="font-semibold text-slate-900">Farmers</div>
            <div className="mt-1 text-slate-600">Benefit from reliable water aligned with crop growth and reduced tail stress.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TechnicalGlossaryView() {
  const formulas = [
    {
      title: '1. Reference Evapotranspiration (ET₀ — FAO-56 Penman-Monteith)',
      formula: 'ET₀ = f(Temperature, Humidity, Wind Speed, Solar Radiation, Elevation)',
      plain:
        'Measures how much water the atmosphere "pulls" from a standard healthy green crop every day (in mm/day). Hot, sunny, windy, and dry days have higher ET₀; cloudy, humid days have lower ET₀.',
    },
    {
      title: '2. Crop Water Need (ETc = Kc × ET₀)',
      formula: 'ETc (mm/day) = Crop Coefficient (Kc) × ET₀',
      plain:
        'Different crops—and different growth stages—drink different amounts of water. We multiply ET₀ by a crop factor Kc (adjusted slightly by satellite NDVI greenness). For example, Sali Paddy at panicle initiation (Kc ≈ 1.20) needs more water than young Mustard (Kc ≈ 0.35).',
    },
    {
      title: '3. Effective Rainfall (Peff — USDA SCS Method)',
      formula: 'Peff = Rain × (125 − 0.2 × Rain) / 125 × 0.85  (for Rain ≤ 50 mm)',
      plain:
        'Not every drop of rain reaches crop roots—very light rain (< 2 mm) evaporates immediately, and heavy downpours partially run off. Effective rainfall estimates only the portion that actually refills the root-zone soil.',
    },
    {
      title: '4. Gross Canal Release Volume (m³/day)',
      formula: 'Gross Release (m³) = (Net Demand (mm) × Area (ha) × 10) / Conveyance Efficiency',
      plain:
        '1 mm of water over 1 hectare equals 10 cubic meters (10,000 liters). Because some water seeps or evaporates along earthen canals (e.g., 72% efficiency), we divide by conveyance efficiency so the full required amount still reaches the fields.',
    },
    {
      title: '5. Calibrated Uncertainty Bands (80% & 95% Confidence)',
      formula: 'Prediction Interval = Physics Water Balance + Quantile ML Residual Bounds',
      plain:
        'Weather forecasts are never 100% exact. Instead of showing a single rigid number, JalSankalp displays an 80% and 95% confidence band so engineers can see the likely range and choose a conservative or water-saving schedule accordingly.',
    },
  ]

  const glossary = [
    {
      term: 'Command Area',
      meaning: 'The total agricultural land (in hectares) that an irrigation scheme’s canals or pumps are designed to water.',
    },
    {
      term: 'Head / Middle / Tail Reach',
      meaning: 'Sections of a canal network from the water source (Head) to the farthest end (Tail). Tail reaches often suffer shortages if Head reaches over-extract.',
    },
    {
      term: 'TAW & RAW (Soil Water)',
      meaning: 'Total Available Water (TAW) is the sponge capacity of the root-zone soil; Readily Available Water (RAW) is the safe portion crops can use before experiencing stress.',
    },
    {
      term: 'NDVI (Satellite Greenness)',
      meaning: 'Normalized Difference Vegetation Index (from Sentinel-2 satellites, -1 to +1). Higher values (e.g., 0.74) indicate denser, actively growing crops.',
    },
    {
      term: 'Conveyance Efficiency',
      meaning: 'Percentage of water released at the headworks that actually arrives at farm outlets after canal seepage and evaporation losses.',
    },
    {
      term: 'Water-Use Efficiency (WUE)',
      meaning: 'How effectively irrigation water supports crop needs without wasteful runoff or deep percolation.',
    },
    {
      term: 'WUA (Water Users’ Association)',
      meaning: 'Local farmer committee that coordinates rotational water turns and reports ground conditions to scheme operators.',
    },
    {
      term: 'MAPE & RMSE',
      meaning: 'Forecast accuracy metrics. MAPE (Mean Absolute Percentage Error) shows average % error; RMSE measures typical daily volume error in m³/day.',
    },
    {
      term: 'Human-in-the-Loop',
      meaning: 'Safety rule where software only recommends schedules; authorized Irrigation Department staff must review and approve before any gate or pump is operated.',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Tech Stack */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <Cpu className="h-5 w-5 text-teal-700" />
          <h2 className="text-base font-bold">Technology Stack &amp; Engineering Architecture</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          JalSankalp is engineered to be lightweight, transparent, and deployable both on government cloud
          (NIC MeghRaj) and global edge hosting (Cloudflare Workers).
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="font-bold text-teal-800">Interactive Frontend</div>
            <div className="mt-1 text-slate-600">
              React, TypeScript, Tailwind CSS, Leaflet GIS maps, and Recharts uncertainty fan charts.
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="font-bold text-teal-800">Edge &amp; API Backend</div>
            <div className="mt-1 text-slate-600">
              Cloudflare Workers (TypeScript) for low-latency edge hosting + Python FastAPI for full ML/SciPy workloads.
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="font-bold text-teal-800">Hydrology &amp; AI/ML</div>
            <div className="mt-1 text-slate-600">
              FAO-56 Penman-Monteith water balance + Quantile Gradient Boosting (`scikit-learn`) + Linear Programming (`SciPy`).
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="font-bold text-teal-800">Data &amp; Governance</div>
            <div className="mt-1 text-slate-600">
              Open-Meteo/IMD weather, Sentinel-2 NDVI proxies, WUA check-ins, and immutable approval audit logs.
            </div>
          </div>
        </div>
      </div>

      {/* Layman Formulas */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <Layers className="h-5 w-5 text-sky-700" />
          <h2 className="text-base font-bold">Core Engineering Formulas (Explained Simply)</h2>
        </div>
        <div className="mt-4 space-y-3">
          {formulas.map((f, idx) => (
            <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
              <div className="text-xs font-bold text-slate-900">{f.title}</div>
              <div className="mt-1.5 inline-block rounded bg-white px-2.5 py-1 font-mono text-[11px] text-teal-800 border border-slate-200">
                {f.formula}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{f.plain}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Glossary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <HelpCircle className="h-5 w-5 text-indigo-700" />
          <h2 className="text-base font-bold">Glossary of Terms</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {glossary.map((g) => (
            <div key={g.term} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
              <div className="font-bold text-slate-900">{g.term}</div>
              <div className="mt-1 leading-relaxed text-slate-600">{g.meaning}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
