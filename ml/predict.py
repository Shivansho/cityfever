"""
predict.py
Member 1 — ML Classification

This is the file Member 2 (backend) imports directly. Do not change the
public function signature/contract without telling the backend owner:

    from ml.predict import predict_complaint
    predict_complaint("Large pothole near the market for three days")
    ->
    {
        "department": "Roads",
        "department_confidence": 0.94,
        "issue_type": "Pothole",
        "issue_confidence": 0.91
    }

Loads the saved joblib models/vectorizers ONCE at import time (module-level
globals), so repeated calls are fast and no retraining ever happens at
request time.
"""

import os
import joblib

from preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZERS_DIR = os.path.join(BASE_DIR, "vectorizers")

_DEPT_MODEL_PATH = os.path.join(MODELS_DIR, "department_model.joblib")
_ISSUE_MODEL_PATH = os.path.join(MODELS_DIR, "issue_model.joblib")
_DEPT_VEC_PATH = os.path.join(VECTORIZERS_DIR, "department_vectorizer.joblib")
_ISSUE_VEC_PATH = os.path.join(VECTORIZERS_DIR, "issue_vectorizer.joblib")

_missing = [
    p for p in [_DEPT_MODEL_PATH, _ISSUE_MODEL_PATH, _DEPT_VEC_PATH, _ISSUE_VEC_PATH]
    if not os.path.exists(p)
]
if _missing:
    raise FileNotFoundError(
        "predict.py could not find trained model/vectorizer file(s): "
        f"{_missing}. Run `python train.py` first to generate them."
    )

_department_model = joblib.load(_DEPT_MODEL_PATH)
_issue_model = joblib.load(_ISSUE_MODEL_PATH)
_department_vectorizer = joblib.load(_DEPT_VEC_PATH)
_issue_vectorizer = joblib.load(_ISSUE_VEC_PATH)


def _predict_with_confidence(text_clean: str, model, vectorizer):
    """Returns (predicted_label, confidence_float) for one fitted head."""
    X = vectorizer.transform([text_clean])
    proba = model.predict_proba(X)[0]
    classes = model.classes_
    best_idx = proba.argmax()
    label = classes[best_idx]
    confidence = float(proba[best_idx])
    return label, confidence


def predict_complaint(text: str) -> dict:
    """
    Fixed contract (do not rename keys — backend and frontend depend on
    these exact field names):

        {
          "department": str,
          "department_confidence": float (0-1),
          "issue_type": str,
          "issue_confidence": float (0-1)
        }
    """
    if text is None or not str(text).strip():
        raise ValueError("predict_complaint() requires non-empty complaint text")

    text_clean = clean_text(text)

    department, department_confidence = _predict_with_confidence(
        text_clean, _department_model, _department_vectorizer
    )
    issue_type, issue_confidence = _predict_with_confidence(
        text_clean, _issue_model, _issue_vectorizer
    )

    return {
        "department": str(department),
        "department_confidence": round(department_confidence, 4),
        "issue_type": str(issue_type),
        "issue_confidence": round(issue_confidence, 4),
    }


if __name__ == "__main__":
    # quick manual smoke test: python predict.py "some complaint text"
    import sys

    sample = " ".join(sys.argv[1:]) or "Large pothole near the market for three days"
    print(f"Input: {sample!r}")
    print(predict_complaint(sample))