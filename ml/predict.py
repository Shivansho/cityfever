"""
CivicFlow — Complaint Prediction Module
=======================================
Member 1 | Standalone prediction function consumed by backend integration.

Definition of Done contract:
    from ml.predict import predict_complaint
    predict_complaint("Large pothole near the market for three days")
"""

import os
import joblib
from ml.preprocess import clean_text

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_DEP_MODEL = None
_DEP_VECT = None
_ISSUE_MODEL = None
_ISSUE_VECT = None


def _load_artifacts():
    global _DEP_MODEL, _DEP_VECT, _ISSUE_MODEL, _ISSUE_VECT
    if _DEP_MODEL is not None:
        return

    dep_model_path = os.path.join(_BASE_DIR, "models", "department_model.joblib")
    dep_vect_path = os.path.join(_BASE_DIR, "vectorizers", "department_vectorizer.joblib")
    issue_model_path = os.path.join(_BASE_DIR, "models", "issue_model.joblib")
    issue_vect_path = os.path.join(_BASE_DIR, "vectorizers", "issue_vectorizer.joblib")

    if not os.path.exists(dep_model_path):
        raise FileNotFoundError(f"Model artifacts not found in {_BASE_DIR}/models/. Run 'python ml/train.py' first.")

    _DEP_MODEL = joblib.load(dep_model_path)
    _DEP_VECT = joblib.load(dep_vect_path)
    _ISSUE_MODEL = joblib.load(issue_model_path)
    _ISSUE_VECT = joblib.load(issue_vect_path)


def predict_complaint(text: str) -> dict:
    """
    Predict department and issue type from raw complaint text.

    Parameters
    ----------
    text : str
        Citizen complaint description.

    Returns
    -------
    dict
        {
            "department": str,
            "department_confidence": float,
            "issue_type": str,
            "issue_confidence": float
        }
    """
    _load_artifacts()

    processed = clean_text(text)
    if not processed:
        return {
            "department": "Other",
            "department_confidence": 0.50,
            "issue_type": "General Inquiry",
            "issue_confidence": 0.50
        }

    # Department prediction
    dep_features = _DEP_VECT.transform([processed])
    dep_pred = _DEP_MODEL.predict(dep_features)[0]
    dep_probs = _DEP_MODEL.predict_proba(dep_features)[0]
    dep_conf = float(max(dep_probs))

    # Issue type prediction
    issue_features = _ISSUE_VECT.transform([processed])
    issue_pred = _ISSUE_MODEL.predict(issue_features)[0]
    issue_probs = _ISSUE_MODEL.predict_proba(issue_features)[0]
    issue_conf = float(max(issue_probs))

    return {
        "department": str(dep_pred),
        "department_confidence": round(dep_conf, 2),
        "issue_type": str(issue_pred),
        "issue_confidence": round(issue_conf, 2),
    }


if __name__ == "__main__":
    test_text = "There is a large pothole near Krishna Nagar market for 3 days."
    res = predict_complaint(test_text)
    print("Test Prediction:")
    print(res)
