# CivicPulse — Master Product Requirements Document (PRD)
## Version 1.0 — Hackathon MVP Specification

---

## 0. Document Purpose

This document is the **single source of truth** for the CivicPulse hackathon project.

All frontend, backend, database, AI/ML, realtime, authority workflow, testing and deployment work must follow this document.

### Priority Rule

If two requirements conflict:

1. This Master PRD wins.
2. More specific technical PRDs may explain implementation details but must not contradict this document.
3. The team should prefer a working end-to-end MVP over additional features.
4. Any feature not required by this PRD is optional and must not delay the core demo.

---

# 1. Product Identity

## Product Name

**CivicPulse**

## One-Line Description

> CivicPulse transforms scattered citizen complaints into explainable, location-aware civic incidents that authorities can detect, prioritize, assign and resolve.

## Product Category

CivicTech / GovTech / AI-assisted Incident Intelligence / Geospatial Analytics

## Core Product Idea

A normal complaint system asks:

> "What complaint did this citizen submit?"

CivicPulse asks:

> "What larger civic problem is emerging across many reports, where is it happening, how unusual is it, how severe is it, and what should the authority investigate?"

The difference is the **intelligence layer**.

---

# 2. Problem Statement

Civic problems often appear through many small signals:

- several citizens report water leakage,
- multiple people report the same damaged road,
- drainage complaints increase around one area,
- garbage complaints concentrate around a location,
- streetlight/electrical complaints repeatedly occur in one zone.

If these reports are handled only as independent tickets, an authority may not immediately see that they represent one larger incident.

CivicPulse aggregates reports using:

- category,
- geographic proximity,
- time,
- report frequency,
- historical/rolling baseline,
- growth rate,
- persistence.

The system detects meaningful patterns and turns them into an **emerging incident** with evidence.

---

# 3. Target Users

## 3.1 Citizen

A citizen can:

- submit a civic issue,
- choose a category,
- describe the issue,
- select a location,
- optionally provide supporting evidence,
- receive a submission confirmation.

### Citizen does NOT need to understand:

- DBSCAN,
- anomaly detection,
- prediction,
- severity formulas,
- backend processing.

Those are internal intelligence capabilities.

---

## 3.2 Authority / Operator

An authority user can:

- view the city intelligence dashboard,
- inspect active incidents,
- inspect hotspots,
- view incident evidence,
- see contributing reports,
- understand why the incident was detected,
- acknowledge an incident,
- assign it to a responsible team,
- move it through response states,
- record resolution,
- verify impact.

---

## 3.3 Admin / Demo Operator

The admin/demo operator can:

- seed deterministic data,
- reset the demo,
- replay the incident scenario,
- monitor system state.

This exists primarily to make the hackathon demonstration reliable.

---

# 4. Core Value Proposition

CivicPulse is not positioned as:

> "Another complaint management dashboard."

It is positioned as:

> **"An intelligence layer that detects emerging civic incidents from fragmented public reports."**

### Core transformation

```text
Many Small Reports
        ↓
Structured Data
        ↓
Spatial + Temporal Analysis
        ↓
Cluster Detection
        ↓
Anomaly Detection
        ↓
Explainable Severity
        ↓
Emerging Incident
        ↓
Authority Response
        ↓
Resolution
        ↓
Impact Measurement
```

---

# 5. Core User Journey

## 5.1 Citizen Report

Citizen opens the report interface.

Provides:

- category,
- description,
- location,
- optional evidence.

The report is submitted.

---

## 5.2 Report Ingestion

Backend:

1. validates request,
2. validates coordinates,
3. stores report,
4. records timestamp,
5. triggers intelligence processing.

---

## 5.3 Intelligence Processing

The intelligence layer:

1. cleans/normalizes the report,
2. classifies category if required,
3. generates spatial and temporal features,
4. checks nearby/recent reports,
5. identifies clusters,
6. compares activity with baseline,
7. calculates severity,
8. determines whether an emerging incident should be created.

---

## 5.4 Incident Creation

If configured thresholds are met:

```text
Cluster + Anomaly + Evidence
            ↓
      Emerging Incident
```

The incident must contain enough evidence for an operator to understand it.

---

## 5.5 Authority Response

Authority sees:

- incident location,
- category,
- severity,
- number of reports,
- detection time,
- anomaly information,
- contributing reports,
- explanation.

Authority can:

```text
Detected
   ↓
Acknowledged
   ↓
Assigned
   ↓
In Progress
   ↓
Resolved
   ↓
Verified
```

---

## 5.6 Impact Verification

After resolution, CivicPulse compares defined activity windows.

Example:

```text
Before resolution:
18 reports / 6 hours

After resolution:
3 reports / 6 hours
```

The system displays the measurable change.

The metric must specify its time windows and must not be presented as proof of causality.

---

# 6. Primary MVP Scenario

## Water Pipeline Leakage Hotspot

This is the main demo scenario because it naturally demonstrates:

- citizen reports,
- location,
- clustering,
- time-based growth,
- anomaly detection,
- severity,
- incident creation,
- authority response,
- resolution,
- before/after impact.

### Scenario

Initially:

```text
Reports are scattered.
No meaningful incident.
```

Then:

```text
Multiple leakage reports appear
within a small geographic area.
```

Then:

```text
Report frequency rises rapidly.
```

CivicPulse detects:

```text
Spatial cluster
+
Activity spike
+
Baseline deviation
```

Then:

```text
🔥 EMERGING WATER LEAKAGE INCIDENT
```

appears on the authority dashboard.

Authority assigns:

```text
Water Response Team
```

After simulated resolution:

```text
Post-resolution report activity decreases.
```

The dashboard shows the before/after metric.

---

# 7. Product Goals

## Goal 1 — Detect Patterns

Convert individual reports into meaningful groups.

## Goal 2 — Surface Emerging Incidents

Do not make authorities manually inspect hundreds of tickets.

## Goal 3 — Explain Detection

Every incident should answer:

- What happened?
- Where?
- When?
- How many reports?
- Why was this considered unusual?
- Why is the severity what it is?

## Goal 4 — Support Response

Move from detection to assignment and resolution.

## Goal 5 — Demonstrate Measurable Impact

Show a before/after activity metric after resolution.

---

# 8. Non-Goals

The MVP will NOT attempt to:

- replace government ERP systems,
- provide legally binding emergency dispatch,
- guarantee prediction accuracy,
- make autonomous government decisions,
- independently determine severity using an LLM,
- build a nationwide production platform,
- integrate with every municipal department,
- require physical IoT hardware,
- require proprietary government datasets,
- build a general-purpose chatbot.

---

# 9. Functional Requirements

## FR-01 — Report Creation

The system must allow a citizen/demo user to create a report.

Required fields:

- category,
- description,
- latitude,
- longitude,
- timestamp.

Optional:

- title,
- image/evidence,
- user ID,
- source metadata.

---

## FR-02 — Report Validation

The backend must validate:

- required fields,
- valid coordinates,
- supported category,
- acceptable description length,
- valid timestamps.

Invalid input must return a clear error.

---

## FR-03 — Report Storage

Each accepted report must be stored in PostgreSQL.

Location must be stored using PostGIS-compatible geometry.

---

## FR-04 — Report Classification

The system should support automatic category classification.

Initial supported categories:

1. Water Leakage
2. Road Damage
3. Garbage/Waste
4. Drainage
5. Streetlight/Electrical
6. Traffic/Safety

For the MVP, a transparent baseline classifier is acceptable.

Optional semantic/embedding-based classification may improve robustness.

---

## FR-05 — Spatial Analysis

The system must identify reports that are geographically close.

Spatial calculations should use PostGIS where appropriate.

---

## FR-06 — Temporal Analysis

The system must support:

- recent report count,
- reports per time window,
- rolling activity,
- growth rate,
- persistence,
- historical/rolling baseline.

---

## FR-07 — Cluster Detection

DBSCAN or an equivalent density-based approach must be available for spatial clustering.

Each cluster should provide:

- cluster ID,
- category,
- report count,
- centroid,
- radius,
- start time,
- end time,
- algorithm parameters.

---

## FR-08 — Anomaly Detection

The system must compare observed activity against a baseline.

MVP methods may include:

- z-score,
- robust deviation,
- rolling baseline threshold.

Optional:

- Isolation Forest.

The anomaly output must contain:

- baseline,
- observed value,
- anomaly score,
- method,
- explanation.

---

## FR-09 — Explainable Severity

Severity must be generated from measurable factors.

Potential factors:

- report volume,
- growth rate,
- spatial concentration,
- anomaly magnitude,
- persistence,
- category-specific weight.

Example output:

```json
{
  "severity": "HIGH",
  "score": 0.82,
  "reasons": [
    "31 reports in the recent window",
    "5.1x above baseline",
    "reports concentrated within 580 meters"
  ]
}
```

Weights must be configurable.

---

## FR-10 — Emerging Incident

The system should create an incident when documented thresholds are satisfied.

Example condition:

```text
Enough reports
+
Meaningful spatial density
+
Activity above baseline
+
Minimum persistence
```

Thresholds must be configurable.

A single ordinary report must not automatically become an incident.

---

## FR-11 — Incident Evidence

Each incident must show:

- incident ID,
- category,
- title,
- severity,
- detection time,
- geographic area,
- report count,
- contributing report IDs,
- time window,
- baseline,
- observed activity,
- anomaly score,
- severity reasons.

---

## FR-12 — Authority Assignment

Authority can assign:

- operator,
- team,
- notes.

Assignment must be recorded.

---

## FR-13 — Status Workflow

Supported states:

```text
DETECTED
ACKNOWLEDGED
ASSIGNED
IN_PROGRESS
RESOLVED
VERIFIED
```

Optional:

```text
REOPENED
```

Only valid transitions are allowed.

---

## FR-14 — Incident Timeline

Every important state/action should generate an event.

Examples:

- incident detected,
- acknowledged,
- assigned,
- status changed,
- note added,
- resolved,
- verified.

---

## FR-15 — Resolution

Authority can record:

- resolution type,
- description,
- resolver,
- resolution timestamp,
- optional evidence.

---

## FR-16 — Impact Measurement

The system should calculate an operational before/after metric.

Example:

```text
Before: 20 reports / 6h
After:   4 reports / 6h
Change: -80%
```

The UI must identify the measurement windows.

This is an operational indicator, not a causal scientific conclusion.

---

## FR-17 — Prediction

Prediction is a secondary feature.

The system may estimate near-term report/activity level.

Example:

```text
Current elevated activity
        ↓
Recent trend
        ↓
Historical baseline
        ↓
Projected next 6 hours
```

Prediction must show uncertainty/limitations when possible.

---

## FR-18 — Realtime Updates

The authority dashboard should support realtime incident events.

Important events:

- report.created
- cluster.created
- cluster.updated
- incident.created
- incident.updated
- incident.resolved

Fallback:

Periodic refresh if WebSocket is unavailable.

---

## FR-19 — Demo Replay

A deterministic replay must allow the team to reproduce the main scenario.

Controls:

- Start
- Pause
- Reset
- Optional speed

---

# 10. AI/ML Architecture

## Intelligence Philosophy

Use AI/ML where it creates real value.

Do not add AI simply for marketing.

### Core intelligence

```text
Report
 ↓
Classification
 ↓
Feature Extraction
 ↓
Spatial Clustering
 ↓
Anomaly Detection
 ↓
Severity
 ↓
Incident Generation
```

### Optional LLM layer

```text
Verified Incident Data
        ↓
       LLM
        ↓
Operator Summary
```

The LLM is an explanation/communication layer, not the source of truth.

---

# 11. Prediction Architecture

Prediction is intentionally separated from incident detection.

```text
Historical Reports
      ↓
Time Features
      ↓
Recent Activity
      ↓
Anomaly Features
      ↓
Prediction Model
      ↓
Near-Term Estimate
```

A prediction must never override an actual incident detection rule.

---

# 12. System Architecture

```text
                 ┌──────────────────────┐
                 │      CITIZEN UI      │
                 │  React + TypeScript  │
                 └──────────┬───────────┘
                            │
                         HTTPS
                            │
                 ┌──────────▼───────────┐
                 │       FastAPI        │
                 │   REST + WebSocket   │
                 └───────┬───────┬──────┘
                         │       │
                  ┌──────▼───┐   │
                  │PostgreSQL│   │
                  │ + PostGIS│   │
                  └──────────┘   │
                                 │
                        ┌────────▼────────┐
                        │ Intelligence    │
                        │ Service         │
                        ├─────────────────┤
                        │ Classification  │
                        │ DBSCAN          │
                        │ Anomaly         │
                        │ Severity        │
                        └────────┬────────┘
                                 │
                         ┌───────▼────────┐
                         │ Prediction     │
                         │ Service        │
                         └────────────────┘

Optional:
FastAPI → Redis → Celery → background processing

Optional:
Verified outputs → LLM → operator summary
```

---

# 13. Technology Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- MapLibre GL JS or Mapbox GL JS
- Chart library such as Recharts
- lightweight state/server-data management

## Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- Uvicorn

## Database

- PostgreSQL
- PostGIS

## AI/ML

- Python
- NumPy
- Pandas
- scikit-learn
- optional sentence-transformers
- optional LLM API

## Realtime

- FastAPI WebSockets
- Redis optional
- Celery optional

## DevOps

- Docker
- docker-compose for local development
- managed frontend hosting
- managed/container backend hosting
- managed PostgreSQL/PostGIS where available

---

# 14. Database Model Summary

Core tables:

```text
users
reports
report_classifications
clusters
anomalies
incidents
incident_reports
assignments
incident_events
predictions
resolutions
impact_metrics
```

Relationships:

```text
User
 └── Reports

Reports
 └── Classification

Reports
 └── Cluster

Cluster
 └── Anomaly

Cluster
 └── Incident

Incident
 ├── Reports
 ├── Assignment
 ├── Events
 ├── Prediction
 ├── Resolution
 └── Impact Metrics
```

---

# 15. API Surface

## Reports

```text
POST /api/v1/reports
GET  /api/v1/reports
GET  /api/v1/reports/{id}
```

## Incidents

```text
GET   /api/v1/incidents
GET   /api/v1/incidents/{id}
PATCH /api/v1/incidents/{id}/status
POST  /api/v1/incidents/{id}/assign
```

## Intelligence

```text
GET /api/v1/hotspots
GET /api/v1/analytics/overview
GET /api/v1/analytics/incidents
```

## Prediction

```text
GET  /api/v1/predictions
POST /api/v1/predictions/{incident_id}/run
```

## Realtime

```text
WS /api/v1/ws/incidents
```

## Health

```text
GET /health
```

---

# 16. Dashboard Requirements

The dashboard must answer five questions immediately:

### 1. What is happening?

Active/emerging incidents.

### 2. Where is it happening?

Map + hotspot.

### 3. How serious is it?

Severity + measurable reasons.

### 4. Why did the system detect it?

Reports + baseline + anomaly + cluster evidence.

### 5. What is the authority doing?

Assignment + status + timeline.

---

# 17. Visual Experience

The visual centerpiece should be the map.

Recommended composition:

```text
┌─────────────────────────────────────────────────────────────┐
│ CivicPulse     Search   Time Filter   System Status         │
├───────────┬─────────────────────────────────┬───────────────┤
│           │                                 │ EMERGING      │
│ Navigation│          CITY MAP              │ INCIDENTS     │
│           │                                 │               │
│ Overview  │     ● ● ●                      │ 🔴 Water Leak │
│ Incidents │        🔥 HOTSPOT              │ 🟠 Road       │
│ Hotspots  │                                 │               │
│ Analytics │                                 │               │
│           │                                 │               │
├───────────┴─────────────────────────────────┴───────────────┤
│ Reports Trend │ Response Metrics │ Resolution Impact        │
└─────────────────────────────────────────────────────────────┘
```

The design must prioritize operational clarity over decoration.

---

# 18. Incident Detail Experience

When a judge clicks an incident:

```text
WATER PIPELINE LEAKAGE
HIGH SEVERITY
Detected 14:32

31 reports
5.1x baseline
580m radius

WHY DETECTED?
✓ 31 reports in 6h
✓ activity above baseline
✓ dense geographic cluster
✓ increasing trend

CONTRIBUTING REPORTS
[report list]

TIMELINE
14:02 report
14:08 report
14:15 cluster formed
14:32 anomaly detected
14:33 incident created

AUTHORITY
Water Response Team
IN PROGRESS

IMPACT
Before: 18 reports/6h
After:   3 reports/6h
```

This screen is critical for the demo.

---

# 19. Realtime Event Flow

Example:

```text
Citizen submits report
        ↓
POST /reports
        ↓
Database
        ↓
Intelligence processing
        ↓
Cluster updated
        ↓
Anomaly detected
        ↓
Incident created
        ↓
WebSocket event
        ↓
Authority dashboard
        ↓
New incident appears LIVE
```

The page should not require a full refresh.

---

# 20. Deterministic Demo Dataset

The demo must contain:

### Normal phase

Scattered reports.

### Emerging phase

Increasing reports in one area.

### Spike phase

Dense reports over a short period.

### Detection phase

Cluster + anomaly + severity.

### Response phase

Authority assignment.

### Resolution phase

Incident resolved.

### Verification phase

Activity decreases.

Use a fixed random seed and reproducible timestamps/coordinates.

---

# 21. Evidence and Explainability

Every intelligence result should be inspectable.

Bad:

```text
AI says HIGH RISK.
```

Good:

```text
HIGH SEVERITY

31 reports
5.1x baseline
580m cluster radius
+240% recent growth
```

The system should expose structured reasons.

---

# 22. LLM Requirements

LLM usage is optional.

If included, the LLM may produce:

- incident summary,
- operator briefing,
- investigation checklist,
- plain-language explanation.

Input:

```json
{
  "category": "water leakage",
  "report_count": 31,
  "baseline": 6,
  "anomaly_score": 4.8,
  "radius_meters": 580,
  "severity": "HIGH"
}
```

Output:

```text
A concentrated increase in water leakage reports has
been detected in the affected area. Activity is substantially
above the recent baseline and reports are geographically
clustered.
```

The LLM must not invent evidence.

---

# 23. Security Requirements

Minimum:

- secrets in environment variables,
- no secrets in Git,
- configured CORS,
- input validation,
- safe file upload validation if uploads exist,
- authority-only workflow actions,
- no stack traces in API responses,
- basic rate limiting/abuse protection where practical.

---

# 24. Reliability Requirements

The core incident flow must work even if optional services fail.

If LLM fails:

```text
Core incident detection continues.
```

If WebSocket fails:

```text
Fallback refresh continues.
```

If advanced ML fails:

```text
Transparent baseline/statistical detection can continue.
```

---

# 25. Performance Requirements

For hackathon MVP:

- dashboard should load quickly,
- map should not render excessive raw markers unnecessarily,
- use spatial aggregation/clustering,
- paginate report lists,
- debounce filters,
- avoid blocking the API with heavy ML processing,
- background jobs may be used for bulk/replay processing.

Do not prematurely optimize.

---

# 26. Testing Requirements

## Unit

Test:

- validation,
- clustering,
- baseline,
- anomaly,
- severity,
- prediction,
- workflow.

## API

Test:

- create report,
- list reports,
- get incident,
- status change,
- assignment,
- resolution,
- analytics.

## Integration

Critical:

```text
Seed
 ↓
Process
 ↓
Cluster
 ↓
Anomaly
 ↓
Incident
 ↓
API
 ↓
Authority
 ↓
Resolution
 ↓
Impact
```

## Frontend

Test:

- dashboard,
- report form,
- incident detail,
- status actions,
- loading/error states.

---

# 27. Deployment Requirements

Deployment should contain as few services as possible.

Minimum:

```text
Frontend
Backend
PostgreSQL + PostGIS
```

Optional:

```text
Redis
Celery
LLM provider
```

only if required.

Required health endpoint:

```text
GET /health
```

Required deployment documentation:

- environment variables,
- migration command,
- seed command,
- reset command,
- replay command,
- frontend build,
- backend start.

---

# 28. 48-Hour Hackathon Implementation Plan

## Hours 0–4

### Team
- initialize repository,
- configure environments,
- read all PRDs,
- freeze API contracts,
- create database schema skeleton.

### Frontend
Dashboard shell.

### Backend
FastAPI + DB connection.

### AI
Synthetic dataset + clustering prototype.

### Geo/Data
Demo coordinates + seed script.

### Integration
Repository, environment, API contract tracking.

---

## Hours 4–12

Build:

```text
Report
 ↓
API
 ↓
DB
 ↓
AI prototype
 ↓
Incident
 ↓
Dashboard
```

This is the first critical milestone.

---

## Hours 12–24

Add:

- map,
- incident detail,
- severity,
- evidence,
- authority workflow,
- realtime,
- deterministic replay.

---

## Hours 24–36

Add:

- prediction,
- analytics,
- resolution impact,
- UI polish,
- LLM summary if stable.

---

## Hours 36–42

Stop adding major features.

Focus on:

- integration,
- bugs,
- reliability,
- demo scenario,
- deployment.

---

## Hours 42–46

Full rehearsal.

Test:

```text
Citizen
→ Report
→ Detection
→ Incident
→ Authority
→ Assignment
→ Resolution
→ Impact
```

---

## Hours 46–48

Code freeze.

Only:

- bug fixes,
- deployment,
- final testing,
- presentation,
- backup demo data.

---

# 29. Team Ownership

## Person 1 — Frontend/UI

Own:

- React
- TypeScript
- Tailwind
- map
- dashboard
- incident screens
- citizen report UI
- charts

Primary PRDs:

```text
02_UI_UX_PRD
08_FRONTEND_INTEGRATION_PRD
```

---

## Person 2 — Backend

Own:

- FastAPI
- PostgreSQL integration
- SQLAlchemy
- APIs
- validation
- business logic

Primary PRDs:

```text
03_DATABASE_PRD
04_BACKEND_API_PRD
```

---

## Person 3 — AI/ML

Own:

- classification
- feature extraction
- DBSCAN
- anomaly detection
- severity
- prediction

Primary PRDs:

```text
05_AI_INTELLIGENCE_PRD
06_PREDICTION_PRD
```

---

## Person 4 — Geo/Data/Realtime

Own:

- PostGIS spatial logic
- demo data
- seed/reset/replay
- WebSocket events
- realtime integration support

Primary PRDs:

```text
09_REALTIME_PRD
10_DEMO_DATA_PRD
```

---

## Person 5 — Integration/Product

Own:

- authority workflow
- end-to-end integration
- testing
- deployment
- demo
- final product consistency

Primary PRDs:

```text
01_MASTER_PRD
07_AUTHORITY_WORKFLOW_PRD
11_TESTING_PRD
12_DEPLOYMENT_PRD
```

---

# 30. Definition of Done

The MVP is considered complete only when this exact scenario works:

```text
1. User submits water leakage report.
2. Report is stored.
3. Reports accumulate in the same area.
4. System detects geographic cluster.
5. System compares activity with baseline.
6. Anomaly is detected.
7. Severity is calculated with reasons.
8. Emerging incident is created.
9. Incident appears on authority dashboard.
10. Judge opens incident.
11. Evidence is visible.
12. Authority acknowledges.
13. Authority assigns response team.
14. Status becomes In Progress.
15. Authority resolves incident.
16. Before/after activity is displayed.
17. Incident becomes Verified.
```

If this works reliably, the MVP is successful even if optional features are incomplete.

---

# 31. What Must NOT Be Over-Engineered

Do not spend hackathon time on:

- microservice explosion,
- custom deep-learning models,
- complex authentication,
- complicated role hierarchies,
- blockchain,
- IoT hardware,
- real government integrations,
- perfect production-scale infrastructure,
- elaborate chatbot,
- unnecessary 3D maps,
- dozens of dashboard pages.

The strongest demonstration is the **intelligence-to-action loop**.

---

# 32. Critical Product Risks

## Risk 1 — Looks Like a Complaint Portal

### Mitigation
Make clustering, anomaly detection and incident evidence the visual center.

## Risk 2 — AI Feels Fake

### Mitigation
Show measurable inputs and reasons.

## Risk 3 — Prediction Is Unconvincing

### Mitigation
Keep prediction secondary and clearly label demo/synthetic limitations.

## Risk 4 — Integration Breaks

### Mitigation
Freeze API contracts early and test the vertical slice first.

## Risk 5 — Demo Depends on External APIs

### Mitigation
Use deterministic local demo data. Treat external APIs as optional enrichment.

## Risk 6 — Too Many Features

### Mitigation
Protect the core flow and cut optional features first.

---

# 33. Demo Story

The demo should tell a story, not show random screens.

### Scene 1 — Normal City

Dashboard shows normal activity.

### Scene 2 — Citizens Start Reporting

New reports appear around one area.

### Scene 3 — Pattern Emerges

Reports become geographically concentrated.

### Scene 4 — Intelligence Activates

System displays:

```text
Cluster detected
Activity above baseline
Severity: HIGH
```

### Scene 5 — Incident Appears

A new incident appears on the map without page refresh.

### Scene 6 — Explain It

Open incident:

```text
31 reports
5.1x baseline
580m radius
rapid recent growth
```

### Scene 7 — Authority Acts

Assign response team.

### Scene 8 — Resolution

Mark resolved.

### Scene 9 — Impact

Show reduced activity after resolution.

### Final Message

> "CivicPulse doesn't just collect complaints. It detects the civic problem emerging behind them and helps authorities act on evidence."

---

# 34. Judge-Facing Technical Narrative

If asked:

### "Where is the AI?"

Answer:

> "The intelligence pipeline combines classification, spatial clustering, anomaly detection and explainable severity. The LLM is optional and is used only to communicate verified intelligence."

### "Why DBSCAN?"

Answer:

> "Because civic reports are naturally spatial, and density-based clustering can identify concentrated groups without requiring us to predefine the number of clusters."

### "Why not just use an LLM?"

Answer:

> "An LLM is not the right primitive for geospatial density or statistically comparing activity with a baseline. We use deterministic/statistical/ML methods for those decisions and reserve the LLM for summarization."

### "How do you know an incident is real?"

Answer:

> "The MVP does not claim ground truth from synthetic data. It creates an evidence-backed emerging incident when configured spatial, temporal and anomaly thresholds are satisfied."

### "Can this scale?"

Answer:

> "The architecture separates ingestion, PostGIS spatial queries, intelligence processing, prediction and presentation. Background processing can be moved to Redis/Celery workers as volume grows."

---

# 35. Success Metrics for the Hackathon Demo

Measure the product using:

- time from report submission to incident detection,
- number of reports contributing to an incident,
- spatial concentration,
- deviation from baseline,
- authority response time in the simulated workflow,
- before/after activity change.

Do not fabricate real-world adoption or accuracy numbers.

---

# 36. Future Product Vision

After the hackathon, CivicPulse could evolve toward:

- multi-city deployment,
- historical municipal datasets,
- department-specific models,
- multimodal image evidence,
- richer geospatial forecasting,
- GIS integrations,
- mobile citizen app,
- authority integrations,
- automated triage,
- multilingual report understanding,
- privacy-preserving analytics,
- stronger model evaluation with real labelled datasets.

These are future directions, not MVP requirements.

---

# 37. Final Product Boundary

The project should always remain centered around:

```text
REPORTS
   ↓
PATTERNS
   ↓
INCIDENTS
   ↓
ACTION
   ↓
MEASURABLE OUTCOME
```

If a proposed feature does not strengthen this loop, it is lower priority.

---

# 38. Final Source-of-Truth Statement

For implementation purposes, CivicPulse consists of five major layers:

```text
1. EXPERIENCE
   React dashboard + citizen reporting

2. DATA
   PostgreSQL + PostGIS

3. INTELLIGENCE
   Classification + clustering + anomaly + severity

4. OPERATIONS
   Authority assignment + status + resolution

5. OUTCOME
   Prediction + before/after impact + analytics
```

The hackathon MVP succeeds when these layers operate together in one believable, repeatable live scenario.

**End of Master PRD**
