# CivicFlow — Member 4 Setup Guide
## Operational Intelligence: Priority Scoring, Entity Extraction & Duplicate Detection

This guide walks you through setting up, running, configuring, and verifying **Member 4's** services within the CivicFlow project.

---

## 1. Prerequisites

- **Python**: Version 3.10 or higher (Tested on Python 3.12).
- **Git**: Installed and configured.

---

## 2. Environment Setup

### A. Clone & Navigate to the Repository
```bash
git clone <repo-url>
cd cityfever
```

### B. Create and Activate a Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```
- **Windows (CMD)**:
  ```cmd
  python -m venv .venv
  .venv\Scripts\activate.bat
  ```
- **Linux / macOS**:
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

### C. Install Dependencies
Member 4 utilizes lightweight dependencies (`scikit-learn` for TF-IDF cosine similarity, with pure-Python fallbacks):
```bash
pip install scikit-learn numpy
```
*(Optional for future API integration: `pip install fastapi uvicorn pydantic`)*

---

## 3. Verifying the Installation

Run the automated test suite to ensure all three modules (`priority`, `entities`, `duplicates`) are functioning properly:

```bash
python -m unittest tests/test_member4.py
```

### Expected Output:
```text
.........
----------------------------------------------------------------------
Ran 9 tests in 0.003s

OK
```

---

## 4. Quickstart Usage Examples

You can test each module directly in an interactive Python shell:

```python
from backend.services import calculate_priority, extract_entities, find_similar_complaints

# 1. Test Entity Extraction
entities = extract_entities("Broken water pipe in Krishna Nagar near Gate 2 for 4 days")
print(entities)
# Output:
# {'locality': 'Krishna Nagar', 'location_hint': 'Gate 2', 'duration_text': '4 days', ...}

# 2. Test Priority Scoring
priority = calculate_priority(
    text="Severe sewage leak hazard for children near Delhi Public School",
    issue_type="Sewage Overflow",
    duration_text=entities["duration_text"],
    locality=entities["locality"]
)
print(priority)
# Output:
# {'priority_score': 88, 'priority_level': 'High', 'priority_reasons': [...], 'breakdown': {...}}

# 3. Test Duplicate Detection
existing = [{
    "id": "C1001",
    "text": "Severe sewage leak hazard near Delhi Public School",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "duplicate_cluster_id": "CL-001"
}]
duplicate = find_similar_complaints(
    complaint_text="Sewage leak hazard near Delhi Public School",
    latitude=28.6140,
    longitude=77.2091,
    existing_complaints=existing
)
print(duplicate)
# Output:
# {'is_duplicate': True, 'duplicate_cluster_id': 'CL-001', 'similarity': 0.88, 'matched_complaint_ids': ['C1001']}
```

---

## 5. Configuration & Threshold Tuning

All thresholds are isolated from the business logic and can be adjusted based on city operational policies:

### Priority Weights & Levels (`backend/services/priority.py`)
```python
CONFIG = {
    "max_severity": 40,        # Max points for issue type severity
    "max_duration": 20,        # Max points for unresolved duration
    "max_public_impact": 20,   # Max points for public places (schools, hospitals)
    "max_safety_risk": 20,     # Max points for safety keywords (children, hazard, electric)
    "low_upper": 30,           # Scores 0–30: Low
    "medium_upper": 60,        # Scores 31–60: Medium, 61–100: High
}
```

### Duplicate Detection Thresholds (`backend/services/duplicates.py`)
```python
DUPLICATE_CONFIG = {
    "text_similarity_with_coords": 0.65,  # Text similarity threshold when coordinates are within radius
    "proximity_distance_meters": 150.0,  # Max distance in meters considered "same location"
    "text_similarity_standalone": 0.82,  # Strict text similarity threshold if coordinates are missing
    "max_spatial_radius_meters": 500.0,  # Outer spatial bounds for complaints
}
```

---

## 6. Integration Checklist with Team

- [x] **Member 2 (FastAPI / Database)**: Member 2 imports `calculate_priority`, `extract_entities`, and `find_similar_complaints` directly from `backend.services`. Full handoff specification is available in [`docs/member4_handoff.md`](docs/member4_handoff.md).
- [x] **Member 3 (ML Classifier)**: Member 3's model outputs `issue_type` and `department`, which feeds directly into `calculate_priority(issue_type=...)`.
- [x] **Member 5 & 6 (Frontend / Dashboard)**: Can render the `priority_reasons` tags, `priority_score` badge, and duplicate cluster badges on the operations portal.
