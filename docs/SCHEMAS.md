# CivicFlow — Data Schemas & Model Definitions
**Version:** 1.0.0  
**Target:** Shared reference across all 6 members

This document details the exact schemas, types, and constraints for the database, API layer, and ML/analytical services.

---

## 1. Database Schema (`backend/models.py`)

Table: `complaints`

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(16)` | `False` | Primary Key | e.g. `"C1024"` |
| `complaint_text` | `TEXT` | `False` | — | Raw complaint text |
| `department` | `VARCHAR(64)` | `False` | — | Predicted or assigned department |
| `issue_type` | `VARCHAR(64)` | `False` | — | Sub-category of issue |
| `department_confidence`| `FLOAT` | `False` | `0.0` | Classification confidence (0.0 to 1.0) |
| `issue_confidence` | `FLOAT` | `False` | `0.0` | Classification confidence (0.0 to 1.0) |
| `priority_score` | `INTEGER` | `False` | `0` | Operational score (0 to 100) |
| `priority_level` | `VARCHAR(16)` | `False` | `"Medium"` | `"High"`, `"Medium"`, or `"Low"` |
| `priority_reasons` | `TEXT` | `False` | `"[]"` | JSON-serialized list of explanation strings |
| `locality` | `VARCHAR(128)`| `True` | `None` | Extracted neighborhood/colony/landmark |
| `duration_text` | `VARCHAR(64)` | `True` | `None` | Extracted duration phrase (e.g. `"3 days"`) |
| `latitude` | `FLOAT` | `True` | `None` | GPS latitude |
| `longitude` | `FLOAT` | `True` | `None` | GPS longitude |
| `duplicate_cluster_id` | `VARCHAR(32)` | `True` | `None` | Duplicate group id (e.g. `"CL-004"`) |
| `status` | `VARCHAR(32)` | `False` | `"Pending"`| `"Pending"`, `"In Progress"`, `"Resolved"`, `"Manual Review"` |
| `created_at` | `DATETIME` | `False` | `utcnow` | Creation timestamp |
| `updated_at` | `DATETIME` | `False` | `utcnow` | Last updated timestamp |

---

## 2. API Pydantic Schemas (`backend/schemas.py`)

### A. Complaint Ingestion
```python
class ComplaintCreate(BaseModel):
    complaint_text: str          # Required (min_length=3)
    latitude: float | None = None
    longitude: float | None = None
```

### B. Complaint Operations
```python
class ComplaintUpdate(BaseModel):
    status: str                  # "Pending" | "In Progress" | "Resolved" | "Manual Review"

class ComplaintReassign(BaseModel):
    department: str              # Target department name
    reason: str = ""             # Justification
```

### C. Complaint Response
```python
class ComplaintResponse(BaseModel):
    id: str
    complaint_text: str
    department: str
    issue_type: str
    department_confidence: float
    issue_confidence: float
    priority_score: int
    priority_level: str
    priority_reasons: list[str]
    locality: str | None
    duration_text: str | None
    latitude: float | None
    longitude: float | None
    duplicate_cluster_id: str | None
    status: str
    created_at: str
```

### D. Queue Response
```python
class DepartmentQueueResponse(BaseModel):
    department: str
    pending_count: int
    high_priority_count: int
    items: list[ComplaintResponse]
```

### E. Dashboard Analytics
```python
class DashboardStatsResponse(BaseModel):
    total_complaints: int
    status_counts: dict[str, int]
    priority_distribution: dict[str, int]
    department_breakdown: dict[str, int]
    duplicate_clusters_count: int
```

---

## 3. Machine Learning & Intelligence Contracts

### Member 1: Zero-Shot / Supervised Classification
- **Function**: `predict_complaint(text: str) -> dict`
- **Output**:
  ```python
  {
      "department": "Roads",
      "issue_type": "Pothole",
      "department_confidence": 0.94,
      "issue_confidence": 0.91
  }
  ```

### Member 3: Spatial Clustering & Incident Detection
- **Function**: `cluster_spatial_incidents(complaints: list[dict], eps_km: float = 0.5, min_samples: int = 2) -> list[dict]`
- **Output**:
  ```python
  [
      {
          "cluster_id": "SP-CLUST-001",
          "center_latitude": 28.6139,
          "center_longitude": 77.2090,
          "complaint_count": 4,
          "dominant_department": "Sewage",
          "high_priority_count": 2,
          "radius_meters": 135.2,
          "complaint_ids": ["C1001", "C1005", "C1012", "C1018"]
      }
  ]
  ```

### Member 4: Named Entity Extraction
- **Function**: `extract_entities(text: str) -> dict`
- **Output**:
  ```python
  {
      "locality": "Krishna Nagar",
      "duration_text": "3 days"
  }
  ```

### Member 4: Transparent Priority Scoring
- **Function**: `calculate_priority(text: str, issue_type: str | None, duration_text: str | None, locality: str | None) -> dict`
- **Output**:
  ```python
  {
      "priority_score": 82,
      "priority_level": "High",
      "priority_reasons": [
          "High-severity issue type: Pothole",
          "Reported duration exceeds 48 hours",
          "Public location detected: market"
      ]
  }
  ```

### Member 5: Duplicate & Co-located Complaint Matching
- **Function**: `find_similar_complaints(complaint_text: str, latitude: float | None, longitude: float | None, existing_complaints: list[dict]) -> dict`
- **Output**:
  ```python
  {
      "is_duplicate": True,
      "duplicate_cluster_id": "CL-017",
      "similarity": 0.88,
      "matched_complaint_ids": ["C1014", "C1019"]
  }
  ```
