# CivicFlow Understanding Report

> Note on naming: the framing brief that requested this report called the project
> "CityFever"/"CivicPulse." All six PRDs (`docs/member_instructions/01`-`06`) call it
> "CivicFlow." This document uses CivicFlow throughout because the PRDs are the stated
> source of truth. The scope conflict this implies is preserved below, unresolved, exactly
> as it was found — see §17.

Before the report itself, the largest finding, because it affects everything below.

> **Potential PRD conflict/ambiguity — project identity and scope.** The original framing
> brief describes a system with hotspot detection, anomaly detection, incident creation, a
> prediction/future-risk pipeline, WebSocket realtime, an authority acknowledge → assign →
> respond → verify → impact workflow, PostgreSQL, and a water-pipeline-leakage demo.
> All six PRDs describe a narrower system: NLP complaint classification, routing, priority
> scoring and duplicate detection, with a citizen form, an officer queue, and a Mapbox view.
> None of the PRDs mention hotspots, anomalies, incidents, prediction, WebSockets,
> PostgreSQL, acknowledge/verify/impact stages, or water pipeline leakage.
> `02_backend_api.md` specifies SQLite. `06_integration_testing_pitch.md` scripts a
> **sewage overflow** demo, not water leakage.
>
> This report and everything built from it describe CivicFlow as the PRDs define it.
> Everything from the framing brief that the PRDs don't contain is listed in §15 and §17 as
> unresolved, not folded in silently.

---

## 1. What CivicFlow is

A civic complaint intake and triage system. A citizen submits free-text complaint text; the
system automatically determines which **department** should own it and what **issue type**
it is, assigns an explainable **priority score** out of 100, extracts **locality** and
**duration** from the text, and flags **possible duplicates** of nearby similar reports.
Officers work the resulting queue, see the reasoning behind each recommendation, reassign or
update status, and view complaints on a map.

Two design principles run through the PRDs and matter more than any single feature:

- **Priority is a recommendation, not suppression** (`04`).
- **Nothing is deleted or hidden** — duplicates cluster reports operationally while every
  citizen submission is retained (`04`); low-confidence predictions are never silently
  forced (`02`).

## 2. Complete end-to-end flow

```
Citizen submits complaint text (+ optional locality, optional map location)
        ↓
POST /api/complaints
        ↓
clean text → ML classification → entity extraction → priority scoring
        ↓
duplicate detection
        ↓
confidence gate (department_confidence < 0.60 → status = "Manual Review")
        ↓
save to database → return canonical JSON
        ↓
Officer queue / dashboard stats / Mapbox markers read the same records
        ↓
Officer action: reassign department, update status
```
No stage exists after officer action — no verification, no impact/outcome stage, no citizen
notification. Not specified in the provided PRDs.

## 3. Architecture

```
React + Vite frontend  ──HTTP/JSON──┐
  ├── CitizenSubmit                 │
  ├── OfficerDashboard              ├──►  FastAPI (backend/)
  └── MapView (Mapbox GL)           │       ├── routes/: complaints, queues, dashboard
                                    │       ├── services/: classifier, priority,
Mapbox API ◄── token from env ──────┘       │              entities, duplicates
                                            │       └── SQLite via SQLAlchemy models
                              ml/ package ──┘  (imported by services/classifier.py)
```

- ML runs in-process, imported directly — no model-serving API.
- Priority/entities/duplicates are plain Python modules under `backend/services/`, imported
  directly by the backend, not called over HTTP.
- Synchronous request/response only — no queue, no background workers, no WebSockets.
- SQLite, kept portable for a future Postgres/Mongo swap if needed.

## 4. Main modules

| # | Module | Owner | Deliverable |
|---|---|---|---|
| 1 | ML classification | Member 1 | `ml/` — train, predict, preprocess, evaluate, models, `metrics.json` |
| 2 | Backend API | Member 2 | `backend/` — FastAPI, models, routes, service wiring |
| 3 | Frontend | Member 3 | `frontend/` — citizen page, officer dashboard, API client |
| 4 | Priority / entities / duplicates | Member 4 | `backend/services/priority.py`, `entities.py`, `duplicates.py` |
| 5 | Mapbox + analytics | Member 5 | `MapView.jsx`, `heatmap.js`, `filters.js` |
| 6 | Integration / testing / demo / pitch | You | repo structure, seed data, env config, README, pitch, fallback plan |

## 5. Database overview

One entity defined: **Complaint**. See `docs/API_CONTRACT.md` §1 for the full field list.
Departments (`01`): Roads, Water, Sanitation, Electrical, Sewage, Traffic, Parks, Other.
The only relationship is `duplicate_cluster_id` grouping complaints into clusters — no
cluster table, no user/officer table, no audit history defined anywhere in the six PRDs.

## 6. AI/ML pipeline

Input `text: str` → output `{department, department_confidence, issue_type,
issue_confidence}`. Two classifiers per target (TF-IDF + Logistic Regression baseline,
Linear SVM comparison), persisted via joblib. Preprocessing must be identical at train and
inference time. Real precision/recall/F1 required in `ml/metrics.json` — no hard-coded
metrics permitted.

## 7. Prediction pipeline

Limited to ML classification above (§6). A forecasting/future-risk pipeline is **not
specified in the provided PRDs**.

## 8. Realtime pipeline

**Not specified in the provided PRDs.** No WebSocket, SSE, or push mechanism in any of the
six documents. Simple client-side polling of existing GET endpoints would fit within scope
if the team wants live-updating views, but that is a suggestion, not a requirement.

## 9. Authority (officer) workflow

Open dashboard → see totals/filters → open a complaint and see its prediction, confidence,
priority and reasons → reassign department or update status → open on map. No login, no
role separation, no acknowledgement/assignment/verification stages — not specified in the
provided PRDs.

## 10. Demo storyline

See `docs/pitch/DEMO_SCRIPT.md` for the full walkthrough, scripted per `06`: sewage overflow
opening → officer dashboard → duplicate detection on a second nearby report → Mapbox →
close on real model metrics.

## 11. Critical APIs/interfaces

See `docs/API_CONTRACT.md` for the full, current, canonical contract (this supersedes any
older restatement of endpoints/schema — that file is kept up to date, this report is not).

## 12. Module dependencies

Members 1 and 4 are independent of each other and unblocked from day one. Member 2 depends
on both before being fully real. Members 3 and 5 can build against the frozen canonical
schema before Member 2's code exists. Member 5 depends on Member 4's duplicate output and
must not reimplement it. You depend on all five other members and on Member 5's handoff
note specifically for documenting the map setup.

## 13. MVP-critical features

1. Backend starts, DB initializes, ML models load.
2. `POST /api/complaints` runs the full pipeline and returns the canonical schema.
3. Classification returns department/issue type/confidence.
4. Priority returns score, level, and reasons.
5. Entity extraction returns locality and duration.
6. Duplicate detection returns similarity and cluster ID; originals stay visible.
7. Confidence below 0.60 → Manual Review, visibly flagged in the queue.
8. Citizen page renders the real API response.
9. Officer dashboard: counts, filters, queue, detail view, reassign, status update.
10. Map: real markers, click detail, filters.
11. Real `metrics.json`.
12. Seed dataset covering all required characteristics (see `docs/pitch/FALLBACK_PLAN.md`).
13. Clean-environment run, rehearsed end-to-end at least once.

## 14. Optional features

Mapbox heatmap/density (`05`, "if time permits"), 24h/7d/30d map time filters, citizen-side
map location picker, optional locality field on the citizen form, custom NER model, extra
locality analytics beyond the required minimum, Postgres/Mongo migration.

## 15. Things explicitly NOT to build

No FastAPI/frontend work inside the ML module; no hard-coded ML metrics; no ML logic or
duplicate priority calculation in the frontend; no fake dashboard numbers once integration
begins; no custom-trained NER as a first move; never delete original complaints; no second
duplicate-detection algorithm; never commit the Mapbox token; do not rewrite other members'
modules — diagnose contract mismatches and talk to the owner; never present synthetic demo
data as real government data; no renaming canonical schema fields.

Not treated as "do not build," but also not built here because the PRDs are silent, not
prohibitive: hotspot detection, anomaly detection, incident entities, forecasting,
WebSockets, and the extended authority lifecycle from the framing brief. See §17.

## 16. Integration risks (status as of this build)

1. **`priority_reasons` missing from canonical schema** — resolved by adding it in
   `docs/API_CONTRACT.md` §1; needs a DB column from Member 2.
2. **`/api/dashboard/stats` shape undefined** — resolved with a proposed shape in
   `docs/API_CONTRACT.md` §5; needs Member 2's sign-off.
3. **Duplicate output mostly discarded** — resolved via `/similar` endpoint shape (§6) and
   `duplicate_cluster_size` field (§7) in the contract.
4. **ML trained on synthetic data** — inherent limitation, documented in root README.
5. **First-request latency** — mitigated via a documented warm-up step in
   `docs/pitch/FALLBACK_PLAN.md`.
6. **Duplicate detection is O(n)** — acceptable at demo scale, noted as a known limitation.
7. **Mapbox needs live internet** — covered by Tier 4 of `docs/pitch/FALLBACK_PLAN.md`.
8. **Seed dataset vs. ML training data confusion** — resolved by separating
   `data/generated/` (Member 1's training corpus), `backend/civicflow_seed_complaints.json`
   + `backend/seed_demo.py` (live-pipeline demo seed), and `data/fallback/` (precomputed
   fallback) — see `docs/pitch/FALLBACK_PLAN.md`.
9. **Map component location unsettled** (`mapbox/` vs `frontend/src/map/`) — still open,
   not specified in the provided PRDs.
10. **Status vocabulary open** — proposed in `docs/API_CONTRACT.md` §3, needs sign-off.
11. **`seed_demo.py` health check assumes a root `/` route exists** — flagged in
    `docs/pitch/FALLBACK_PLAN.md`, not yet fixed; confirm with Member 2.

## 17. Questions/ambiguities (still open, need team decisions)

- **Project scope**: CivicFlow-as-specified vs. the broader CityFever/CivicPulse concept
  from the framing brief. Blocking question — affects README, contract, and pitch.
- **Project name**: CityFever / CivicPulse / CivicFlow — three names in play.
- **Demo scenario**: water leakage (framing brief) vs. sewage overflow (`06`'s actual
  script). Currently built to `06`.
- **`issue_type` vocabulary**: not enumerated anywhere; a working list is proposed in
  `docs/API_CONTRACT.md` §2 pending Member 1's real training labels.
- **Endpoint list authority**: `02` calls its endpoints "suggested" while `03`/`05` are told
  to treat the contract as fixed. Currently treated as frozen for MVP.
- **Database**: SQLite (`02`) vs. PostgreSQL (framing brief). Built to `02`.
- **Testing framework/CI**: not specified; `tests/test_integration.py` uses
  pytest + requests against a live server as a reasonable default.
- **Deployment architecture**: absent from all six PRDs; not built here.
- **Authentication/officer identity**: absent from all six PRDs; not built here.
- **Citizen feedback loop / status tracking by ID**: absent from all six PRDs; not built
  here.