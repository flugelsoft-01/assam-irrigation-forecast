# NESFIC-D-01 Proposal: JalSankalp — Irrigation Water Demand Forecasting & Smarter Scheduling

**Challenge:** Stream 1 · NESFIC-D-01 (Irrigation Department, Government of Assam)  
**Solution Name:** JalSankalp — Command-Area Irrigation Demand Forecasting & Decision-Support Platform

---

## 1. Problem understanding & user workflow

In Assam’s Minor and Micro Irrigation (MI) schemes, water release decisions are largely driven by static historical schedules, fixed rotational turns, or rough operator estimates rather than real-time crop-water requirements. Because Assam experiences high spatial and temporal rainfall variability, diverse multi-cropping patterns (Sali, Ahu, and Boro paddy, mustard, pulses, and horticulture), and heterogeneous soil moisture retention across command areas, static releases frequently cause over-irrigation in head-reach zones and acute under-irrigation or tail-end deficits.

**Users and Beneficiaries:**
- **Irrigation Planners & Field Engineers (Irrigation Department, Assam):** Need scheme-level demand visibility to allocate water across canals/distributaries and justify release decisions.
- **Scheme Operators:** Execute gate openings, pump run-hours, and rotational schedules at headworks and minors.
- **Water Users’ Associations (WUAs):** Coordinate equitable distribution among member farmers and report local field conditions.
- **Farmers:** Primary beneficiaries who rely on timely, reliable water delivery aligned with crop growth stages to protect yields and reduce pumping costs.

**Current Workflow & Gaps:**
Currently, field staff rely on manual gauge readings, periodic crop-area estimates, and ad-hoc phone communication from WUAs. There is no unified operational workflow that combines localized weather forecasts, satellite vegetation/soil indicators, crop phenology, and canal conveyance constraints into an actionable daily or 7-day demand forecast. Consequently:
1. Rainfall events are not systematically factored into upcoming release reductions, wasting water and energy.
2. Crop-stage sensitivity (e.g., paddy panicle initiation vs. ripening) is not reflected in release volumes.
3. Uncertainty in forecasts or sensor gaps is invisible to decision-makers, reducing trust in ad-hoc adjustments.
4. No structured feedback loop exists between WUA field observations and planner schedules.

**Intended Outcome:**
Provide an operational, human-in-the-loop decision-support system that forecasts command-area irrigation demand, recommends and compares water-release schedules with explicit confidence bounds, and delivers clear dashboards and alerts—improving water-use efficiency, reducing avoidable over/under-irrigation, and maximizing utilization of Assam’s irrigation potential.

---

## 2. Proposed solution & key features

**JalSankalp** is a GIS-enabled, physics-informed AI decision-support platform designed specifically for Assam’s Minor and Micro Irrigation schemes. Rather than automating gates or replacing departmental authority, JalSankalp empowers authorized engineers, operators, and planners with transparent demand forecasts and scenario-tested release schedules.

**Main Modules & Key Features:**
1. **Command-Area Digital Twin & GIS Explorer:** Maps scheme boundaries, canal/minor networks, soil types, and crop zones. Displays spatial water-deficit heatmaps and tail-end stress indicators.
2. **Hybrid Demand Forecasting Engine:** Combines the FAO-56 Penman-Monteith evapotranspiration ($ET_0$) and crop-coefficient ($K_c$) water-balance model with gradient-boosted/temporal ML models trained on weather forecasts, effective rainfall, soil moisture, and satellite NDVI/NDWI. Outputs 7-day and 14-day irrigation demand ($m^3$/day and mm/day) at scheme and sub-command levels.
3. **Confidence & Explainability Panel:** Every forecast displays 80% and 95% prediction intervals, data-completeness badges, and feature-attribution drivers (e.g., "Forecasted rainfall -18 mm reduces net demand by 22%").
4. **Schedule Recommender & Scenario Comparator:** Generates 2–3 ranked release schedules (e.g., *Water-Saving*, *Balanced Equity*, *Peak-Yield Protection*) respecting canal capacity and rotational rules. Engineers can simulate "what-if" scenarios (e.g., delayed monsoon, pump outage) side-by-side before approving a schedule.
5. **Actionable Dashboards & Multi-Channel Alerts:** Role-based web dashboard for planners/engineers and lightweight mobile/SMS/WhatsApp-ready alerts for scheme operators and WUAs (e.g., rain-halt advisories, tail-end deficit warnings).
6. **Field Observation & Feedback Loop:** Simple WUA/operator check-in form to log actual gate hours, local rainfall, or crop-stage updates, continuously recalibrating the model.

**What Changes vs. Current Approach:**
- Shifts from static, experience-based releases to dynamic, crop-and-weather-responsive scheduling.
- Replaces fragmented spreadsheets/phone calls with a single auditable GIS + forecast workspace.
- Quantifies forecast uncertainty so engineers make informed, risk-aware decisions.
- Keeps all final release approvals strictly with authorized Irrigation Department staff.

---

## 3. Describe User Journey, Wireframes, Prototype & Proof of Work

**Proposed User Journey:**
1. **Morning Planner Review (07:00 AM):** An Assistant Engineer logs into the JalSankalp Command Dashboard, selects a Minor Irrigation scheme, and reviews the 7-day net irrigation demand forecast alongside confidence bands and key weather/soil inputs.
2. **Schedule Comparison & Approval:** The engineer inspects three recommended release schedules, compares projected tail-end equity and water saved against the baseline static schedule, adjusts a canal gate constraint if needed, and clicks **Approve & Publish Schedule** (logged with timestamp and rationale).
3. **Operator & WUA Execution:** The Scheme Operator receives a concise daily release bulletin (target discharge, pump hours, rain-deferral alert) and confirms execution. WUA representatives view upcoming turns and submit quick field observations (e.g., standing water depth or local rain).
4. **Weekly Planner Audit:** Irrigation Planners review Water-Use Efficiency (WUE), demand-vs-release alignment, and avoided over-irrigation metrics across schemes.

**Prototype, Wireframes & Proof of Work:**
We have developed a working full-stack prototype (**JalSankalp MVP**) demonstrating all core capabilities using clearly labelled synthetic Assam MI scheme data and public meteorological/agronomic parameters:
- **Interactive Web Application:** Built with a React/Next.js GIS dashboard and a Python FastAPI forecasting backend.
- **Implemented Modules:**
  - *Scheme Overview & GIS Command-Area Map* showing head/middle/tail reaches and crop zones.
  - *Demand Forecast View* with FAO-56 + ML hybrid predictions, 80%/95% confidence intervals, and input driver breakdowns.
  - *Schedule Comparator* allowing side-by-side comparison of Baseline vs. Smart-Scheduled releases and human-in-the-loop approval workflow.
  - *Alerts & Field Check-in Console* for rain-skip advisories and operator feedback logging.
- **Simulation & Test Evidence:** Backtesting on a 180-day synthetic Assam MI command-area dataset (*Kalangpar Minor Irrigation Scheme*, 420 ha) achieved a **3.51% forecast MAPE** (RMSE 795.8 m³/day), **18.8% reduction in avoidable over-irrigation** (1,028,927 m³ saved during rainfall events), and **75.5% tail-reach adequacy** in the 7-day Balanced Equity schedule. All 6 automated `pytest` checks pass.
- **Supporting PDF:** Our attached Proof of Work PDF (`JalSankalp_Proof_of_Work_NESFIC_D01.pdf`) includes live UI screenshots, vector forecast/backtest charts, simulation tables, and `pytest` verification logs.

---

## 4. Technology & solution architecture

JalSankalp uses a modular, cloud-native, open-standards architecture designed for low-bandwidth field reliability and seamless integration with government infrastructure.

**Software & Technology Stack:**
- **Frontend (Web & Mobile-Responsive PWA):** Next.js / React with TypeScript, Tailwind CSS, Leaflet/MapLibre GL for GIS command-area visualization, and Recharts/Apache ECharts for forecast uncertainty fan charts and schedule comparisons. Offline-capable PWA caching for field engineers.
- **Backend & API Layer:** Python 3.11+ with FastAPI, Pydantic for strict schema validation, and REST/JSON endpoints for forecasts, schedule optimization, alerts, and audit logs.
- **AI/ML & Hydrological Engine:**
  - *Physics Baseline:* FAO-56 Penman-Monteith $ET_0$, crop-coefficient ($K_c$) curves, effective rainfall (USDA SCS method), and daily root-zone soil water balance.
  - *ML Correction & Uncertainty:* LightGBM / Quantile Regression (or Conformalized Quantile Regression) to learn residual demand patterns from local weather, NDVI, and historical operational releases, outputting calibrated 10th/50th/90th percentile demand bounds.
  - *Schedule Optimizer:* Linear/Mixed-Integer Linear Programming (SciPy / PuLP) to allocate canal/pump releases across zones subject to capacity, rotational equity, and crop-priority constraints.
- **Database & Geospatial Storage:** PostgreSQL with PostGIS for command-area polygons, canal networks, and time-series operational/weather records; Redis for forecast caching.
- **External APIs & Integrations:** Open-Meteo / IMD weather forecast ingestion, NASA POWER / Sentinel-2 (NDVI/NDWI via Google Earth Engine or Copernicus Open Access) for vegetation/moisture proxies, and optional SMS/WhatsApp gateway webhooks for operator alerts.
- **Data Flow & Hosting:** Scheduled ingestion pipelines fetch weather/satellite updates → Water-Balance + ML Engine computes scheme/zone demand + confidence intervals → Optimizer generates candidate schedules → FastAPI serves the GIS dashboard and logs human approvals. Containerized via Docker for deployment on NIC Cloud / MeghRaj, AWS, or on-premise departmental servers.

---

## 5. Development methodology & intermediate steps

We follow an agile, milestone-driven, human-centered engineering methodology tailored to public-sector water management:

1. **Phase 1 — Discovery & Requirements Alignment:**
   - Map current Irrigation Department workflows, minor/micro scheme typologies, canal/pump constraints, and WUA communication channels.
   - Define data schemas (scheme metadata, crop calendar, daily weather, release logs) and KPI targets with departmental engineers.
   - *Key Output:* Functional Requirements Specification (FRS) & Data Dictionary.

2. **Phase 2 — Domain Modeling & UI/UX Design:**
   - Formulate the Assam-specific FAO-56 crop-water balance model (Sali/Ahu/Boro paddy, mustard, vegetables) and quantile ML residual pipeline.
   - Design low-friction wireframes for engineers, operators, and WUAs, emphasizing bilingual/simple visual cues and explicit uncertainty displays.
   - *Key Output:* Interactive Figma/UI wireframes & Hydrological-ML Model Spec.

3. **Phase 3 — Prototype & Simulation Environment:**
   - Build the core forecasting API, schedule optimizer, and interactive GIS dashboard using public weather/satellite data and clearly labelled synthetic Assam MI scheme datasets.
   - Run 180-day synthetic and historical backtest simulations comparing smart scheduling against static baseline releases.
   - *Key Output:* Working JalSankalp Prototype + Simulation Benchmark Report.

4. **Phase 4 — MVP Development & Departmental Data Integration:**
   - Integrate approved departmental scheme boundaries, crop records, and historical release logs.
   - Add role-based access control (RBAC), immutable approval audit trails, alert dispatching, and offline-friendly operator check-ins.
   - *Key Output:* Production-ready MVP deployed in staging/MeghRaj-compatible environment.

5. **Phase 5 — Field Testing, Calibration & Refinement:**
   - Shadow-run the MVP alongside existing operations in selected pilot MI schemes; gather weekly usability and accuracy feedback from field engineers and WUAs.
   - Calibrate crop coefficients, seepage/conveyance losses, and alert thresholds.
   - *Key Output:* Calibrated Pilot Release & Validation Report.

---

## 6. Development timeline & milestones

We propose a structured **24-week (6-month)** roadmap from kickoff to pilot-ready validation, building directly upon our existing working prototype:

- **Weeks 1–4 (Phase 1: Discovery & Data Onboarding):**
  - *Activities:* Stakeholder workshops with Irrigation Department planners/field engineers; finalize 2–3 pilot Minor/Micro Irrigation schemes; execute data-sharing approvals and ingest scheme/crop/historical logs.
  - *Milestone M1:* Approved SRS, pilot scheme profiles, and validated historical baseline dataset.
  - *Dependencies:* Departmental nomination of pilot schemes and nodal officer.

- **Weeks 5–10 (Phase 2: Model Calibration & Backend Hardening):**
  - *Activities:* Calibrate FAO-56 + ML quantile forecasting models on pilot scheme characteristics; implement canal-capacity & equity constraints in the schedule optimizer; set up automated weather/satellite ingestion pipelines.
  - *Milestone M2:* Calibrated forecasting & optimization engine passing backtest accuracy benchmarks.
  - *Dependencies:* Availability of scheme command-area maps and crop calendars.

- **Weeks 11–16 (Phase 3: MVP Frontend, Alerts & RBAC):**
  - *Activities:* Finalize GIS dashboard, confidence/explainability views, side-by-side schedule comparator, human-approval workflow, WUA field check-in, and SMS/mobile alerts.
  - *Milestone M3:* Feature-complete MVP ready for User Acceptance Testing (UAT).

- **Weeks 17–20 (Phase 4: UAT, Security Audit & Shadow Deployment):**
  - *Activities:* Conduct UAT with engineers, operators, and WUAs; perform security/access-control testing; run system in "shadow mode" (generating recommendations without altering live operations) to verify stability.
  - *Milestone M4:* **Solution Ready for Field Validation** (Week 20) — signed-off MVP + operator training completed.

- **Weeks 21–24 (Phase 5: Live Decision-Support Pilot & Evaluation):**
  - *Activities:* Active decision-support operation across one cropping sub-season; track water-use efficiency, forecast error, and operator adoption; deliver final validation report and statewide replication blueprint.
  - *Milestone M5:* Pilot Validation Report & Scale-up Roadmap.

---

## 7. Data & information requirements

**No unconfirmed departmental data access is assumed at the application stage.** Our current prototype operates strictly on publicly available datasets and clearly labelled synthetic Assam Minor Irrigation scheme data. Real departmental datasets will be integrated only during the Prototype/MVP phases subject to formal Irrigation Department approvals.

**Required Data Categories, Formats & Sources:**
1. **Scheme & Command-Area Metadata (Departmental, subject to approval):**
   - Command-area boundaries (Shapefile/GeoJSON), canal/distributary layout, design discharge capacities, pump ratings, and soil-type maps.
2. **Crop & Agronomic Records (Departmental / Agriculture Dept. / Public):**
   - Seasonal cropping patterns (area under Sali/Ahu/Boro paddy, mustard, pulses, vegetables), sowing/transplanting dates, and crop-stage durations (CSV/JSON). Public FAO-56 crop coefficients ($K_c$) provide baseline parameters.
3. **Historical Operational Logs (Departmental, subject to approval):**
   - Historical water release volumes, gate openings, pump run-hours, and canal roster schedules (CSV/Excel/digitized registers) for model calibration and baseline comparison.
4. **Weather & Climate Inputs (Public APIs / IMD):**
   - Daily & 7-day forecasted rainfall, min/max temperature, relative humidity, wind speed, and solar radiation (JSON/NetCDF via Open-Meteo, NASA POWER, or IMD APIs).
5. **Satellite & Soil Moisture Proxies (Public Remote Sensing & Optional IoT):**
   - Sentinel-2 NDVI/NDWI (10m resolution, GeoTIFF) for crop vigor and surface wetness; SoilGrids / SMAP soil properties; optional low-cost field soil-moisture sensor or WUA rain-gauge readings (MQTT/REST JSON).

**Processing, Annotation & Assumptions:**
- Digitization/cleaning of paper-based historical logs (if provided) into standardized time-series schemas.
- Spatial aggregation of gridded weather/satellite rasters to command-area polygons.
- *Key Assumption:* Where IoT soil sensors are unavailable, the system gracefully falls back to physics-based soil water balance + satellite moisture proxies, explicitly reflecting higher uncertainty in confidence intervals.

---

## 8. Team, manpower & expertise

In compliance with NESFIC 2026 guidelines (1–5 members), our core team comprises **5 multidisciplinary specialists** covering hydrology/agronomy, AI/ML, geospatial engineering, full-stack development, and field operations:

1. **Team Lead & Water Resources / Agronomy Specialist (1 FTE):**
   - *Expertise:* Irrigation engineering, FAO-56 crop-water modeling, Assam cropping systems, and WUA/departmental stakeholder coordination.
   - *Phase Focus:* Leads Discovery (Phase 1), hydrological calibration (Phase 2), and pilot validation (Phase 5).

2. **AI/ML & Optimization Engineer (1 FTE):**
   - *Expertise:* Time-series forecasting, quantile/conformal uncertainty estimation, and linear/mixed-integer schedule optimization (Python, LightGBM, SciPy/PuLP).
   - *Phase Focus:* Builds hybrid forecasting engine, backtesting suite, and schedule recommender (Phases 2–4).

3. **GIS & Remote Sensing Specialist (0.75 FTE):**
   - *Expertise:* PostGIS, QGIS, Sentinel-2 NDVI/NDWI processing, and command-area spatial delineation.
   - *Phase Focus:* Command-area mapping, satellite data pipelines, and spatial deficit layers (Phases 1–3).

4. **Full-Stack & Cloud Engineer (1 FTE):**
   - *Expertise:* Next.js/React, FastAPI, PostgreSQL, Docker, RBAC security, and offline-first PWA/alerting integrations.
   - *Phase Focus:* Dashboard UI, APIs, audit logging, and MeghRaj/cloud deployment (Phases 2–4).

5. **Field Operations & UX Liaison (0.5 FTE):**
   - *Expertise:* Rural/public-sector UX design, Assamese/bilingual operator workflows, and field training.
   - *Phase Focus:* Wireframe usability testing, operator/WUA onboarding, and field feedback collection (Phases 1, 3, 5).

**Indicative Manpower by Phase:**
- *Discovery & Design (Weeks 1–4):* 3.5 FTEs (Lead, GIS, UX, Full-Stack).
- *Prototype/MVP Build (Weeks 5–16):* 4.25 FTEs (all technical roles active).
- *UAT & Pilot Validation (Weeks 17–24):* 3.5 FTEs (Lead, UX Liaison, ML & Full-Stack for calibration/support).

---

## 9. Testing, validation & evidence

**Development & Automated Testing:**
- **Unit & Integration Tests:** Automated `pytest` suites validating FAO-56 $ET_0$ calculations, soil water-balance conservation, constraint satisfaction in schedule optimization (never exceeding canal/pump capacity), and FastAPI endpoint contracts.
- **Model Backtesting:** Rolling-origin cross-validation on 180-day synthetic multi-crop command-area data and public Assam weather time series, comparing hybrid ML+FAO-56 against static baseline schedules.
- **UI & Usability Testing:** End-to-end verification of dashboard rendering, uncertainty visualization, human-approval state transitions, and mobile responsiveness under simulated low-bandwidth (3G) conditions.

**Proposed Performance & Quality Measures (KPIs):**
1. **Forecast Accuracy:** Root Mean Square Error (RMSE) and Mean Absolute Percentage Error (MAPE $\le 12\%$) on 1–7 day scheme demand forecasts; 80% prediction interval empirical coverage within 75%–85%.
2. **Water-Use Efficiency (WUE) Gain:** $\ge 15\%$ reduction in avoidable over-irrigation during forecasted rainfall events compared to static baseline schedules.
3. **Equitable Delivery:** $\ge 20\%$ reduction in tail-end water-deficit days in simulated/pilot multi-reach command areas.
4. **Operational Adoption:** $\ge 80\%$ of recommended schedules reviewed/acted upon by authorized staff during pilot, with $< 3$ second dashboard load time.

**Evidence of Progress:**
Our working JalSankalp prototype already executes live demand forecasting, uncertainty quantification, and schedule comparison on simulated Assam Minor Irrigation schemes (420 ha Kamrup & 260 ha Nagaon synthetic pilots). On the 180-day synthetic backtest, the hybrid model achieved **3.51% MAPE** and **18.8% avoidable over-irrigation savings**, while all 6 automated `pytest` tests and browser UI checks passed. Verified simulation outputs, vector charts, test logs, and live UI screenshots are compiled in the attached Proof of Work PDF.

---

## 10. Security, privacy, safety & compliance

**Human-in-the-Loop Safety & Operational Governance:**
- **Strict Decision-Support Boundary:** In accordance with departmental requirements, JalSankalp **never** issues autonomous commands to canal gates or pumps. Every schedule recommendation requires explicit review and digital approval by an authorized Irrigation Department engineer/operator.
- **Override & Failsafe:** Engineers can override any recommendation with a mandatory reason code; if upstream weather/satellite feeds fail, the system automatically flags degraded confidence and falls back to safe agronomic baselines.

**Security & Access Control:**
- **Role-Based Access Control (RBAC):** Distinct permission tiers for *Irrigation Planners* (multi-scheme analytics), *Field Engineers* (schedule approval/editing), *Scheme Operators* (read-only bulletins + execution logging), and *WUA Representatives* (zone schedule view + field observations).
- **Data Protection:** TLS 1.3 encryption in transit, AES-256 encryption at rest, parameterized SQL queries, and strict API rate limiting.

**Privacy & Data Sovereignty:**
- **Minimal Personal Data:** System operates primarily on scheme, hydro-meteorological, and agronomic data. Farmer-level PII is not required; WUA/operator logins store only minimal role/contact metadata with consent.
- **Government Hosting Compliance:** Containerized architecture supports deployment on NIC MeghRaj / Assam State Data Centre, ensuring full data residency and compliance with Government of India IT Act and DPDP Act principles.

**Auditability & Interoperability:**
- **Immutable Audit Trail:** Every forecast run, input snapshot, model version, and human approval/override is logged with user ID and timestamp for departmental accountability.
- **Open Standards:** Uses OGC-compliant GeoJSON/PostGIS formats and REST/JSON APIs for interoperability with existing state WRIS/GIS portals.

---

## 11. Innovation & differentiation

**Core Novelty:**
1. **Physics-Informed Hybrid AI with Calibrated Uncertainty:** Pure ML models fail when historical logs are sparse or noisy, while pure physics models miss local seepage and operator behavior. JalSankalp fuses **FAO-56 water-balance physics** with **quantile ML residual learning**, delivering accurate forecasts even with limited historical data while surfacing explicit 80%/95% confidence bounds.
2. **Constraint-Aware Schedule Optimization (Not Just Forecasting):** Most tools stop at predicting crop water need. JalSankalp translates demand into **canal-capacity-feasible, equity-preserving release schedules** that engineers can compare side-by-side.
3. **Graceful Multi-Tier Data Degradation:** Operates seamlessly with satellite + public weather alone, and progressively improves as WUA check-ins or IoT soil-moisture sensors are added.

**Comparison with Existing Alternatives / Prior Art:**
- *Static Rotational Schedules / Spreadsheets:* Ignore live rainfall and crop-stage shifts; no uncertainty visibility.
- *Generic Weather/Agri Advisories (e.g., Meghdoot):* Provide district-level crop advisories for farmers, not scheme/canal-level volumetric water-release optimization for irrigation engineers.
- *Heavy SCADA/Hardware-First Systems:* Require expensive sensors and automated gates across every minor before delivering value; JalSankalp is software-first and immediately deployable on existing manual/semi-mechanized Assam MI schemes.

**IP & Technology Dependencies:**
- *Open-Source Core:* Built on permissively licensed open-source components (Python, FastAPI, LightGBM, SciPy, PostgreSQL/PostGIS, React/Next.js, Leaflet) — ensuring zero vendor lock-in for the Government of Assam.
- *Proprietary / Custom IP:* Domain-specific Assam crop-water calibration pipelines, hybrid uncertainty-quantification wrapper, and canal-equity optimization engine retained/licensed cleanly for departmental deployment.

---

## 12. Resources, risks & pilot validation

**Indicative Resource & Cost Drivers:**
1. **Engineering & Domain Manpower (Primary Driver, ~65%):** Software, ML, GIS, and water-resources engineering across the 24-week build and pilot.
2. **Cloud / Hosting & APIs (~15%):** Staging/production compute, PostGIS storage, and SMS/alert gateway credits (minimal cost using public weather/Sentinel-2 feeds).
3. **Field Onboarding, Training & Optional Low-Cost Sensors (~20%):** Field visits to pilot Assam MI schemes, Assamese/English training workshops for operators/WUAs, and optional reference rain-gauge/soil-moisture validation kits.

**Key Risks & Mitigations:**
- *Risk 1: Sparse or paper-based historical release data.*  
  *Mitigation:* Physics-based FAO-56 baseline + public satellite/weather data works from Day 1; ML calibration activates progressively as pilot logs accumulate.
- *Risk 2: Low digital adoption or connectivity at remote headworks.*  
  *Mitigation:* Offline-capable PWA, low-bandwidth mobile views, and concise SMS/WhatsApp-style daily release bulletins.
- *Risk 3: Operator distrust of "black-box" AI recommendations.*  
  *Mitigation:* Transparent input drivers, confidence intervals, side-by-side baseline comparison, and strict human-in-the-loop approval.
- *Risk 4: Unseasonal extreme rainfall / flood events.*  
  *Mitigation:* Automated rain-halt alerts and manual emergency override with reason logging.

**Pilot Validation Plan:**
Following MVP readiness (Week 20), JalSankalp will be pilot-validated across **2–3 representative Minor/Micro Irrigation schemes** in Assam featuring diverse crops (paddy + rabi vegetables/mustard). Using a 4-week shadow-mode baseline followed by active decision-support operation, we will measure forecast MAPE, avoided over-irrigation volume during rain events, tail-end water adequacy, and engineer/WUA satisfaction—producing a verified replication package for statewide rollout across Assam.
