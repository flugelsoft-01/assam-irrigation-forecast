from __future__ import annotations

import json
from pathlib import Path

from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.shapes import Drawing, String
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.data_store import get_synthetic_schemes
from app.hydrology import HybridDemandForecaster
from app.optimizer import generate_schedule_options


def make_vector_forecast_drawing(forecast) -> Drawing:
    d = Drawing(490, 185)
    lp = LinePlot()
    lp.x = 45
    lp.y = 28
    lp.height = 135
    lp.width = 430

    days = forecast.scheme_daily
    n = len(days)
    series_forecast = [(i, days[i].gross_demand_m3) for i in range(n)]
    series_baseline = [(i, days[i].baseline_static_m3) for i in range(n)]
    series_ci80_h = [(i, days[i].ci_80_high_m3) for i in range(n)]
    series_ci80_l = [(i, days[i].ci_80_low_m3) for i in range(n)]

    lp.data = [series_forecast, series_baseline, series_ci80_h, series_ci80_l]
    lp.lines[0].strokeColor = colors.HexColor("#0f766e")
    lp.lines[0].strokeWidth = 2.2
    lp.lines[1].strokeColor = colors.HexColor("#64748b")
    lp.lines[1].strokeWidth = 1.5
    lp.lines[1].strokeDashArray = [4, 3]
    lp.lines[2].strokeColor = colors.HexColor("#38bdf8")
    lp.lines[2].strokeWidth = 1.0
    lp.lines[3].strokeColor = colors.HexColor("#38bdf8")
    lp.lines[3].strokeWidth = 1.0

    lp.xValueAxis.valueMin = 0
    lp.xValueAxis.valueMax = n - 1
    lp.xValueAxis.valueStep = 1
    lp.xValueAxis.labelTextFormat = lambda idx: days[int(idx)].date[5:] if 0 <= int(idx) < n else ""
    lp.xValueAxis.labels.fontSize = 7.5

    lp.yValueAxis.valueMin = 0
    lp.yValueAxis.valueMax = 35000
    lp.yValueAxis.valueStep = 7000
    lp.yValueAxis.labels.fontSize = 7.5

    d.add(lp)
    d.add(String(45, 170, "7-Day Command Demand Forecast (Teal) vs. Static Baseline (Dashed) & 80% CI (Blue)", fontSize=8.5, fillColor=colors.HexColor("#0f172a")))
    return d


def make_vector_backtest_drawing(sim) -> Drawing:
    d = Drawing(490, 175)
    lp = LinePlot()
    lp.x = 45
    lp.y = 25
    lp.height = 128
    lp.width = 430

    s = sim.sample_series
    series_pred = [(r["day"], r["predicted_m3"]) for r in s]
    series_true = [(r["day"], r["true_demand_m3"]) for r in s]
    series_stat = [(r["day"], r["static_release_m3"]) for r in s]

    lp.data = [series_pred, series_true, series_stat]
    lp.lines[0].strokeColor = colors.HexColor("#0f766e")
    lp.lines[0].strokeWidth = 2.0
    lp.lines[1].strokeColor = colors.HexColor("#0284c7")
    lp.lines[1].strokeWidth = 1.4
    lp.lines[2].strokeColor = colors.HexColor("#94a3b8")
    lp.lines[2].strokeWidth = 1.4
    lp.lines[2].strokeDashArray = [4, 3]

    lp.xValueAxis.valueMin = 1
    lp.xValueAxis.valueMax = 30
    lp.xValueAxis.valueStep = 5
    lp.xValueAxis.labels.fontSize = 7.5

    lp.yValueAxis.valueMin = 0
    lp.yValueAxis.valueMax = 35000
    lp.yValueAxis.valueStep = 7000
    lp.yValueAxis.labels.fontSize = 7.5

    d.add(lp)
    d.add(String(45, 160, "180-Day Backtest (30-Day Sample): JalSankalp Forecast (Teal), Sim Demand (Blue), Static (Dashed)", fontSize=8.5, fillColor=colors.HexColor("#0f172a")))
    return d


def build_pdf() -> None:
    root = Path(__file__).resolve().parent.parent
    pow_dir = root / "proof_of_work"
    pow_dir.mkdir(parents=True, exist_ok=True)

    schemes = get_synthetic_schemes()
    scheme = schemes["assam-mi-kamrup-01"]
    forecaster = HybridDemandForecaster()
    forecast = forecaster.forecast_scheme(scheme, days=7)
    schedules = generate_schedule_options(scheme, forecast)
    sim = forecaster.run_180_day_simulation(scheme)

    bal = [o for o in schedules.options if o.strategy_id == "balanced-equity"][0]
    m = {
        "scheme_name": scheme.name,
        "forecast_7d_m3": round(sum(d.gross_demand_m3 for d in forecast.scheme_daily), 1),
        "baseline_7d_m3": round(sum(d.baseline_static_m3 for d in forecast.scheme_daily), 1),
        "water_saved_pct": bal.water_saved_pct,
        "water_saved_m3": bal.water_saved_m3,
        "tail_adequacy_pct": bal.tail_end_adequacy_pct,
        "sim_mape_pct": sim.forecast_mape_pct,
        "sim_rmse_m3": sim.forecast_rmse_m3,
        "sim_ci80_cov_pct": sim.ci_80_coverage_pct,
        "sim_over_saved_m3": sim.avoidable_over_irrigation_saved_m3,
        "sim_over_red_pct": sim.over_irrigation_reduction_pct,
        "static_tail_def_days": sim.static_tail_deficit_days,
        "smart_tail_def_days": sim.smart_tail_deficit_days,
        "tail_def_red_pct": sim.tail_deficit_reduction_pct,
    }
    (pow_dir / "verified_metrics.json").write_text(json.dumps(m, indent=2))

    pdf_path = pow_dir / "JalSankalp_Proof_of_Work_NESFIC_D01.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleCustom", parent=styles["Heading1"], fontSize=17, textColor=colors.HexColor("#0f766e"), spaceAfter=6
    )
    h2_style = ParagraphStyle(
        "H2Custom", parent=styles["Heading2"], fontSize=12.5, textColor=colors.HexColor("#0f172a"), spaceBefore=10, spaceAfter=4
    )
    body_style = ParagraphStyle(
        "BodyCustom", parent=styles["Normal"], fontSize=9.5, leading=13, textColor=colors.HexColor("#334155")
    )

    story = []
    story.append(Paragraph("JalSankalp — Proof of Work &amp; Solution Evidence", title_style))
    story.append(
        Paragraph(
            "<b>Challenge:</b> Stream 1 · NESFIC-D-01 — Irrigation Water Demand Forecasting &amp; Smarter Scheduling (Irrigation Department, Government of Assam)<br/>"
            "<b>Data Transparency Note:</b> Prototype validated using public FAO-56 agronomic models, synthetic Assam weather, and clearly labelled synthetic Minor Irrigation scheme profiles (no unconfirmed departmental data assumed).",
            body_style,
        )
    )
    story.append(Spacer(1, 8))

    story.append(Paragraph("1. Implemented MVP Architecture &amp; Capabilities", h2_style))
    story.append(
        Paragraph(
            "We built a working full-stack decision-support application (Python FastAPI + SciPy/Scikit-Learn + React/TypeScript + Leaflet GIS + Recharts) delivering all four core capabilities requested by the Irrigation Department:<br/>"
            "• <b>Command-Area Demand Forecasting:</b> FAO-56 Penman-Monteith ET0 + crop-coefficient (Kc) water balance combined with Quantile Gradient Boosting for 80% and 95% confidence bounds.<br/>"
            "• <b>Constrained Schedule Optimizer &amp; Comparator:</b> SciPy linear programming generates Water-Saving, Balanced Equity, and Peak-Yield schedules vs. Static Baseline within canal capacity.<br/>"
            "• <b>Explainability &amp; Alerts:</b> Surfacing input drivers, rain-halt advisories, and tail-reach deficit warnings.<br/>"
            "• <b>Human-in-the-Loop Governance:</b> Strict advisory boundary requiring authorized Irrigation Department staff approval/override with an immutable audit log and WUA field check-in.",
            body_style,
        )
    )
    story.append(Spacer(1, 6))

    story.append(Paragraph("2. Verified Prototype &amp; 180-Day Simulation Results", h2_style))
    table_data = [
        ["Metric / Benchmark", "Observed Result", "Notes"],
        ["7-Day Smart Forecast vs. Static Baseline", f"{m['forecast_7d_m3']:,.0f} m3 vs. {m['baseline_7d_m3']:,.0f} m3", f"Saves {m['water_saved_pct']}% ({m['water_saved_m3']:,.0f} m3) via rain deferral"],
        ["Tail-Reach Delivery Adequacy (7-Day)", f"{m['tail_adequacy_pct']}%", "Balanced Equity schedule prioritizes tail mustard"],
        ["180-Day Backtest Forecast MAPE / RMSE", f"{m['sim_mape_pct']}% / {m['sim_rmse_m3']:,.1f} m3/d", "Evaluated on 180-day synthetic Assam MI series"],
        ["80% Confidence Interval Coverage", f"{m['sim_ci80_cov_pct']}%", "Calibrated uncertainty bounds"],
        ["Avoidable Over-Irrigation Saved (180d)", f"{m['sim_over_saved_m3']:,.0f} m3 ({m['sim_over_red_pct']}%)", "Reduction during >5 mm rainfall days"],
        ["Tail-Reach Deficit Days (180d)", f"{m['smart_tail_def_days']} vs. {m['static_tail_def_days']} static", f"{m['tail_def_red_pct']}% reduction in tail stress days"],
    ]
    tbl = Table(table_data, colWidths=[2.3 * inch, 1.9 * inch, 2.8 * inch])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(tbl)
    story.append(Spacer(1, 8))

    story.append(make_vector_forecast_drawing(forecast))
    story.append(Spacer(1, 6))
    story.append(make_vector_backtest_drawing(sim))

    screenshots_dir = pow_dir / "screenshots"
    shot_files = sorted(screenshots_dir.glob("*.png")) if screenshots_dir.exists() else []
    if shot_files:
        story.append(PageBreak())
        story.append(Paragraph("3. Live Application Verification Screenshot", h2_style))
        for sf in shot_files[:2]:
            story.append(Paragraph(f"<b>Verified View:</b> {sf.stem.replace('_', ' ').title()}", body_style))
            story.append(Spacer(1, 4))
            story.append(Image(str(sf), width=6.8 * inch, height=4.1 * inch))
            story.append(Spacer(1, 10))

    pytest_log = pow_dir / "pytest_output.txt"
    if pytest_log.exists():
        story.append(Paragraph("4. Automated Verification &amp; Test Suite Evidence", h2_style))
        log_txt = pytest_log.read_text().strip().replace("\n", "<br/>")
        story.append(Paragraph(f"<font name='Courier' size='8'>{log_txt}</font>", body_style))

    doc.build(story)
    size_mb = pdf_path.stat().st_size / (1024 * 1024)
    print(f"Generated {pdf_path} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    build_pdf()
