# Member 4 Handoff: Operational Intelligence Layer

This document details the function contracts, example inputs/outputs, configurable thresholds, and operational logic implemented by Member 4 for CivicFlow.

---

## 1. Directory Structure

```text
backend/services/
├── __init__.py      # Exports calculate_priority, extract_entities, find_similar_complaints
├── priority.py      # Transparent 0–100 explainable priority scoring engine
├── entities.py      # Regex and dictionary-based duration & locality extraction
└── duplicates.py    # TF-IDF cosine similarity + Haversine geospatial duplicate detection
```

---

## 2. Function Contracts & Examples

### A. Priority Engine (`calculate_priority`)

- **Import**:
  ```python
  from backend.services import calculate_priority
  ```

- **Signature**:
  ```python
  calculate_priority(
      text: str,
      issue_type: str,
      duration_text: str | None,
      locality: str | None
  ) -> dict
  ```

- **Example Input**:
  ```python
  calculate_priority(
      text="Severe sewage overflow leaking near Delhi Public School creating hazard for children",
      issue_type="Sewage Overflow",
      duration_text="5 days",
      locality="Krishna Nagar"
  )
  ```

- **Example Output**:
  ```json
  {
    "priority_score": 88,
    "priority_level": "High",
    "priority_reasons": [
      "High-severity issue type: Sewage Overflow",
      "Reported duration exceeds 48 hours",
      "Public location detected: school",
      "Safety-related infrastructure issue"
    ],
    "breakdown": {
      "severity": 38,
      "duration": 20,
      "public_impact": 10,
      "safety_risk": 20
    }
  }
  ```

---

### B. Entity Extraction (`extract_entities`)

- **Import**:
  ```python
  from backend.services import extract_entities
  ```

- **Signature**:
  ```python
  extract_entities(text: str) -> dict
  ```

- **Example Input**:
  ```python
  extract_entities("Dangerous pothole in Krishna Nagar near Gate 2 for 5 days")
  ```

- **Example Output**:
  ```json
  {
    "locality": "Krishna Nagar",
    "location_hint": "Gate 2",
    "duration_text": "5 days",
    "entities": {
      "locality": "Krishna Nagar",
      "location_hint": "Gate 2",
      "duration_text": "5 days"
    }
  }
  ```

---

### C. Duplicate Complaint Detection (`find_similar_complaints`)

- **Import**:
  ```python
  from backend.services import find_similar_complaints
  ```

- **Signature**:
  ```python
  find_similar_complaints(
      complaint_text: str,
      latitude: float | None,
      longitude: float | None,
      existing_complaints: list[dict]
  ) -> dict
  ```

- **Example Input**:
  ```python
  find_similar_complaints(
      complaint_text="Pothole near Gate 1 causing major traffic stall",
      latitude=28.6141,
      longitude=77.2091,
      existing_complaints=[
          {
              "id": "C1008",
              "text": "Huge pothole near Gate 1 on Main Road causing traffic",
              "latitude": 28.6139,
              "longitude": 77.2090,
              "duplicate_cluster_id": "CL-017"
          }
      ]
  )
  ```

- **Example Output**:
  ```json
  {
    "is_duplicate": true,
    "duplicate_cluster_id": "CL-017",
    "similarity": 0.86,
    "matched_complaint_ids": ["C1008"]
  }
  ```

---

## 3. Configurable Thresholds

### Priority Scoring (`PRIORITY_CONFIG` in `backend/services/priority.py`):
```python
CONFIG = {
    "max_severity": 40,
    "max_duration": 20,
    "max_public_impact": 20,
    "max_safety_risk": 20,
    "low_upper": 30,       # 0–30: Low
    "medium_upper": 60,    # 31–60: Medium, 61–100: High
}
```

### Duplicate Detection (`DUPLICATE_CONFIG` in `backend/services/duplicates.py`):
```python
DUPLICATE_CONFIG = {
    "text_similarity_with_coords": 0.65,    # Similarity threshold if within proximity
    "proximity_distance_meters": 150.0,    # Distance in meters considered close
    "text_similarity_standalone": 0.82,    # Threshold if coordinates are missing/far
    "max_spatial_radius_meters": 500.0,    # Max radius for geographic pairing
}
```

---

## 4. Duplicate Logic Explanation

1. **Text Normalization**: Extracts lowercase word tokens and computes TF-IDF cosine similarity against existing complaint descriptions.
2. **Haversine Distance**: Calculates real-world spherical distance in meters between GPS coordinates.
3. **Multi-condition Evaluation**:
   - If both reports have GPS coordinates and are within `150m`, a moderate text similarity (`>= 0.65`) triggers a duplicate match.
   - If coordinates are absent or reports are further, a strict text similarity (`>= 0.82`) is required.
4. **Cluster Assignment**: Retains existing `duplicate_cluster_id` when available; otherwise generates a deterministic cluster ID (`CL-<id>`). Citizen submissions are **never deleted**.
