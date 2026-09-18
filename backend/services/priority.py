"""
Plug point for Member 4's explainable priority engine.

CONTRACT (do not change):
    score(department: str, issue_type: str, duration_text: str | None,
          text: str) -> {
        "priority_score": int,          # 0-100
        "priority_level": str,          # "Low" | "Medium" | "High"
        "priority_reasons": list[str],  # human-readable justifications
    }

Placeholder implementation: a transparent, rule-based 100-point score
matching the breakdown in Member 4's instructions
(Severity 0-40, Duration 0-20, Public impact 0-20, Safety risk 0-20), with a
plain-English reason recorded for each sub-score that contributed. Replace
the body with Member 4's real logic — keep the same signature and keep
priority_level derived with the same thresholds (0-30 Low, 31-60 Medium,
61-100 High) per docs/API_CONTRACT.md.
"""

_HIGH_SEVERITY_DEPARTMENTS = {"Public Safety", "Electrical", "Drainage"}
_SAFETY_KEYWORDS = ["accident", "unsafe", "exposed wire", "collapse", "fire"]
_PUBLIC_IMPACT_DEPARTMENTS = {"Water", "Sanitation", "Drainage", "Roads"}


def score(department: str, issue_type: str, duration_text: str | None, text: str) -> dict:
    lowered = text.lower()
    reasons = []

    if department in _HIGH_SEVERITY_DEPARTMENTS:
        severity = 30
        reasons.append(f"High-severity department: {department}")
    else:
        severity = 18
        reasons.append(f"Standard-severity issue type: {issue_type}")

    duration_score = 0
    if duration_text:
        lowered_duration = duration_text.lower()
        if "month" in lowered_duration:
            duration_score = 20
        elif "week" in lowered_duration:
            duration_score = 14
        elif "day" in lowered_duration:
            duration_score = 8
        if duration_score:
            reasons.append(f"Reported duration: {duration_text}")

    if department in _PUBLIC_IMPACT_DEPARTMENTS:
        public_impact = 15
        reasons.append(f"Public-facing infrastructure department: {department}")
    else:
        public_impact = 8

    safety_hit = next((kw for kw in _SAFETY_KEYWORDS if kw in lowered), None)
    if safety_hit:
        safety_risk = 20
        reasons.append(f"Safety risk keyword detected: '{safety_hit}'")
    else:
        safety_risk = 5

    total = min(severity + duration_score + public_impact + safety_risk, 100)

    if total <= 30:
        level = "Low"
    elif total <= 60:
        level = "Medium"
    else:
        level = "High"

    return {
        "priority_score": total,
        "priority_level": level,
        "priority_reasons": reasons,
    }
