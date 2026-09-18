"""
CivicFlow — Model Evaluation Module
===================================
Member 1 | Computes evaluation metrics (accuracy, precision, recall, F1)
for trained department and issue_type models.
"""

from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support


def evaluate_model(y_true, y_pred, target_names=None) -> dict:
    """
    Compute comprehensive classification metrics.
    """
    acc = float(accuracy_score(y_true, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )

    report = classification_report(
        y_true, y_pred, output_dict=True, zero_division=0
    )

    return {
        "accuracy": round(acc, 4),
        "macro_f1": round(float(f1_macro), 4),
        "macro_precision": round(float(p_macro), 4),
        "macro_recall": round(float(r_macro), 4),
        "weighted_f1": round(float(f1_weighted), 4),
        "detailed_report": report
    }
