"""
Plug point for Member 1's ML module.

CONTRACT (do not change):
    predict(text: str) -> {
        "department": str,
        "department_confidence": float,
        "issue_type": str,
        "issue_confidence": float,
    }

This file currently contains a placeholder keyword-based classifier so the
backend runs and returns realistic-looking data end-to-end *before* Member 1's
real model exists. When Member 1 hands off their model:
  1. Drop their model file(s) in this services/ folder (or a models/ subfolder).
  2. Replace the body of predict() below with a call into their code.
  3. Do NOT change the function name, its input type, or the output keys —
     routes/complaints.py only calls predict(text) and reads these exact keys.
"""

import random

_DEPARTMENTS = {
    "Roads": ["pothole", "road", "footpath", "pavement", "speed breaker"],
    "Water": ["water", "leak", "pipeline", "supply", "tap"],
    "Sanitation": ["garbage", "trash", "waste", "dump", "sweeping"],
    "Electrical": ["streetlight", "electricity", "wire", "transformer", "power cut"],
    "Drainage": ["drain", "sewage", "manhole", "overflow", "clogged"],
    "Traffic": ["signal", "traffic", "parking", "encroachment"],
    "Public Safety": ["unsafe", "accident", "crime", "harassment"],
}

_ISSUE_TYPES = {
    "Roads": "Pothole",
    "Water": "Water Leakage",
    "Sanitation": "Garbage Overflow",
    "Electrical": "Streetlight Fault",
    "Drainage": "Drain Blockage",
    "Traffic": "Signal Malfunction",
    "Public Safety": "Safety Hazard",
}


def predict(text: str) -> dict:
    """Placeholder classifier: keyword match + a plausible confidence score.

    Real implementation (Member 1) should load a trained TF-IDF+LogReg (or
    SVM) model and return predict_proba-derived confidences instead of the
    random.uniform() calls below.
    """
    lowered = text.lower()

    best_department = "General Complaints"
    best_hits = 0
    for dept, keywords in _DEPARTMENTS.items():
        hits = sum(1 for kw in keywords if kw in lowered)
        if hits > best_hits:
            best_hits = hits
            best_department = dept

    if best_hits == 0:
        # No keyword matched at all -> deliberately low confidence so the
        # "Manual Review" rule in routes/complaints.py actually gets exercised.
        return {
            "department": "General Complaints",
            "department_confidence": round(random.uniform(0.30, 0.55), 2),
            "issue_type": "Other",
            "issue_confidence": round(random.uniform(0.30, 0.55), 2),
        }

    return {
        "department": best_department,
        "department_confidence": round(random.uniform(0.75, 0.97), 2),
        "issue_type": _ISSUE_TYPES.get(best_department, "Other"),
        "issue_confidence": round(random.uniform(0.70, 0.95), 2),
    }
