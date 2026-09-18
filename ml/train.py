"""
CivicFlow — Model Training Pipeline
===================================
Member 1 | Trains department and issue_type NLP classifiers using TF-IDF + Logistic Regression.
Evaluates on test split, generates ml/metrics.json, and serializes joblib artifacts.
"""

import os
import csv
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from ml.preprocess import clean_text
from ml.evaluate import evaluate_model


def load_csv(path: str) -> tuple[list[str], list[str], list[str]]:
    texts = []
    departments = []
    issues = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(clean_text(row["complaint_text"]))
            departments.append(row["department"])
            issues.append(row["issue_type"])
    return texts, departments, issues


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    train_path = os.path.join(base_dir, "data", "generated", "civicflow_train.csv")
    test_path = os.path.join(base_dir, "data", "generated", "civicflow_test.csv")

    if not os.path.exists(train_path) or not os.path.exists(test_path):
        raise FileNotFoundError(f"Training/testing data not found at {train_path}. Run generate_dataset.py first.")

    train_texts, train_deps, train_issues = load_csv(train_path)
    test_texts, test_deps, test_issues = load_csv(test_path)

    # 1. Department Classifier
    print("Training Department Classifier...")
    dep_vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True
    )
    X_train_dep = dep_vectorizer.fit_transform(train_texts)
    X_test_dep = dep_vectorizer.transform(test_texts)

    dep_model = LogisticRegression(max_iter=1000, C=2.0)
    dep_model.fit(X_train_dep, train_deps)

    dep_pred = dep_model.predict(X_test_dep)
    dep_metrics = evaluate_model(test_deps, dep_pred)
    print(f"Department Test Accuracy: {dep_metrics['accuracy']:.4f}, Macro F1: {dep_metrics['macro_f1']:.4f}")

    # 2. Issue Type Classifier
    print("Training Issue Type Classifier...")
    issue_vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True
    )
    X_train_issue = issue_vectorizer.fit_transform(train_texts)
    X_test_issue = issue_vectorizer.transform(test_texts)

    issue_model = LogisticRegression(max_iter=1000, C=2.0)
    issue_model.fit(X_train_issue, train_issues)

    issue_pred = issue_model.predict(X_test_issue)
    issue_metrics = evaluate_model(test_issues, issue_pred)
    print(f"Issue Type Test Accuracy: {issue_metrics['accuracy']:.4f}, Macro F1: {issue_metrics['macro_f1']:.4f}")

    # 3. Save Artifacts
    models_dir = os.path.join(base_dir, "ml", "models")
    vect_dir = os.path.join(base_dir, "ml", "vectorizers")
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(vect_dir, exist_ok=True)

    joblib.dump(dep_model, os.path.join(models_dir, "department_model.joblib"))
    joblib.dump(dep_vectorizer, os.path.join(vect_dir, "department_vectorizer.joblib"))
    joblib.dump(issue_model, os.path.join(models_dir, "issue_model.joblib"))
    joblib.dump(issue_vectorizer, os.path.join(vect_dir, "issue_vectorizer.joblib"))

    # 4. Save Metrics
    metrics_path = os.path.join(base_dir, "ml", "metrics.json")
    final_metrics = {
        "model_architecture": "TF-IDF (1,2) + LogisticRegression",
        "train_samples": len(train_texts),
        "test_samples": len(test_texts),
        "department_metrics": dep_metrics,
        "issue_metrics": issue_metrics
    }
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(final_metrics, f, indent=2)

    print(f"Saved models to {models_dir} and metrics to {metrics_path}")


if __name__ == "__main__":
    main()
