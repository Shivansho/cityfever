"""
evaluate.py
Member 1 — ML Classification

Standalone evaluation tool. Loads the ALREADY-SAVED models/vectorizers from
models/ and vectorizers/, runs them against a labeled CSV (default: the same
data train.py was pointed at, using an identical split), and prints/writes
an honest precision/recall/F1 report.

Use this to:
  - Re-verify metrics.json without retraining.
  - Evaluate the saved models against a NEW held-out CSV (e.g. a fresh batch
    of real complaints) by passing --data.

Usage:
    python evaluate.py --data path/to/labeled.csv
    python evaluate.py                      # re-evaluates on the held-out
                                             # split of the placeholder set
"""

import argparse
import json
import os

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
)

from preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZERS_DIR = os.path.join(BASE_DIR, "vectorizers")
DEFAULT_DATA = os.path.join(BASE_DIR, "data", "civicflow_complaints_placeholder.csv")
REAL_TEST = os.path.join(BASE_DIR, "data", "real", "civicflow_test.csv")
EVAL_OUTPUT_PATH = os.path.join(BASE_DIR, "evaluation_report.json")


def load_dataset(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    required = {"complaint_text", "department", "issue_type"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Dataset missing required column(s): {sorted(missing)}")
    df = df.dropna(subset=["complaint_text", "department", "issue_type"]).copy()
    df["complaint_text_clean"] = df["complaint_text"].apply(clean_text)
    df = df[df["complaint_text_clean"].str.len() > 0].reset_index(drop=True)
    return df


def evaluate_head(label_name, model, vectorizer, X_text, y_true):
    X_vec = vectorizer.transform(X_text)
    y_pred = model.predict(X_vec)

    acc = accuracy_score(y_true, y_pred)
    p, r, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    report = classification_report(y_true, y_pred, zero_division=0, output_dict=True)

    print(f"\n[{label_name}] accuracy={acc:.4f} precision_macro={p:.4f} "
          f"recall_macro={r:.4f} f1_macro={f1:.4f}")

    return {
        "accuracy": round(float(acc), 4),
        "precision_macro": round(float(p), 4),
        "recall_macro": round(float(r), 4),
        "f1_macro": round(float(f1), 4),
        "per_class_report": report,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default=None, help="Labeled CSV to evaluate against")
    parser.add_argument("--test-size", type=float, default=0.2,
                         help="Only used when --full is NOT passed: re-creates "
                              "the same held-out split train.py used (internal "
                              "random-split mode only).")
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--full", action="store_true",
                         help="Evaluate against the ENTIRE given CSV instead "
                              "of re-splitting (use this for a genuinely new, "
                              "unseen dataset, or for the team's own "
                              "civicflow_test.csv which is already held-out).")
    args = parser.parse_args()

    if args.data is None:
        if os.path.exists(REAL_TEST):
            args.data = REAL_TEST
            args.full = True  # civicflow_test.csv is already a held-out split
        else:
            args.data = DEFAULT_DATA

    dept_model = joblib.load(os.path.join(MODELS_DIR, "department_model.joblib"))
    issue_model = joblib.load(os.path.join(MODELS_DIR, "issue_model.joblib"))
    dept_vectorizer = joblib.load(os.path.join(VECTORIZERS_DIR, "department_vectorizer.joblib"))
    issue_vectorizer = joblib.load(os.path.join(VECTORIZERS_DIR, "issue_vectorizer.joblib"))

    df = load_dataset(args.data)
    print(f"Loaded {len(df)} rows from {args.data}")

    if args.full:
        X_test = df["complaint_text_clean"]
        ydept_test = df["department"]
        yissue_test = df["issue_type"]
    else:
        _, X_test, _, ydept_test, _, yissue_test = train_test_split(
            df["complaint_text_clean"], df["department"], df["issue_type"],
            test_size=args.test_size,
            random_state=args.random_state,
            stratify=df["department"],
        )

    dept_report = evaluate_head("department", dept_model, dept_vectorizer, X_test, ydept_test)
    issue_report = evaluate_head("issue_type", issue_model, issue_vectorizer, X_test, yissue_test)

    out = {
        "dataset_path": os.path.abspath(args.data),
        "rows_evaluated": int(len(X_test)),
        "mode": "full_dataset" if args.full else "held_out_split",
        "department": dept_report,
        "issue_type": issue_report,
    }

    with open(EVAL_OUTPUT_PATH, "w") as f:
        json.dump(out, f, indent=2)
    print(f"\nWrote evaluation report to {EVAL_OUTPUT_PATH}")


if __name__ == "__main__":
    main()