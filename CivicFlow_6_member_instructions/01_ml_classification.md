# Member 1 — ML Classification & Model Evaluation

## Mission
Build the NLP classification engine for CivicFlow. Your code must be usable by the backend member without requiring notebook-only execution.

## Ownership
- Clean and prepare the complaint dataset.
- Train a TF-IDF + Logistic Regression baseline.
- Train a second classifier (Linear SVM recommended) for comparison.
- Predict:
  - `department`
  - `issue_type`
- Return confidence/probability where supported.
- Produce precision, recall and F1 metrics.
- Save/load trained models so the backend can use them.

## Fixed contract

Input:
```python
text: str
```

Output:
```json
{
  "department": "Roads",
  "department_confidence": 0.94,
  "issue_type": "Pothole",
  "issue_confidence": 0.91
}
```

Use these canonical department values unless the team agrees otherwise:
- Roads
- Water
- Sanitation
- Electrical
- Sewage
- Traffic
- Parks
- Other

## Required files
```text
ml/
├── train.py
├── predict.py
├── preprocess.py
├── evaluate.py
├── models/
│   ├── department_model.joblib
│   └── issue_model.joblib
├── vectorizers/
│   ├── department_vectorizer.joblib
│   └── issue_vectorizer.joblib
└── metrics.json
```

## Important
- Do NOT hard-code fake accuracy/F1 values.
- Save the actual evaluation metrics in `metrics.json`.
- Keep preprocessing identical during training and inference.
- `predict.py` must expose a simple function such as:
```python
predict_complaint(text) -> dict
```
- Do not build the FastAPI server. Member 2 will integrate your model.
- Do not build the frontend.

## Definition of Done
A fresh Python process can load the saved models and execute:
```python
from ml.predict import predict_complaint
print(predict_complaint("Large pothole near the market for three days"))
```
without opening a notebook or retraining anything.

## Handoff
Give Member 2:
1. `ml/` folder.
2. `requirements` additions.
3. Expected input/output example.
4. Actual validation metrics.
5. Short note explaining how confidence is calculated.
