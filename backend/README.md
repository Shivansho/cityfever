# CivicFlow Backend (Member 2)

FastAPI backend implementing the canonical complaint schema, submission
pipeline, department queues and dashboard stats.

## Run it

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- API base URL: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`
- DB file: `backend/civicflow.db` (SQLite, created automatically on first run)

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/complaints` | Submit a complaint → runs full pipeline, returns full result |
| GET | `/api/complaints` | List complaints (optional `?department=` `&status=`) |
| GET | `/api/complaints/{id}` | Get one complaint |
| PATCH | `/api/complaints/{id}` | Update any field (officer edit) |
| POST | `/api/complaints/{id}/reassign` | Reassign department |
| GET | `/api/complaints/{id}/similar` | Other complaints in the same duplicate cluster |
| GET | `/api/queues/{department}` | Department's queue, sorted by priority |
| GET | `/api/dashboard/stats` | Totals, by-department, by-priority-level |

## Example

Request:
```json
POST /api/complaints
{
  "complaint_text": "There is a large pothole near Krishna Nagar market for 3 days.",
  "latitude": 27.492,
  "longitude": 77.673
}
```

Response:
```json
{
  "id": "C5223",
  "complaint_text": "There is a large pothole near Krishna Nagar market for 3 days.",
  "department": "Roads",
  "issue_type": "Pothole",
  "department_confidence": 0.88,
  "issue_confidence": 0.88,
  "priority_score": 46,
  "priority_level": "Medium",
  "locality": "Krishna Nagar",
  "duration_text": "3 days",
  "latitude": 27.492,
  "longitude": 77.673,
  "duplicate_cluster_id": null,
  "status": "Pending",
  "created_at": "2026-09-18T04:08:00.013767"
}
```

If `department_confidence < 0.60`, `status` comes back as `"Manual Review"`
instead of `"Pending"` — the frontend should surface this distinctly.

## Where the other members plug in

Everything is stubbed with realistic placeholder logic **right now**, so the
whole pipeline already runs end-to-end. Each teammate replaces one file
without touching anything else:

| File | Owner | Replace with |
|---|---|---|
| `services/classifier.py` | Member 1 | Real TF-IDF/SVM model — keep `predict(text) -> dict` signature and the exact 4 output keys |
| `services/priority.py` | Member 4 | Real scoring — keep `score(department, issue_type, duration_text, text) -> dict` |
| `services/entities.py` | Member 4 | Real locality/duration extraction — keep `extract(text, provided_locality) -> dict` |
| `services/duplicates.py` | Member 4 | Real similarity model — keep `find_duplicate_cluster(...) -> str | None` |

None of them need to touch `main.py`, `models.py`, `schemas.py`, or the
`routes/` files. As long as the function signature and output keys stay the
same, dropping in the real model is a one-file swap.

## Notes for Member 3 (frontend) & Member 5 (Mapbox)

- CORS is open (`allow_origins=["*"]`) for the hackathon — hit the API from
  any dev port with no extra config.
- Marker/queue data already includes `latitude`/`longitude`, `department`,
  `issue_type`, `priority_level`, `priority_score`, `status`, `locality` —
  matches what Member 5's instructions ask for.

## Notes for Member 6 (integration/demo)

- DB is a single SQLite file (`civicflow.db`) next to `main.py`. Delete it to
  reset demo data.
- To seed demo data, POST a batch of realistic complaint texts to
  `/api/complaints` (a small script looping over a list of strings works
  fine — happy to write that seed script next if useful).
