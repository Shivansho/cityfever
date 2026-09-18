"""
CivicFlow — Complaint Classification Service
============================================
Member 1 Contract Interface | Routes complaints to department & issue type.

Loads trained models from ml/models/ if available; otherwise uses a high-accuracy
rule-based fallback so the entire pipeline works out-of-the-box.
"""

from __future__ import annotations
import os
from typing import Any

# Default confidence when rule-based fallback matches
_FALLBACK_HIGH_CONF = 0.92
_FALLBACK_DEFAULT_CONF = 0.70

# Keyword heuristics for fallback classifier
_DEPARTMENT_RULES = {
    "Sewage": ["sewage", "sewer", "drainage", "drain", "manhole", "gutter", "overflowing sewer"],
    "Water": ["water", "pipeline", "pipe burst", "contamination", "leakage", "water supply", "drinking water"],
    "Roads": ["pothole", "road", "tar", "asphalt", "crater", "speed breaker", "footpath", "divider", "pavement"],
    "Electricity": ["streetlight", "street light", "power cut", "outage", "wire", "transformer", "electric shock", "spark"],
    "Sanitation": ["garbage", "trash", "waste", "dump", "bin", "litter", "debris", "dead animal"],
    "Traffic": ["traffic", "signal", "traffic light", "jam", "congestion", "parking", "encroachment"],
    "Health": ["mosquito", "dengue", "malaria", "stagnant water", "toxic", "epidemic", "hospital"],
}

_ISSUE_TYPE_RULES = {
    "Sewage Overflow": ["sewage overflow", "sewer overflow", "overflowing sewage", "manhole overflow"],
    "Sewage Blockage": ["sewage block", "sewer block", "blocked drain", "choked drain"],
    "Pothole": ["pothole", "crater", "damaged road"],
    "Road Damage": ["road crack", "broken road", "sinkhole", "collapsed road"],
    "Water Leakage": ["water leak", "pipeline leak", "pipe burst"],
    "Water Contamination": ["contaminated water", "dirty water", "smelly water", "toxic water"],
    "Broken Street Light": ["street light", "streetlight", "light not working", "dark street"],
    "Power Outage": ["power cut", "power outage", "no electricity", "transformer burst"],
    "Exposed Wire": ["exposed wire", "hanging wire", "loose wire", "electric shock"],
    "Garbage Dump": ["garbage dump", "dumping", "overflowing bin", "garbage not collected", "trash pile"],
    "Drainage Overflow": ["drain overflow", "stagnant water", "flooding"],
    "Traffic Signal Down": ["signal down", "traffic light not working", "traffic signal broken"],
}

# Optional ML model artifacts
_DEP_MODEL = None
_DEP_VECT = None
_ISSUE_MODEL = None
_ISSUE_VECT = None
_MODELS_LOADED = False


def _try_load_ml_models():
    """Attempt to load scikit-learn models from ml/models/ and ml/vectorizers/."""
    global _DEP_MODEL, _DEP_VECT, _ISSUE_MODEL, _ISSUE_VECT, _MODELS_LOADED
    if _MODELS_LOADED:
        return

    try:
        import joblib
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        dep_m_path = os.path.join(base_dir, "ml", "models", "department_model.joblib")
        dep_v_path = os.path.join(base_dir, "ml", "vectorizers", "department_vectorizer.joblib")
        iss_m_path = os.path.join(base_dir, "ml", "models", "issue_model.joblib")
        iss_v_path = os.path.join(base_dir, "ml", "vectorizers", "issue_vectorizer.joblib")

        if os.path.exists(dep_m_path) and os.path.exists(dep_v_path):
            _DEP_MODEL = joblib.load(dep_m_path)
            _DEP_VECT = joblib.load(dep_v_path)
        if os.path.exists(iss_m_path) and os.path.exists(iss_v_path):
            _ISSUE_MODEL = joblib.load(iss_m_path)
            _ISSUE_VECT = joblib.load(iss_v_path)

        _MODELS_LOADED = True
    except Exception:
        _MODELS_LOADED = False


def predict_complaint(text: str) -> dict[str, Any]:
    """
    Classify a complaint into department and issue type with confidence metrics.

    Parameters
    ----------
    text : str
        The raw citizen complaint text.

    Returns
    -------
    dict
        {
            "department": str,
            "issue_type": str,
            "department_confidence": float,
            "issue_confidence": float
        }
    """
    _try_load_ml_models()

    # 1. If trained ML models are present, use them
    if _DEP_MODEL and _DEP_VECT:
        try:
            feats = _DEP_VECT.transform([text])
            dep_pred = _DEP_MODEL.predict(feats)[0]
            if hasattr(_DEP_MODEL, "predict_proba"):
                probs = _DEP_MODEL.predict_proba(feats)[0]
                dep_conf = float(max(probs))
            else:
                dep_conf = 0.90

            issue_pred = "General Infrastructure"
            issue_conf = 0.85
            if _ISSUE_MODEL and _ISSUE_VECT:
                iss_feats = _ISSUE_VECT.transform([text])
                issue_pred = _ISSUE_MODEL.predict(iss_feats)[0]
                if hasattr(_ISSUE_MODEL, "predict_proba"):
                    iss_probs = _ISSUE_MODEL.predict_proba(iss_feats)[0]
                    issue_conf = float(max(iss_probs))

            return {
                "department": str(dep_pred),
                "issue_type": str(issue_pred),
                "department_confidence": round(dep_conf, 2),
                "issue_confidence": round(issue_conf, 2),
            }
        except Exception:
            pass  # fallback to rule-based logic below

    # 2. Rule-based / keyword fallback classifier
    text_lower = text.lower()

    matched_department = "General"
    dept_conf = 0.50  # low confidence triggers Manual Review

    for dept, keywords in _DEPARTMENT_RULES.items():
        for kw in keywords:
            if kw in text_lower:
                matched_department = dept
                dept_conf = _FALLBACK_HIGH_CONF
                break
        if dept_conf == _FALLBACK_HIGH_CONF:
            break

    matched_issue = f"{matched_department} Issue"
    issue_conf = 0.65

    for issue, keywords in _ISSUE_TYPE_RULES.items():
        for kw in keywords:
            if kw in text_lower:
                matched_issue = issue
                issue_conf = _FALLBACK_HIGH_CONF
                break
        if issue_conf == _FALLBACK_HIGH_CONF:
            break

    return {
        "department": matched_department,
        "issue_type": matched_issue,
        "department_confidence": round(dept_conf, 2),
        "issue_confidence": round(issue_conf, 2),
    }
