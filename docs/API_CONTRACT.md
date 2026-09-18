# CivicFlow — Canonical API Contract
**Version:** 1.0.0  
**Status:** Agreed Canonical Specification across Members 1, 2, 3, 4, 5, 6  
**Backend Framework:** FastAPI  

---

## 1. Canonical Complaint Schema

All backend endpoints, frontend components, and analytical views consume and return this JSON schema.

```json
{
  "id": "C1024",
  "complaint_text": "There is a large pothole near Krishna Nagar market for 3 days.",
  "department": "Roads",
  "issue_type": "Pothole",
  "department_confidence": 0.94,
  "issue_confidence": 0.91,
  "priority_score": 82,
  "priority_level": "High",
  "priority_reasons": [
    "High-severity issue type: Pothole",
    "Reported duration exceeds 48 hours",
    "Public location detected: market"
  ],
  "locality": "Krishna Nagar",
  "duration_text": "3 days",
  "latitude": 27.492,
  "longitude": 77.673,
  "duplicate_cluster_id": null,
  "status": "Pending",
  "created_at": "2026-09-18T09:00:00Z"
}
```

### Schema Field Dictionary

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g. `"C1024"`). |
| `complaint_text` | `string` | Raw text submitted by citizen. |
| `department` | `string` | Classified department (`Roads`, `Water`, `Sewage`, `Electricity`, `Sanitation`, etc.). |
| `issue_type` | `string` | Fine-grained issue type (`Pothole`, `Sewage Overflow`, `Street Light`, etc.). |
| `department_confidence`| `float` | ML confidence score $(0.0 - 1.0)$ for department prediction. |
| `issue_confidence` | `float` | ML confidence score $(0.0 - 1.0)$ for issue type prediction. |
| `priority_score` | `integer` | Transparent operational score $(0 - 100)$. |
| `priority_level` | `string` | `"Low"` $(0-30)$, `"Medium"` $(31-60)$, or `"High"` $(61-100)$. |
| `priority_reasons` | `array[string]`| List of explainable justifications for the priority score. |
| `locality` | `string` \| `null` | Extracted neighborhood or ward (e.g. `"Krishna Nagar"`). |
| `duration_text` | `string` \| `null` | Extracted elapsed time expression (e.g. `"3 days"`, `"since Monday"`). |
| `latitude` | `float` \| `null` | GPS latitude coordinate. |
| `longitude` | `float` \| `null` | GPS longitude coordinate. |
| `duplicate_cluster_id` | `string` \| `null` | Cluster ID (e.g. `"CL-017"`) if identified as duplicate/co-located. |
| `status` | `string` | `"Pending"`, `"In Progress"`, `"Resolved"`, or `"Manual Review"`. |
| `created_at` | `string` | ISO 8601 timestamp. |

---

## 2. API Endpoints

Base URL: `http://localhost:8000/api`  
Interactive Swagger Docs: `http://localhost:8000/docs`

### A. Complaints Management

#### 1. Submit Complaint
- **`POST /api/complaints`**
- **Request Body**:
  ```json
  {
    "complaint_text": "Severe sewage water overflow near Delhi Public School for 5 days.",
    "latitude": 28.6139,
    "longitude": 77.2090
  }
  ```
- **Execution Pipeline**:
  1. Clean raw text
  2. Member 1 ML Prediction $\to$ `department`, `issue_type`, confidences
  3. Member 4 Entity Extraction $\to$ `locality`, `duration_text`
  4. Member 4 Priority Scoring $\to$ `priority_score`, `priority_level`, `priority_reasons`
  5. Member 4 Duplicate Check $\to$ `duplicate_cluster_id`
  6. Confidence rule: if `department_confidence < 0.60`, set `status = "Manual Review"`
  7. Persist to database $\to$ return canonical complaint JSON.
- **Response**: `201 Created` with full Canonical Complaint Schema.

#### 2. List Complaints
- **`GET /api/complaints`**
- **Query Params**:
  - `department` (optional, string)
  - `status` (optional, string)
  - `priority_level` (optional, string)
  - `limit` (default: 50)
  - `offset` (default: 0)
- **Response**: `200 OK`
  ```json
  {
    "total": 128,
    "items": [ /* array of canonical complaint objects */ ]
  }
  ```

#### 3. Get Single Complaint
- **`GET /api/complaints/{id}`**
- **Response**: `200 OK` (Canonical Complaint Schema) or `404 Not Found`.

#### 4. Update Complaint Status
- **`PATCH /api/complaints/{id}`**
- **Request Body**:
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Response**: `200 OK` with updated Canonical Complaint.

#### 5. Reassign Department
- **`POST /api/complaints/{id}/reassign`**
- **Request Body**:
  ```json
  {
    "department": "Sanitation",
    "reason": "Officer verified issue is garbage overflow, not road defect"
  }
  ```
- **Response**: `200 OK` with updated Canonical Complaint.

---

### B. Department Queue

#### 1. Get Department Priority Queue
- **`GET /api/queues/{department}`**
- **Description**: Returns all non-resolved complaints for the given department ordered descending by `priority_score` (highest priority first).
- **Response**: `200 OK`
  ```json
  {
    "department": "Roads",
    "pending_count": 14,
    "high_priority_count": 5,
    "items": [ /* array of canonical complaints sorted by priority */ ]
  }
  ```

---

### C. Analytics & Dashboard

#### 1. Dashboard Aggregate Statistics
- **`GET /api/dashboard/stats`**
- **Response**: `200 OK`
  ```json
  {
    "total_complaints": 128,
    "status_counts": {
      "Pending": 45,
      "In Progress": 32,
      "Resolved": 41,
      "Manual Review": 10
    },
    "priority_distribution": {
      "High": 28,
      "Medium": 62,
      "Low": 38
    },
    "department_breakdown": {
      "Roads": 42,
      "Water": 31,
      "Sewage": 25,
      "Sanitation": 18,
      "Electricity": 12
    },
    "duplicate_clusters_count": 14
  }
  ```

#### 2. Get Similar / Co-located Complaints
- **`GET /api/complaints/{id}/similar`**
- **Response**: `200 OK`
  ```json
  {
    "target_id": "C1024",
    "cluster_id": "CL-017",
    "matched_complaints": [ /* array of co-located/duplicate complaints */ ]
  }
  ```

---

## 3. Operational Rules

1. **Confidence Threshold**:
   - If `department_confidence < 0.60`, status is automatically set to `"Manual Review"`.
   - Never suppress or drop low-confidence complaints.
2. **Duplicate Preservation**:
   - Duplicates are linked via `duplicate_cluster_id`. Original complaints are **never** deleted.
3. **CORS Policy**:
   - Enabled for `http://localhost:5173` (Vite frontend dev server).
