# Member 1 — Complaint Classification Engine

## 📌 Role Overview
Member 1 is responsible for automated NLP classification of citizen complaints into the designated municipal department and specific issue category.

---

## 🎯 Target Responsibilities
- Classify incoming free-text complaints into departments (`Roads`, `Water`, `Sewage`, `Sanitation`, `Electricity`, `Traffic`, `Parks`, `Other`).
- Predict fine-grained `issue_type` (e.g. `Pothole`, `Sewage Overflow`, `Broken Streetlight`, `Garbage Dump`, `Water Contamination`).
- Output prediction confidence scores ($0.0 \dots 1.0$) for both department and issue type.
- Flag uncertain predictions: if `department_confidence < 0.60`, the pipeline routes the complaint to `"Manual Review"`.

---

## 🔌 Integration Point
- **Backend service file**: `backend/services/classifier.py`
- **Main function contract**:
  ```python
  def predict_complaint(text: str) -> dict:
      """
      Args:
          text: Cleaned complaint text string.
      Returns:
          {
              "department": str,          # e.g., "Roads"
              "issue_type": str,          # e.g., "Pothole"
              "department_confidence": float, # 0.0 to 1.0
              "issue_confidence": float       # 0.0 to 1.0
          }
      """
  ```

---

## 📂 Artifacts & Training
- Models and vectorizers can be serialized to `ml/models/` and loaded inside `backend/services/classifier.py`.
- Training scripts: `ml/train.py`, `ml/evaluate.py`, `ml/preprocess.py`.
- Dataset: `data/generated/civicflow_train.csv` and `data/generated/civicflow_test.csv`.

---

## 🧪 Verification
Run unit tests to verify the classifier meets schema requirements:
```bash
python -m unittest tests/test_api_endpoints.py
```
