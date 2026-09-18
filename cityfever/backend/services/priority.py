"""
CivicFlow — Explainable Priority Scoring Engine
=================================================
Member 4 | Rule-based operational priority for civic complaints.

Produces a transparent 0–100 score with human-readable reasons.

Scoring breakdown:
    Severity       0–40   (issue-type keyword mapping)
    Duration       0–20   (longer unresolved → higher urgency)
    Public impact  0–20   (public-facing locations like schools, hospitals)
    Safety risk    0–20   (safety-related keywords in text)
    ─────────────────────
    Total          0–100

Levels:
    0–30   Low
    31–60  Medium
    61–100 High

All weights/thresholds are configurable via the CONFIG dict.
"""

from __future__ import annotations
import re
from typing import Optional

# ────────────────────────────────────────────────────────────
# Configurable thresholds — change these without editing logic
# ────────────────────────────────────────────────────────────

CONFIG = {
    # Maximum points per dimension
    "max_severity": 40,
    "max_duration": 20,
    "max_public_impact": 20,
    "max_safety_risk": 20,

    # Level boundaries (inclusive upper)
    "low_upper": 30,
    "medium_upper": 60,
    # anything above medium_upper → High
}

# ────────────────────────────────────────────────────────────
# Severity mapping — issue_type → base severity score (0–40)
# ────────────────────────────────────────────────────────────

SEVERITY_MAP: dict[str, int] = {
    # High-severity infrastructure / health hazard
    "Sewage Overflow":       38,
    "Sewage Backup":         36,
    "Sewage Blockage":       34,
    "Water Contamination":   38,
    "Gas Leak":              40,
    "Sinkhole":              40,
    "Bridge Damage":         38,
    "Collapsed Structure":   40,

    # Moderate–high severity
    "Pothole":               30,
    "Road Damage":           28,
    "Road Crack":            24,
    "Water Leakage":         26,
    "Water Main Break":      34,
    "Pipe Burst":            32,
    "Flooding":              34,
    "Broken Street Light":   22,
    "Power Outage":          28,
    "Exposed Wire":          36,
    "Electrical Fault":      30,
    "Traffic Signal Down":   32,
    "Traffic Congestion":    18,

    # Moderate severity
    "Garbage Dump":          20,
    "Garbage Overflow":      22,
    "Illegal Dumping":       20,
    "Overflowing Bin":       18,
    "Drainage Block":        26,
    "Drainage Overflow":     28,
    "Stagnant Water":        24,
    "Mosquito Breeding":     26,

    # Lower severity
    "Park Maintenance":      12,
    "Broken Bench":          10,
    "Overgrown Vegetation":  10,
    "Tree Fall":             22,
    "Fallen Tree":           22,
    "Noise Complaint":       10,
    "Stray Animal":          14,
    "Graffiti":               8,
}

# Fallback when issue_type isn't in the map
_DEFAULT_SEVERITY = 15

# ────────────────────────────────────────────────────────────
# Safety-related keywords — presence adds safety risk points
# ────────────────────────────────────────────────────────────

SAFETY_KEYWORDS: list[tuple[str, int]] = [
    # (keyword/phrase, points contributed)
    ("children",        8),
    ("child",           8),
    ("kids",            8),
    ("school",         10),
    ("hospital",       10),
    ("elderly",         8),
    ("senior citizen",  8),
    ("accident",       10),
    ("injury",         10),
    ("injured",        10),
    ("dangerous",       8),
    ("hazard",          8),
    ("hazardous",       8),
    ("electric shock",  12),
    ("electrocution",   12),
    ("fire",            10),
    ("collapse",        10),
    ("collapsed",       10),
    ("emergency",       10),
    ("life threatening", 14),
    ("life-threatening", 14),
    ("death",           14),
    ("fatal",           14),
    ("toxic",           10),
    ("contaminated",    10),
    ("unsafe",           8),
    ("risk",             6),
    ("falling",          8),
]

# ────────────────────────────────────────────────────────────
# Public-impact keywords — public locations raise priority
# ────────────────────────────────────────────────────────────

PUBLIC_LOCATION_KEYWORDS: list[tuple[str, int]] = [
    ("school",          10),
    ("hospital",        10),
    ("clinic",           8),
    ("temple",           8),
    ("mosque",           8),
    ("church",           8),
    ("gurudwara",        8),
    ("market",           8),
    ("bazaar",           8),
    ("bus stop",         8),
    ("bus stand",        8),
    ("railway station",  8),
    ("metro station",    8),
    ("college",          8),
    ("university",       8),
    ("playground",       8),
    ("park",             6),
    ("garden",           6),
    ("main road",        8),
    ("highway",          8),
    ("national highway", 10),
    ("intersection",     8),
    ("crossing",         6),
    ("chowk",            8),
    ("square",           6),
    ("mall",             6),
    ("community hall",   8),
    ("government office", 8),
    ("police station",   8),
    ("fire station",     8),
    ("residential area", 6),
    ("colony",           6),
    ("society",          6),
    ("apartment",        6),
]


# ────────────────────────────────────────────────────────────
# Duration parsing helpers
# ────────────────────────────────────────────────────────────

def _parse_duration_hours(duration_text: str | None) -> float | None:
    """
    Convert a duration string into approximate hours.

    Examples:
        "3 days"       → 72.0
        "2 weeks"      → 336.0
        "5 hours"      → 5.0
        "since Monday" → None  (cannot resolve without date context)
    """
    if not duration_text:
        return None

    text = duration_text.lower().strip()

    # "X days/day"
    m = re.search(r"(\d+)\s*days?", text)
    if m:
        return float(m.group(1)) * 24.0

    # "X weeks/week"
    m = re.search(r"(\d+)\s*weeks?", text)
    if m:
        return float(m.group(1)) * 168.0

    # "X months/month"
    m = re.search(r"(\d+)\s*months?", text)
    if m:
        return float(m.group(1)) * 720.0

    # "X hours/hour/hrs/hr"
    m = re.search(r"(\d+)\s*(?:hours?|hrs?)", text)
    if m:
        return float(m.group(1))

    # "X minutes/min"
    m = re.search(r"(\d+)\s*(?:minutes?|mins?)", text)
    if m:
        return float(m.group(1)) / 60.0

    return None


def _duration_score(duration_text: str | None) -> tuple[int, str | None]:
    """
    Score 0–20 based on how long the issue has persisted.
    Returns (score, reason_or_None).
    """
    hours = _parse_duration_hours(duration_text)

    if hours is None:
        # If duration_text exists but couldn't be parsed numerically,
        # still give a small score for having *some* duration mention.
        if duration_text:
            return 6, f"Duration reported: {duration_text}"
        return 0, None

    if hours >= 168:           # 7+ days
        return 20, f"Reported duration exceeds 7 days ({duration_text})"
    if hours >= 72:            # 3+ days
        return 16, f"Reported duration exceeds 3 days ({duration_text})"
    if hours >= 48:            # 2+ days
        return 14, f"Reported duration exceeds 48 hours ({duration_text})"
    if hours >= 24:            # 1+ day
        return 12, f"Reported duration exceeds 24 hours ({duration_text})"
    if hours >= 6:
        return 8, f"Reported duration: {duration_text}"
    if hours >= 1:
        return 4, f"Reported duration: {duration_text}"

    return 2, f"Reported duration: {duration_text}"


# ────────────────────────────────────────────────────────────
# Keyword-matching helpers
# ────────────────────────────────────────────────────────────

def _keyword_score(
    text: str,
    keywords: list[tuple[str, int]],
    max_points: int,
) -> tuple[int, list[str]]:
    """
    Scan *text* for keyword matches, accumulate points up to *max_points*.
    Returns (capped_score, list_of_matched_keywords).
    """
    text_lower = text.lower()
    total = 0
    matched: list[str] = []

    for keyword, points in keywords:
        if keyword in text_lower:
            total += points
            matched.append(keyword)

    return min(total, max_points), matched


# ────────────────────────────────────────────────────────────
# Main public function
# ────────────────────────────────────────────────────────────

def calculate_priority(
    text: str,
    issue_type: str,
    duration_text: str | None = None,
    locality: str | None = None,
) -> dict:
    """
    Calculate an explainable priority score for a civic complaint.

    Parameters
    ----------
    text : str
        Full complaint text.
    issue_type : str
        Classified issue type (e.g. "Pothole", "Sewage Overflow").
    duration_text : str | None
        Extracted duration string (e.g. "3 days", "since Monday").
    locality : str | None
        Extracted locality name (e.g. "Krishna Nagar").

    Returns
    -------
    dict with keys:
        priority_score   : int   (0–100)
        priority_level   : str   ("Low" | "Medium" | "High")
        priority_reasons : list[str]
        breakdown        : dict  (per-dimension scores for transparency)
    """
    reasons: list[str] = []
    combined_text = text
    if locality:
        combined_text = f"{text} {locality}"

    # ── 1. Severity (0–40) ──────────────────────────────────
    severity = SEVERITY_MAP.get(issue_type, _DEFAULT_SEVERITY)
    severity = min(severity, CONFIG["max_severity"])
    if severity >= 30:
        reasons.append(f"High-severity issue type: {issue_type}")
    elif severity >= 20:
        reasons.append(f"Moderate-severity issue type: {issue_type}")
    else:
        reasons.append(f"Issue type: {issue_type}")

    # ── 2. Duration (0–20) ──────────────────────────────────
    dur_score, dur_reason = _duration_score(duration_text)
    dur_score = min(dur_score, CONFIG["max_duration"])
    if dur_reason:
        reasons.append(dur_reason)

    # ── 3. Public impact (0–20) ─────────────────────────────
    pub_score, pub_matched = _keyword_score(
        combined_text,
        PUBLIC_LOCATION_KEYWORDS,
        CONFIG["max_public_impact"],
    )
    if pub_matched:
        locations_str = ", ".join(pub_matched[:3])   # cap display
        reasons.append(f"Public location detected: {locations_str}")

    # ── 4. Safety risk (0–20) ───────────────────────────────
    safety_score, safety_matched = _keyword_score(
        combined_text,
        SAFETY_KEYWORDS,
        CONFIG["max_safety_risk"],
    )
    if safety_matched:
        reasons.append("Safety-related infrastructure issue")

    # ── Total ───────────────────────────────────────────────
    total = severity + dur_score + pub_score + safety_score
    total = max(0, min(total, 100))

    # ── Level ───────────────────────────────────────────────
    if total <= CONFIG["low_upper"]:
        level = "Low"
    elif total <= CONFIG["medium_upper"]:
        level = "Medium"
    else:
        level = "High"

    return {
        "priority_score": total,
        "priority_level": level,
        "priority_reasons": reasons,
        "breakdown": {
            "severity": severity,
            "duration": dur_score,
            "public_impact": pub_score,
            "safety_risk": safety_score,
        },
    }
