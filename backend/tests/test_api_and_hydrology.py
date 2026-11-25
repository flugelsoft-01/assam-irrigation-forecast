from fastapi.testclient import TestClient

from app.hydrology import (
    compute_effective_rainfall,
    compute_fao56_et0,
    get_crop_kc,
)
from app.main import app

client = TestClient(app)


def test_fao56_et0_bounds():
    et0 = compute_fao56_et0(
        t_min_c=20.0, t_max_c=30.0, humidity_pct=75.0, wind_ms=1.5, solar_mj_m2=17.0, elevation_m=56.0
    )
    assert 2.0 <= et0 <= 7.0


def test_crop_kc_progression():
    kc_init = get_crop_kc("Mustard", growth_day=10, ndvi=0.45)
    kc_mid = get_crop_kc("Mustard", growth_day=50, ndvi=0.68)
    assert kc_mid > kc_init


def test_effective_rainfall_monotonic():
    assert compute_effective_rainfall(1.0) == 0.0
    r10 = compute_effective_rainfall(10.0)
    r30 = compute_effective_rainfall(30.0)
    assert 0.0 < r10 < r30


def test_api_schemes_and_forecast():
    r = client.get("/api/schemes")
    assert r.status_code == 200
    schemes = r.json()
    assert len(schemes) >= 2
    sid = schemes[0]["id"]

    rf = client.get(f"/api/forecast/{sid}?days=7")
    assert rf.status_code == 200
    fdata = rf.json()
    assert len(fdata["scheme_daily"]) == 7
    for day in fdata["scheme_daily"]:
        assert day["ci_95_low_m3"] <= day["ci_80_low_m3"] <= day["gross_demand_m3"]
        assert day["gross_demand_m3"] <= day["ci_80_high_m3"] <= day["ci_95_high_m3"]


def test_schedule_capacity_and_approval_audit():
    schemes = client.get("/api/schemes").json()
    sid = schemes[0]["id"]
    cap = schemes[0]["canal_capacity_m3_day"]

    rs = client.get(f"/api/schedules/{sid}")
    assert rs.status_code == 200
    sdata = rs.json()
    assert len(sdata["options"]) == 3
    for opt in sdata["options"]:
        for rel in opt["daily_releases_m3"]:
            assert 0.0 <= rel <= cap

    ra = client.post(
        "/api/approve",
        json={
            "scheme_id": sid,
            "strategy_id": "balanced-equity",
            "engineer_name": "A. Borah (AE)",
            "role": "Assistant Engineer",
            "action": "approve",
            "rationale": "Automated pytest verification approval",
        },
    )
    assert ra.status_code == 200
    assert ra.json()["engineer_name"] == "A. Borah (AE)"


def test_180_day_simulation():
    schemes = client.get("/api/schemes").json()
    sid = schemes[0]["id"]
    r = client.get(f"/api/simulation/{sid}")
    assert r.status_code == 200
    sim = r.json()
    assert sim["simulation_days"] == 180
    assert sim["forecast_mape_pct"] < 15.0
    assert sim["avoidable_over_irrigation_saved_m3"] > 0.0
