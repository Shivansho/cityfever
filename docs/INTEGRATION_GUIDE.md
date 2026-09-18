# CivicFlow — Team Integration Guide
**Version:** 1.0.0  
**Target:** Step-by-step instructions for each of the 6 team members to wire their component into the unified platform.

---

## 🏗️ Architectural Overview

CivicFlow uses a **service-stub pattern**:
- The backend (`FastAPI`) runs an ingestion and operational pipeline.
- Each ML / analytical capability has a dedicated service file under `backend/services/`.
- Working stubs and baseline algorithms are pre-wired and tested.
- Members can iterate on their models/logic in isolation and replace the inner function implementation without breaking the API or frontend.

```
Citizen / Officer (Frontend: Member 6)
             │
             ▼
      POST /api/complaints (Backend: Member 2)
             │
    ┌────────┴─────────────────────────────────┐
    │ 1. Member 1: classifier.py               │
    │    predict_complaint()                   │
    ├──────────────────────────────────────────┤
    │ 2. Member 4: entities.py                 │
    │    extract_entities()                    │
    ├──────────────────────────────────────────┤
    │ 3. Member 4: priority.py                 │
    │    calculate_priority()                  │
    ├──────────────────────────────────────────┤
    │ 4. Member 5: duplicates.py               │
    │    find_similar_complaints()             │
    ├──────────────────────────────────────────┤
    │ 5. Member 3: clusters.py                 │
    │    cluster_spatial_incidents()           │
    └──────────────────────────────────────────┘
             │
             ▼
     Persisted to Database (SQLite / Postgres)
             │
             ▼
  Department Queues & Operations Dashboard
```

---

## 👩‍💻 Member 1: ML Classification Integration

1. **Working File**: `backend/services/classifier.py`
2. **Offline Artifacts**: Save trained scikit-learn / HuggingFace models to `ml/models/`.
3. **Integration Steps**:
   - In `backend/services/classifier.py`, load your serialized model at module startup (or use zero-shot pipeline).
   - Ensure `predict_complaint(text)` returns:
     ```python
     {
         "department": str,
         "issue_type": str,
         "department_confidence": float,
         "issue_confidence": float
     }
     ```
   - Respect confidence thresholds: If confidence is below 0.60, the backend will automatically route the ticket to `"Manual Review"`.
4. **Validation Command**:
   ```bash
   python -c "from backend.services.classifier import predict_complaint; print(predict_complaint('Pothole on Ring Road'))"
   ```

---

## 👨‍💻 Member 2: Backend & Integration Lead

1. **Working Files**: `backend/main.py`, `backend/routes/*`, `backend/models.py`, `backend/schemas.py`.
2. **Responsibilities**:
   - Manage the SQLite database lifecycle (`backend/civicflow.db`).
   - Run the FastAPI development server:
     ```bash
     uvicorn backend.main:app --reload --port 8000
     ```
   - Ensure CORS headers allow frontend development at `http://localhost:5173`.
   - Run unit test regression before any merge:
     ```bash
     python -m unittest discover tests
     ```

---

## 👩‍💻 Member 3: Spatial Clustering & Incident Hotspots

1. **Working File**: `backend/services/clusters.py`
2. **Integration Steps**:
   - Refine `cluster_spatial_incidents(complaints, eps_km, min_samples)` using your tuned DBSCAN parameters or HDBSCAN.
   - Refine `detect_hotspots(complaints)` to flag anomalies.
   - The dashboard route `backend/routes/dashboard.py` exposes `GET /api/dashboard/clusters` and `GET /api/dashboard/hotspots`.
3. **Validation Command**:
   ```bash
   curl http://localhost:8000/api/dashboard/clusters
   ```

---

## 👨‍💻 Member 4: Priority Scoring & Entity Extraction

1. **Working Files**:
   - `backend/services/entities.py` (Locality & duration regex/NER)
   - `backend/services/priority.py` (Explainable scoring algorithm & rules)
2. **Integration Steps**:
   - Update `PRIORITY_CONFIG` in `backend/services/priority.py` to tune weights for sensitive facilities (hospitals, schools) or issue severities.
   - Ensure `calculate_priority(...)` outputs:
     - `priority_score`: Integer (0 - 100)
     - `priority_level`: `"High"` | `"Medium"` | `"Low"`
     - `priority_reasons`: List of strings explaining score drivers.
3. **Validation Command**:
   ```bash
   python -m unittest tests/test_member4.py
   ```

---

## 👩‍💻 Member 5: Duplicate Detection & Semantic Grouping

1. **Working File**: `backend/services/duplicates.py`
2. **Integration Steps**:
   - Adjust `DUPLICATE_CONFIG` in `duplicates.py` (`proximity_distance_meters`, `text_similarity_with_coords`, etc.).
   - If using sentence-transformers or embedding models, load embeddings in `duplicates.py`.
   - Ensure output matches:
     ```python
     {
         "is_duplicate": bool,
         "duplicate_cluster_id": str | None,
         "similarity": float,
         "matched_complaint_ids": list[str]
     }
     ```
3. **Validation Command**:
   ```bash
   python -c "from backend.services.duplicates import find_similar_complaints; print(find_similar_complaints('water pipe burst', None, None, []))"
   ```

---

## 👨‍💻 Member 6: Frontend Development & UI

1. **Working Files**: `frontend/src/*`
2. **Integration Steps**:
   - Enter frontend directory and install dependencies:
     ```bash
     cd frontend
     npm install
     ```
   - Run the Vite development server:
     ```bash
     npm run dev
     ```
   - The UI communicates with the backend via `frontend/src/api/client.js`.
   - Toggle between **Citizen Portal** (submission form with auto-prediction feedback) and **Officer Dashboard** (Triage Table, Spatial Map, Department Queues).

---

## 🚀 Full End-to-End Verification

To verify that the complete platform functions harmoniously:

1. Start Backend:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
2. Submit a test complaint via curl or Swagger:
   ```bash
   curl -X POST http://localhost:8000/api/complaints \
     -H "Content-Type: application/json" \
     -d '{"complaint_text": "Water pipeline burst near Metro Station for 2 days", "latitude": 28.6139, "longitude": 77.2090}'
   ```
3. Verify response contains:
   - `department`: `"Water"`
   - `priority_level`: `"High"`
   - `locality`: `"Metro Station"`
   - `duration_text`: `"2 days"`
4. Run all automated test suites:
   ```bash
   python -m unittest discover tests
   ```
