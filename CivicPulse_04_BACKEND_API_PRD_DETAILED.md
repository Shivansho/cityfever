# CivicPulse — Backend & API Product Requirements Document
## Version 1.0 — FastAPI Backend

> This document defines the backend/API implementation contract for CivicPulse.
> It follows the Master PRD, UI/UX PRD, and Database PRD.

---

# 1. Backend Mission

The backend is the central orchestration layer between:

```text
Citizen / Authority Frontend
          ↓
       FastAPI
          ↓
 ┌────────┼─────────┐
 ↓        ↓         ↓
Database  AI       Realtime
 ↓        ↓         ↓
PostGIS  Intelligence Events
          ↓
      Predictions
```

The backend owns:

- validation,
- authentication/authorization,
- report ingestion,
- AI processing orchestration,
- spatial/temporal analysis,
- incident creation,
- authority workflow,
- prediction requests,
- analytics,
- realtime events.

The frontend must not implement core business rules.

---

# 2. Technology Decision

## Required

```text
Python 3.11+
FastAPI
Pydantic
SQLAlchemy 2.x
Alembic
PostgreSQL
PostGIS
```

## Recommended

```text
Uvicorn
httpx
Pytest
pytest-asyncio
```

## Optional

```text
Redis
Celery/RQ
WebSocket
```

Do not introduce Redis/background workers unless they solve an actual MVP requirement.

---

# 3. Backend Architecture

Use a modular monolith.

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── deps.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── reports.py
│   │       ├── incidents.py
│   │       ├── hotspots.py
│   │       ├── analytics.py
│   │       ├── predictions.py
│   │       └── demo.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── exceptions.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── services/
│   │   ├── report_service.py
│   │   ├── intelligence_service.py
│   │   ├── incident_service.py
│   │   ├── prediction_service.py
│   │   └── analytics_service.py
│   │
│   ├── ai/
│   ├── realtime/
│   └── db/
│
├── tests/
├── alembic/
└── requirements.txt
```

---

# 4. Architectural Rule

Routes should be thin.

Bad:

```text
POST /reports
  → route performs DB insert
  → route performs clustering
  → route calculates anomaly
  → route creates incident
  → route sends websocket
```

Good:

```text
POST /reports
      ↓
ReportService
      ↓
IntelligenceService
      ↓
IncidentService
      ↓
RealtimePublisher
```

---

# 5. API Base URL

Development:

```text
/api/v1
```

Example:

```text
http://localhost:8000/api/v1
```

Production URL should be environment-configured.

---

# 6. API Versioning

All public endpoints should use:

```text
/api/v1/...
```

Future versions can use:

```text
/api/v2/...
```

Do not create versioning inconsistently across endpoints.

---

# 7. Health Endpoint

## GET `/health`

Response:

```json
{
  "status": "ok",
  "service": "civicpulse-api"
}
```

Optional dependency status:

```json
{
  "status": "ok",
  "database": "ok"
}
```

Do not expose credentials or internal details.

---

# 8. Authentication

For MVP, support:

```text
JWT access token
```

Roles:

```text
CITIZEN
AUTHORITY
ADMIN
```

JWT should contain:

```json
{
  "sub": "user-id",
  "role": "AUTHORITY"
}
```

The exact JWT library can be selected during implementation.

---

# 9. Authorization

Citizen:

```text
Create report
View own reports
```

Authority:

```text
View reports
View incidents
View hotspots
Update incidents
Assign teams
Resolve incidents
View analytics
```

Admin:

```text
All authority permissions
Demo controls
```

Do not trust a role supplied by the frontend.

Role must come from validated authentication.

---

# 10. Authentication Endpoints

## POST `/auth/register`

Request:

```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "password"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "name": "Rahul",
    "role": "CITIZEN"
  }
}
```

## POST `/auth/login`

Request:

```json
{
  "email": "rahul@example.com",
  "password": "password"
}
```

Response:

```json
{
  "access_token": "JWT",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "Rahul",
    "role": "CITIZEN"
  }
}
```

---

# 11. Report API

## POST `/reports`

Purpose:

Create a civic report.

Request:

```json
{
  "category": "water_leakage",
  "title": "Water leaking from road",
  "description": "Water has been flowing continuously for the last hour.",
  "latitude": 27.1767,
  "longitude": 78.0081,
  "image_url": null
}
```

Backend responsibilities:

1. validate input,
2. validate coordinates,
3. create report,
4. trigger intelligence processing,
5. return report ID/status.

Response:

```json
{
  "id": "uuid",
  "category": "water_leakage",
  "status": "RECEIVED",
  "reported_at": "timestamp"
}
```

---

# 12. Report Validation

Validate:

- category,
- description length,
- latitude range,
- longitude range,
- image URL if supplied.

Latitude:

```text
-90 to 90
```

Longitude:

```text
-180 to 180
```

Reject malformed coordinates.

---

# 13. GET `/reports`

Query parameters:

```text
category
status
start_time
end_time
latitude
longitude
radius
page
page_size
```

Example:

```text
GET /reports?category=water_leakage&page=1&page_size=50
```

Response:

```json
{
  "items": [],
  "page": 1,
  "page_size": 50,
  "total": 123
}
```

Never return unlimited reports.

---

# 14. GET `/reports/{report_id}`

Returns:

- report details,
- location,
- classification,
- timestamps,
- linked incident if available.

---

# 15. Intelligence Trigger

After report creation:

```text
POST /reports
     ↓
Persist report
     ↓
Classify / normalize
     ↓
Check spatial-temporal pattern
     ↓
Update cluster
     ↓
Calculate anomaly
     ↓
Evaluate incident threshold
     ↓
Create/update incident if needed
     ↓
Publish realtime event
```

This pipeline can be synchronous for a small demo dataset.

If processing becomes slow, move expensive tasks to a worker.

---

# 16. Intelligence Service

The intelligence service should expose internal functions conceptually:

```python
process_report(report)
find_nearby_reports(report)
build_or_update_cluster(...)
calculate_baseline(...)
calculate_anomaly(...)
evaluate_incident(...)
```

These are internal service methods, not necessarily public HTTP endpoints.

---

# 17. Cluster API

## GET `/hotspots`

Query:

```text
category
start_time
end_time
min_reports
```

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "category": "water_leakage",
      "latitude": 27.1767,
      "longitude": 78.0081,
      "radius_meters": 580,
      "report_count": 31
    }
  ]
}
```

---

# 18. Incident API

## GET `/incidents`

Query:

```text
status
severity
category
start_time
end_time
page
page_size
```

Response:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 4
}
```

---

# 19. GET `/incidents/{incident_id}`

Response should include:

```text
incident
evidence
supporting reports
assignment
timeline
prediction if available
resolution if available
impact metrics
```

Conceptual response:

```json
{
  "id": "uuid",
  "title": "Water Pipeline Leakage",
  "category": "water_leakage",
  "severity": "HIGH",
  "status": "DETECTED",
  "report_count": 31,
  "radius_meters": 580,
  "evidence": {
    "baseline": 6,
    "observed": 31,
    "anomaly_score": 5.1,
    "reasons": [
      "High report concentration",
      "Activity above baseline"
    ]
  },
  "timeline": []
}
```

---

# 20. Incident Status API

## PATCH `/incidents/{incident_id}/status`

Request:

```json
{
  "status": "ACKNOWLEDGED",
  "note": "Authority has reviewed the incident."
}
```

Backend must validate transition.

Valid example:

```text
DETECTED
  ↓
ACKNOWLEDGED
  ↓
ASSIGNED
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
VERIFIED
```

Do not allow arbitrary transitions.

---

# 21. Assignment API

## POST `/incidents/{incident_id}/assign`

Request:

```json
{
  "team_id": "uuid",
  "notes": "Inspect pipeline near affected area."
}
```

Backend:

1. validate authority permission,
2. verify team,
3. create assignment,
4. update incident state,
5. create incident event,
6. publish realtime event.

---

# 22. Resolution API

## POST `/incidents/{incident_id}/resolve`

Request:

```json
{
  "resolution_type": "pipeline_repair",
  "description": "Damaged section repaired."
}
```

Backend:

1. validate status,
2. create resolution,
3. update incident,
4. create event,
5. calculate/store impact where possible,
6. publish realtime event.

---

# 23. Incident Timeline

## GET `/incidents/{incident_id}/events`

Response:

```json
{
  "items": [
    {
      "event_type": "INCIDENT_CREATED",
      "timestamp": "timestamp",
      "description": "Emerging incident detected."
    },
    {
      "event_type": "ASSIGNED",
      "timestamp": "timestamp",
      "description": "Water Response Team assigned."
    }
  ]
}
```

Events should be append-only.

---

# 24. Analytics API

## GET `/analytics/overview`

Response:

```json
{
  "active_incidents": 12,
  "emerging_incidents": 4,
  "high_severity": 3,
  "reports_last_24h": 248
}
```

## GET `/analytics/trends`

Query:

```text
category
start_time
end_time
interval
```

Response should provide chart-ready aggregated data.

---

# 25. Prediction API

## GET `/predictions`

Query:

```text
category
incident_id
horizon
```

Response:

```json
{
  "category": "water_leakage",
  "forecast_start": "timestamp",
  "forecast_end": "timestamp",
  "predicted_value": 18,
  "lower_bound": 14,
  "upper_bound": 22
}
```

Prediction should be clearly separated from observed data.

---

# 26. Prediction Generation

Internal flow:

```text
Historical reports
       ↓
Feature engineering
       ↓
Forecast model
       ↓
Prediction
       ↓
Store prediction
       ↓
API
       ↓
Frontend
```

For hackathon MVP, a transparent statistical baseline may be preferable to an unnecessarily complex model.

---

# 27. Demo API

Admin/demo endpoints:

## POST `/demo/reset`

Reset database/demo state.

## POST `/demo/seed`

Load deterministic dataset.

## POST `/demo/replay/start`

Start replay.

## POST `/demo/replay/reset`

Reset replay.

## GET `/demo/replay/status`

Return:

```json
{
  "running": true,
  "scenario": "water_pipeline_leakage",
  "step": 3
}
```

These endpoints must be protected or disabled in production.

---

# 28. Realtime Architecture

Recommended:

```text
FastAPI
  ↓
Event Publisher
  ↓
WebSocket Manager
  ↓
Connected Authority Clients
```

WebSocket:

```text
/ws
```

Events:

```text
report.created
cluster.updated
incident.created
incident.updated
assignment.created
incident.resolved
```

---

# 29. Realtime Event Contract

Example:

```json
{
  "event_id": "uuid",
  "event_type": "incident.created",
  "timestamp": "2026-01-01T14:32:00Z",
  "entity_type": "incident",
  "entity_id": "uuid",
  "payload": {
    "title": "Water Pipeline Leakage",
    "severity": "HIGH",
    "report_count": 31
  }
}
```

Clients should update only affected state.

---

# 30. Error Format

All errors should follow one structure:

```json
{
  "error": {
    "code": "INCIDENT_INVALID_STATUS_TRANSITION",
    "message": "Incident cannot be resolved from its current state.",
    "details": null
  }
}
```

Example codes:

```text
INVALID_REQUEST
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
INCIDENT_INVALID_STATUS_TRANSITION
TEAM_NOT_FOUND
REPORT_NOT_FOUND
INTERNAL_ERROR
```

---

# 31. HTTP Status Codes

Use:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Do not return `200` for every error.

---

# 32. API Pagination

For potentially large resources:

```text
page
page_size
```

Maximum:

```text
page_size <= 100
```

Use a consistent pagination response.

---

# 33. Filtering

Filters must be validated.

Example:

```text
status=ACTIVE
```

should not be accepted if `ACTIVE` is not a valid backend status.

Normalize enum values centrally.

---

# 34. Service Layer

Recommended services:

```text
ReportService
IncidentService
HotspotService
IntelligenceService
PredictionService
AnalyticsService
DemoService
RealtimeService
```

Each service owns its domain behavior.

---

# 35. Repository/Data Access Layer

For larger codebase:

```text
repositories/
├── report_repository.py
├── incident_repository.py
├── cluster_repository.py
└── analytics_repository.py
```

For hackathon, repositories may remain lightweight.

Do not create abstraction layers that provide no value.

---

# 36. Transaction Rules

Important multi-step operations should use transactions.

Example incident resolution:

```text
BEGIN
  create resolution
  update incident
  create event
COMMIT
```

If any required step fails, rollback.

---

# 37. Idempotency

Important mutation operations should avoid accidental duplicates.

Especially:

```text
resolve incident
assign incident
create demo event
```

Use state validation and/or idempotency keys where necessary.

For hackathon, state validation is sufficient unless duplicate requests are a demonstrated concern.

---

# 38. Background Processing

Do not immediately add Celery.

Use synchronous processing when:

- demo dataset is small,
- processing is fast,
- response latency is acceptable.

Use background workers if:

- LLM processing is slow,
- image processing is slow,
- large batch clustering is required.

---

# 39. LLM Integration Boundary

LLM should NOT control:

- incident status,
- anomaly score,
- geographic clustering,
- severity threshold directly,
- database permissions.

LLM can assist with:

- report normalization,
- text summarization,
- explanation generation,
- authority-facing incident summary.

Example:

```text
Structured detection evidence
          ↓
        LLM
          ↓
Human-readable explanation
```

The numerical detection remains deterministic.

---

# 40. AI Failure Handling

If AI service fails:

```text
Report still gets stored.
```

The system should continue using:

- user-provided category,
- deterministic rules,
- statistical/spatial intelligence.

AI must improve the system, not become a single point of failure.

---

# 41. API Security

Minimum:

- JWT authentication,
- role checks,
- input validation,
- rate limiting where appropriate,
- CORS configuration,
- environment-based secrets,
- no raw exception traces to clients.

---

# 42. CORS

Development may allow frontend origin.

Production:

```text
CORS_ALLOW_ORIGINS
```

must be explicitly configured.

Do not use unrestricted CORS in production.

---

# 43. Environment Variables

Required conceptually:

```text
DATABASE_URL
JWT_SECRET
JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
CORS_ALLOW_ORIGINS
LLM_API_KEY
MAP_API_KEY
```

Only include variables actually used.

Never commit secrets.

---

# 44. Logging

Log:

- request failures,
- important state changes,
- intelligence processing failures,
- realtime errors,
- external API failures.

Do not log:

- passwords,
- JWT secrets,
- API keys,
- sensitive user information.

---

# 45. Observability

For MVP:

```text
structured application logs
health endpoint
basic request timing
```

Future:

```text
OpenTelemetry
Prometheus
Grafana
Sentry
```

Not required for hackathon.

---

# 46. Testing

Minimum backend tests:

### Unit

- coordinate validation,
- anomaly calculation,
- severity calculation,
- status transitions.

### API

- create report,
- get incident,
- assign incident,
- resolve incident.

### Integration

```text
Report
 ↓
Cluster
 ↓
Anomaly
 ↓
Incident
```

---

# 47. Backend Definition of Done

Backend is complete when:

1. FastAPI starts.
2. Database connects.
3. `/health` works.
4. Authentication works.
5. Reports can be created.
6. Reports can be queried.
7. Spatial intelligence can run.
8. Clusters can be returned.
9. Incidents can be created.
10. Incident evidence is available.
11. Authority can update workflow.
12. Assignment works.
13. Resolution works.
14. Analytics work.
15. Prediction endpoint works.
16. Realtime events work.
17. Demo replay works.
18. Errors use consistent format.
19. Tests cover critical flows.
20. Deployment environment variables are documented.

---

# 48. Critical MVP Rule

Do not build a distributed microservice architecture.

For the hackathon:

```text
Frontend
   ↓
FastAPI
   ↓
PostgreSQL/PostGIS
   ↓
AI/ML services
```

is enough.

Optional:

```text
Redis
```

only if genuinely required.

---

# 49. Main End-to-End Flow

```text
Citizen
  ↓
POST /reports
  ↓
FastAPI validation
  ↓
PostgreSQL
  ↓
IntelligenceService
  ↓
Spatial + temporal analysis
  ↓
Cluster
  ↓
Anomaly
  ↓
Incident
  ↓
Realtime event
  ↓
Authority dashboard
  ↓
Acknowledge
  ↓
Assign team
  ↓
In Progress
  ↓
Resolve
  ↓
Impact calculation
  ↓
Realtime update
```

---

# 50. Water Leakage Demo API Sequence

The live demo should approximately execute:

```text
1. POST /demo/reset

2. POST /demo/seed

3. GET /analytics/overview

4. POST /demo/replay/start

5. New reports arrive

6. Backend detects spatial concentration

7. Anomaly score increases

8. Incident is created

9. WebSocket:
   incident.created

10. Authority opens incident

11. PATCH /incidents/{id}/status
    ACKNOWLEDGED

12. POST /incidents/{id}/assign

13. PATCH /incidents/{id}/status
    IN_PROGRESS

14. POST /incidents/{id}/resolve

15. Backend stores impact metric

16. WebSocket:
    incident.updated
```

This sequence is the backend backbone of the hackathon demo.

---

# 51. What NOT to Build

Do not spend hackathon time on:

- microservices,
- Kubernetes,
- complex event buses,
- elaborate RBAC hierarchy,
- custom API gateway,
- advanced distributed tracing,
- unnecessary GraphQL,
- complex caching,
- enterprise billing,
- multi-region deployment.

Build the smallest architecture that can convincingly demonstrate the product.

---

# 52. Final Backend Principle

The backend should make this chain trustworthy:

```text
A report happened
      ↓
A pattern emerged
      ↓
The system detected it
      ↓
Evidence explains why
      ↓
An authority acted
      ↓
The incident was resolved
      ↓
The outcome was measured
```

If the backend can reliably execute this chain during the live demo, it supports the core CivicPulse value proposition.

**End of Backend/API PRD**
