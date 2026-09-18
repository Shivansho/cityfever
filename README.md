# CivicFlow — Civic Incident Intelligence Platform

> An AI-powered civic operations platform that automatically classifies complaints, extracts entities, calculates explainable operational priority, clusters duplicates, and provides real-time triage queues for municipal field teams.

---

## Repository Structure

```text
civicflow/
├── README.md                          ← Overall project readme
├── .gitignore                         ← Standard gitignore for Python, Node & DB
├── .env.example                       ← Shared environment variable template
│
├── backend/                           ← Member 2: FastAPI integration service
│   ├── main.py                        ← Application entrypoint & middleware
│   ├── database.py                    ← SQLAlchemy database connection
│   ├── models.py                      ← Canonical complaint schema ORM
│   ├── schemas.py                     ← Pydantic validation models
│   ├── requirements.txt               ← Backend dependencies
│   ├── README.md                      ← Backend setup guide
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── complaints.py              ← Submission & triage pipeline
│   │   ├── queues.py                  ← Prioritized department queues
│   │   └── dashboard.py               ← Aggregated KPI statistics
│   └── services/
│       ├── __init__.py
│       ├── classifier.py              ← Member 1: ML prediction & rule fallback
│       ├── priority.py                ← Member 4: 100-pt explainable priority engine
│       ├── entities.py                ← Member 4: Regex locality & duration parser
│       └── duplicates.py              ← Member 4: TF-IDF & Haversine de-duplication
│
├── ml/                                ← Member 1: Model training & evaluation
│   ├── train.py
│   ├── predict.py
│   ├── preprocess.py
│   ├── evaluate.py
│   ├── metrics.json
│   ├── models/
│   │   ├── department_model.joblib
│   │   └── issue_model.joblib
│   └── vectorizers/
│       ├── department_vectorizer.joblib
│       └── issue_vectorizer.joblib
│
├── data/
│   └── generated/                     ← Synthetic & operational datasets
│       ├── generate_dataset.py
│       ├── civicflow_complaints.csv
│       ├── civicflow_train.csv
│       ├── civicflow_test.csv
│       └── dataset_summary.json
│
├── frontend/                          ← Member 3: React / Vite Citizen & Officer portal
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── pages/
│       │   ├── CitizenSubmit.jsx
│       │   └── OfficerDashboard.jsx
│       └── api/
│           └── client.js              ← REST client for backend /api/*
│
├── mapbox/                            ← Member 5: Spatial maps & incident heatmap
│   └── src/
│       ├── MapView.jsx
│       ├── heatmap.js
│       └── filters.js
│
└── docs/
    ├── API_CONTRACT.md                ← Canonical schema & endpoint specification
    ├── member_instructions/           ← Team instructions (Members 1 to 6)
    │   ├── 01_ml_classification.md
    │   ├── 02_backend_api.md
    │   ├── 03_frontend_citizen_dashboard.md
    │   ├── 04_priority_entities.md
    │   ├── 05_mapbox_analytics.md
    │   └── 06_integration_testing_pitch.md
    ├── pitch/                         ← Demo scripts & presentation slides
    └── member4_handoff.md             ← Priority & entity handoff notes
```

---

## Core Features

1. **Intelligent Complaint Routing**: Classifies raw complaints into `department` and `issue_type` with calibrated confidence scores. Low-confidence submissions ($<0.60$) are safely routed to `"Manual Review"`.
2. **Transparent Operational Priority**: 100-point explainable scoring based on Severity (0–40), Duration (0–20), Public Impact (0–20), and Safety Risk (0–20).
3. **Geospatial & Semantic De-duplication**: TF-IDF cosine similarity combined with Haversine distance proximity ($\le 150\text{ m}$) clusters co-located complaints into shared cluster IDs without dropping individual citizen voices.
4. **Operations & Mapbox Dashboard**: Provides departmental priority queues, aggregate KPIs, and heatmaps for field operations.

---

## Quickstart

### 1. Backend Service
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```
Visit API docs at `http://localhost:8000/docs`.

### 2. Run Tests
```bash
python -m unittest tests/test_member4.py
```