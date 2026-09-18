# Member 2 — Backend & Integration API

## Mission
Build the central FastAPI backend that connects the ML engine, priority engine, duplicate detection, database and frontend.

## Ownership
- FastAPI application.
- Database models and CRUD.
- Complaint submission endpoint.
- Complaint prediction/routing endpoint.
- Department queue endpoints.
- Dashboard statistics endpoint.
- Manual reassignment/status update endpoints.
- Integrate Member 1's ML module without changing its public function contract.

## Canonical complaint schema

Use this structure consistently:

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
  "locality": "Krishna Nagar",
  "duration_text": "3 days",
  "latitude": 27.492,
  "longitude": 77.673,
  "duplicate_cluster_id": null,
  "status": "Pending",
  "created_at": "2026-09-18T09:00:00"
}
```

Do not rename these fields casually. Frontend and analytics depend on them.

## Suggested endpoints

```text
POST   /api/complaints
GET    /api/complaints
GET    /api/complaints/{id}
PATCH  /api/complaints/{id}
POST   /api/complaints/{id}/reassign

GET    /api/queues/{department}
GET    /api/dashboard/stats
GET    /api/complaints/{id}/similar
```

## Submission flow

```text
POST /api/complaints
        ↓
clean text
        ↓
ML prediction
        ↓
entity extraction
        ↓
priority scoring
        ↓
duplicate detection
        ↓
save complaint
        ↓
return complete result
```

## Confidence rule
If department confidence is below the team-approved threshold (recommended initial threshold: 0.60), mark:

```text
status = "Manual Review"
```

Do not silently force low-confidence predictions.

## Database
For the hackathon, SQLite is acceptable and easiest to combine. Keep the schema portable so MongoDB/PostgreSQL can be substituted later if necessary.

## CORS
Enable frontend origin during development. Do not put wildcard CORS into a production claim; for the hackathon it is acceptable if documented.

## Required project structure
```text
backend/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── routes/
│   ├── complaints.py
│   ├── queues.py
│   └── dashboard.py
├── services/
│   ├── classifier.py
│   ├── priority.py
│   ├── entities.py
│   └── duplicates.py
└── requirements.txt
```

## Definition of Done
The backend can:
1. Accept a complaint.
2. Call Member 1's model.
3. Calculate priority.
4. Extract locality/duration.
5. Check duplicates.
6. Store the result.
7. Return JSON that exactly follows the canonical schema.

## Handoff
Provide:
- API base URL.
- Swagger URL.
- Endpoint list.
- Example request/response JSON.
- Database setup instructions.
