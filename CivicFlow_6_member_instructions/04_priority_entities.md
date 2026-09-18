# Member 4 — Explainable Priority, Entity Extraction & Duplicate Detection

## Mission
Build the rule-based operational intelligence layer. This member owns the logic that makes CivicFlow more than a basic text classifier.

## Ownership
1. Priority scoring.
2. Explainable reasons.
3. Locality extraction.
4. Duration extraction.
5. Similar/duplicate complaint detection.

## 1. Priority engine

Priority is an operational recommendation, NOT a decision that suppresses complaints.

Use a transparent 100-point score.

Suggested starting structure:
```text
Severity          0–40
Duration          0–20
Public impact     0–20
Safety risk       0–20
----------------------
Total             0–100
```

Suggested levels:
```text
0–30   Low
31–60  Medium
61–100 High
```

These values must remain configurable.

Example output:
```json
{
  "priority_score": 82,
  "priority_level": "High",
  "priority_reasons": [
    "Safety-related infrastructure issue",
    "Reported duration exceeds 48 hours",
    "Public location detected"
  ]
}
```

Never return only a number; return reasons too.

## 2. Entity extraction

Extract at minimum:
- locality
- duration

Examples:
```text
"for 5 days" -> duration_text = "5 days"
"since Monday" -> duration_text = "since Monday"
"in Krishna Nagar" -> locality = "Krishna Nagar"
"near Gate 2" -> locality/location_hint = "Gate 2"
```

Use regex/dictionaries/simple NLP first. Do not spend hackathon time training a custom NER model unless everything else is complete.

## 3. Duplicate detection

Use text similarity + location proximity when coordinates exist.

Recommended approach:
- TF-IDF cosine similarity for text.
- Haversine distance for coordinates.
- Combine both signals.

Example:
```text
Text similarity: 0.86
Location distance: 45 m
Result: POSSIBLE DUPLICATE
```

Return:
```json
{
  "is_duplicate": true,
  "duplicate_cluster_id": "CL-017",
  "similarity": 0.86,
  "matched_complaint_ids": ["C1008", "C1012"]
}
```

Never delete the original complaints. A duplicate cluster groups reports operationally while retaining every citizen submission.

## Required files
```text
backend/services/
├── priority.py
├── entities.py
└── duplicates.py
```

## Function contracts

```python
calculate_priority(
    text: str,
    issue_type: str,
    duration_text: str | None,
    locality: str | None
) -> dict
```

```python
extract_entities(text: str) -> dict
```

```python
find_similar_complaints(
    complaint_text: str,
    latitude: float | None,
    longitude: float | None,
    existing_complaints: list
) -> dict
```

## Definition of Done
Member 2 can import these functions directly and call them from FastAPI without copying your code.

## Handoff
Give Member 2:
- exact function names,
- example inputs/outputs,
- configurable thresholds,
- short explanation of duplicate logic.
