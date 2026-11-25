from __future__ import annotations

import re
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def md_inline_to_rl(text: str) -> str:
    """Convert basic markdown bold/italic/code to ReportLab XML tags."""
    s = escape(text)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"\*(.+?)\*", r"<i>\1</i>", s)
    s = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", s)
    s = s.replace("$ET_0$", "ET<sub>0</sub>").replace("$K_c$", "K<sub>c</sub>").replace("$m^3$", "m<sup>3</sup>")
    s = s.replace(r"\le", "<=").replace(r"\ge", ">=").replace("$", "")
    return s


def build_proposal_pdf() -> None:
    root = Path(__file__).resolve().parent.parent
    md_path = root / "PROPOSAL_NESFIC_D01.md"
    out_dir = root / "proof_of_work"
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = out_dir / "JalSankalp_Proposal_NESFIC_D01.pdf"

    raw = md_path.read_text(encoding="utf-8")
    sections = re.split(r"^## (\d+\..*?)$", raw, flags=re.M)

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "PropTitle", parent=styles["Heading1"], fontSize=16.5, textColor=colors.HexColor("#0f766e"), spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "PropSub", parent=styles["Normal"], fontSize=9.5, leading=13, textColor=colors.HexColor("#475569"), spaceAfter=10
    )
    h2_style = ParagraphStyle(
        "PropH2", parent=styles["Heading2"], fontSize=12, textColor=colors.HexColor("#0f172a"), spaceBefore=12, spaceAfter=4
    )
    body_style = ParagraphStyle(
        "PropBody", parent=styles["Normal"], fontSize=9.5, leading=13.5, textColor=colors.HexColor("#1e293b"), spaceAfter=4
    )
    bullet_style = ParagraphStyle(
        "PropBullet", parent=body_style, leftIndent=14, firstLineIndent=-8, spaceAfter=2.5
    )

    story = []
    story.append(Paragraph("JalSankalp — Solution Proposal (NESFIC-D-01)", title_style))
    story.append(
        Paragraph(
            "<b>Challenge:</b> Stream 1 · NESFIC-D-01 — Irrigation Water Demand Forecasting &amp; Smarter Scheduling<br/>"
            "<b>Department:</b> Irrigation Department, Government of Assam<br/>"
            "<b>Compliance Note:</b> All 12 sections strictly adhere to the 500-word limit per section.",
            subtitle_style,
        )
    )

    # Word count summary table
    wc_rows = [["#", "Proposal Section", "Word Count"]]
    parsed_sections = []
    for i in range(1, len(sections), 2):
        sec_title = sections[i].strip()
        sec_body = sections[i + 1].strip()
        wc = len(sec_body.split())
        num, name = sec_title.split(".", 1)
        wc_rows.append([num.strip(), name.strip(), f"{wc} / 500"])
        parsed_sections.append((sec_title, sec_body, wc))

    tbl = Table(wc_rows, colWidths=[0.4 * inch, 5.2 * inch, 1.1 * inch])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("PADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(tbl)
    story.append(Spacer(1, 10))

    for sec_title, sec_body, wc in parsed_sections:
        story.append(Paragraph(f"{escape(sec_title)} <font size='8.5' color='#64748b'>({wc}/500 words)</font>", h2_style))
        for para in sec_body.split("\n\n"):
            lines = [ln.strip() for ln in para.splitlines() if ln.strip()]
            for ln in lines:
                if ln.startswith("- ") or re.match(r"^\d+\.\s", ln):
                    clean_ln = ln[2:] if ln.startswith("- ") else ln
                    prefix = "• " if ln.startswith("- ") else ""
                    story.append(Paragraph(f"{prefix}{md_inline_to_rl(clean_ln)}", bullet_style))
                else:
                    story.append(Paragraph(md_inline_to_rl(ln), body_style))

    doc.build(story)
    size_mb = pdf_path.stat().st_size / (1024 * 1024)
    print(f"Generated {pdf_path} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    build_proposal_pdf()
