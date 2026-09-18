# CivicFlow Backend

Central FastAPI application orchestrating ML prediction, explainable priority scoring, entity extraction, duplicate detection, and municipal queue management.

## Architecture

```text
backend/
├── main.py             # FastAPI entrypoint, CORS, route registration
├── database.py         # SQLAlchemy engine & SQLite session
├── models.py           # Database models adhering to canonical complaint schema
├── schemas.py          # Pydantic validation and response schemas
├── requirements.txt    # Python dependencies
├── routes/
│   ├── complaints.py   # Submit, query, patch, and reassign complaints
│   ├── queues.py       # Department operational priority queues
│   └── dashboard.py    # City-wide KPI aggregate metrics
└── services/
    ├── classifier.py   # ML complaint prediction & fallback heuristics
    ├── priority.py     # 100-point transparent priority scoring
    ├── entities.py     # Regex-driven locality & duration extraction
    └── duplicates.py   # TF-IDF cosine & Haversine duplicate clustering
```

## Running Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the dev server
uvicorn backend.main:app --reload --port 8000
```

- Swagger Interactive UI: `http://localhost:8000/docs`
- ReDoc UI: `http://localhost:8000/redoc`
- Healthcheck: `http://localhost:8000/api/health`
