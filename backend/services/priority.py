"""
Plug point for Member 4's explainable priority engine.

CONTRACT (do not change):
    score(department: str, issue_type: str, duration_text: str | None,
          text: str) -> {
        "priority_score": int,      # 0-100
        "priority_level": str,      # "Low" | "Medium" | "High"
    }

Placeholder implementation: a transparent, rule-based 100-point score
matching the breakdown in Member 4's instructions
(Severity 0-40, Duration 0-20, Public impact 0-20, Safety risk 0-20).
Replace the body with Member 4's real logic — keep the same signature and
keep priority_level derived with the same thresholds (0-30 Low, 31-60
Medium, 61-100 High) so the frontend/analytics can rely on it.
"""

_HIGH_SEVERITY_DEPARTMENTS = {"Public Safety", "Electrical", "Drainage"}
_SAFETY_KEYWORDS = ["accident", "unsafe", "exposed wire", "collapse", "fire"]


def score(department: str, issue_type: str, duration_text: str | None, text: str) -> dict:
    lowered = text.lower()

    severity = 30 if department in _HIGH_SEVERITY_DEPARTMENTS else 18

    duration_score = 0
    if duration_text:
        if "month" in duration_text.lower():
            duration_score = 20
        elif "week" in duration_text.lower():
            duration_score = 14
        elif "day" in duration_text.lower():
            duration_score = 8

    public_impact = 15 if department in {"Water", "Sanitation", "Drainage", "Roads"} else 8

    safety_risk = 20 if any(kw in lowered for kw in _SAFETY_KEYWORDS) else 5

    total = min(severity + duration_score + public_impact + safety_risk, 100)

    if total <= 30:
        level = "Low"
    elif total <= 60:
        level = "Medium"
    else:
        level = "High"

    return {"priority_score": total, "priority_level": level}
