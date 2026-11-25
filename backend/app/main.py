from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import List
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .data_store import (
    AUDIT_LOGS,
    FIELD_OBSERVATIONS,
    get_synthetic_schemes,
)
from .hydrology import HybridDemandForecaster
from .models import (
    AlertItem,
    ApprovalRequest,
    AuditLogEntry,
    FieldObservationEntry,
    FieldObservationRequest,
    ForecastResponse,
    ScheduleComparisonResponse,
    SchemeSummary,
    SimulationMetrics,
)
from .optimizer import generate_schedule_options

app = FastAPI(
    title="JalSankalp API — NESFIC-D-01",
    description="Irrigation Water Demand Forecasting & Smarter Scheduling Decision-Support API (Assam)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCHEMES = get_synthetic_schemes()
FORECASTER = HybridDemandForecaster()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "JalSankalp Forecasting API", "version": "1.0.0"}


@app.get("/api/schemes", response_model=List[SchemeSummary])
def list_schemes() -> List[SchemeSummary]:
    return list(SCHEMES.values())


@app.get("/api/forecast/{scheme_id}", response_model=ForecastResponse)
def get_forecast(scheme_id: str, days: int = 7) -> ForecastResponse:
    scheme = SCHEMES.get(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return FORECASTER.forecast_scheme(scheme, days=max(3, min(14, days)))


@app.get("/api/schedules/{scheme_id}", response_model=ScheduleComparisonResponse)
def get_schedules(scheme_id: str) -> ScheduleComparisonResponse:
    scheme = SCHEMES.get(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    forecast = FORECASTER.forecast_scheme(scheme, days=7)
    return generate_schedule_options(scheme, forecast)


@app.post("/api/approve", response_model=AuditLogEntry)
def submit_approval(req: ApprovalRequest) -> AuditLogEntry:
    if req.scheme_id not in SCHEMES:
        raise HTTPException(status_code=404, detail="Scheme not found")
    entry = AuditLogEntry(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now().isoformat(timespec="seconds"),
        scheme_id=req.scheme_id,
        strategy_id=req.strategy_id,
        engineer_name=req.engineer_name,
        role=req.role,
        action=req.action,
        override_m3_day=req.override_m3_day,
        rationale=req.rationale,
    )
    AUDIT_LOGS.insert(0, entry)
    return entry


@app.get("/api/audit/{scheme_id}", response_model=List[AuditLogEntry])
def list_audit_logs(scheme_id: str) -> List[AuditLogEntry]:
    return [a for a in AUDIT_LOGS if a.scheme_id == scheme_id]


@app.post("/api/observations", response_model=FieldObservationEntry)
def add_observation(req: FieldObservationRequest) -> FieldObservationEntry:
    if req.scheme_id not in SCHEMES:
        raise HTTPException(status_code=404, detail="Scheme not found")
    entry = FieldObservationEntry(
        id=f"obs-{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now().isoformat(timespec="seconds"),
        **req.model_dump(),
    )
    FIELD_OBSERVATIONS.insert(0, entry)
    return entry


@app.get("/api/observations/{scheme_id}", response_model=List[FieldObservationEntry])
def list_observations(scheme_id: str) -> List[FieldObservationEntry]:
    return [o for o in FIELD_OBSERVATIONS if o.scheme_id == scheme_id]


@app.get("/api/alerts/{scheme_id}", response_model=List[AlertItem])
def get_alerts(scheme_id: str) -> List[AlertItem]:
    scheme = SCHEMES.get(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    forecast = FORECASTER.forecast_scheme(scheme, days=7)

    alerts: List[AlertItem] = []
    # Rain halt alert if any day has >= 15 mm
    rain_days = [d for d in forecast.weather_days if d.rainfall_mm >= 15.0]
    if rain_days:
        rd = rain_days[0]
        alerts.append(
            AlertItem(
                id="al-rain-01",
                severity="high",
                category="Rain-Halt Advisory",
                title=f"Reduce Headworks Release on {rd.date}",
                message=f"Forecasted rainfall of {rd.rainfall_mm} mm ({rd.effective_rainfall_mm} mm effective) reduces net command demand by >30%.",
                recommended_action="Switch to Water-Saving or Balanced Equity schedule to avoid over-irrigation.",
            )
        )

    # Tail reach depletion alert
    tail_zones = [z for z in scheme.zones if z.reach == "tail" and z.current_depletion_mm > 0.75 * z.raw_mm]
    for tz in tail_zones:
        alerts.append(
            AlertItem(
                id=f"al-tail-{tz.id}",
                severity="medium",
                category="Tail-End Deficit Risk",
                title=f"Priority Allocation Needed: {tz.name}",
                message=f"Root-zone depletion is {tz.current_depletion_mm} mm ({round(tz.current_depletion_mm/tz.raw_mm*100)}% of RAW) during {tz.crop_stage}.",
                zone_id=tz.id,
                recommended_action="Allocate rotational priority in Days 1–2 before mid-week rainfall.",
            )
        )

    alerts.append(
        AlertItem(
            id="al-hitl-01",
            severity="info",
            category="Decision-Support Governance",
            title="Human-in-the-Loop Approval Required",
            message="All forecasts and schedules are advisory only. Authorized Irrigation Dept. staff must review and approve before gate operation.",
            recommended_action="Review Schedule Comparator and log approval.",
        )
    )
    return alerts


@app.get("/api/simulation/{scheme_id}", response_model=SimulationMetrics)
def get_simulation(scheme_id: str) -> SimulationMetrics:
    scheme = SCHEMES.get(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return FORECASTER.run_180_day_simulation(scheme)


_FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if _FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(_FRONTEND_DIST), html=True), name="frontend")
