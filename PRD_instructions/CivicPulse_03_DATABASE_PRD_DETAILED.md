# CivicPulse — Database Product Requirements Document
## Version 1.0 — PostgreSQL + PostGIS

> This document defines the database contract for CivicPulse.
> It implements the Master PRD and must not redefine product scope.

---

# 1. Database Objectives

The database must support:

1. citizen reports,
2. geographic analysis,
3. temporal analysis,
4. clusters,
5. anomalies,
6. emerging incidents,
7. authority assignments,
8. incident workflow,
9. predictions,
10. resolutions,
11. measurable impact,
12. deterministic demo replay.

Primary database:

**PostgreSQL + PostGIS**

---

# 2. Core Design Principles

## 2.1 One source of truth

Operational state must live in PostgreSQL.

## 2.2 Spatial data is first-class

Locations must be stored in a form suitable for spatial queries.

Use PostGIS geometry.

## 2.3 Preserve raw evidence

Do not overwrite original report information when AI classification or processing occurs.

## 2.4 Explainability

Store the numerical/structured evidence used to create incidents.

## 2.5 Auditability

Important authority actions must be represented as events.

## 2.6 Hackathon simplicity

Avoid unnecessary microservice-specific databases.

One PostgreSQL database is sufficient for the MVP.

---

# 3. Entity Relationship Overview

```text
users
  │
  └────────────── reports
                       │
                       ├── report_classifications
                       │
                       └── incident_reports ───── incidents
                                                     │
                ┌────────────────────────────────────┼──────────────────────┐
                │                                    │                      │
             assignments                        incident_events        predictions
                │                                    │
             users/teams                          resolution
                                                     │
                                                impact_metrics

reports ───── clusters ───── anomalies
```

---

# 4. Tables

Required MVP tables:

```text
users
teams
reports
report_classifications
clusters
cluster_reports
anomalies
incidents
incident_reports
assignments
incident_events
predictions
resolutions
impact_metrics
```

---

# 5. users

Purpose:

Stores application users.

Fields:

```text
id                  UUID PK
name                VARCHAR
email               VARCHAR UNIQUE
role                VARCHAR
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

Allowed roles:

```text
CITIZEN
AUTHORITY
ADMIN
```

For the hackathon, authentication can be simplified, but role semantics should remain.

---

# 6. teams

Purpose:

Represents authority response teams.

Fields:

```text
id                  UUID PK
name                VARCHAR
department          VARCHAR
active              BOOLEAN
created_at          TIMESTAMPTZ
```

Examples:

```text
Water Response Team
Road Maintenance Team
Sanitation Team
Electrical Team
Drainage Team
```

---

# 7. reports

This is the primary raw civic signal table.

Fields:

```text
id                  UUID PK

user_id             UUID FK users.id NULLABLE

category            VARCHAR NOT NULL
title               VARCHAR NULLABLE
description         TEXT NOT NULL

location            GEOMETRY(Point, 4326) NOT NULL

latitude            DOUBLE PRECISION
longitude           DOUBLE PRECISION

source              VARCHAR
image_url           TEXT NULLABLE

reported_at         TIMESTAMPTZ NOT NULL

created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

---

# 8. Report Category Enum

Recommended canonical values:

```text
water_leakage
road_damage
garbage
drainage
streetlight
traffic_safety
other
```

The backend should normalize user-facing labels to these values.

---

# 9. Geographic Storage

Use:

```sql
geometry(Point, 4326)
```

for report location.

Example conceptual value:

```text
POINT(longitude latitude)
```

Do not accidentally reverse latitude and longitude.

For distance calculations, use PostGIS geography or appropriate projected calculations.

---

# 10. Spatial Index

Required:

```sql
GIST(location)
```

This is important for:

- nearby reports,
- radius queries,
- spatial clustering,
- hotspot calculations.

---

# 11. reports Indexes

Recommended:

```text
GIST(location)
(category)
(reported_at)
(category, reported_at)
(created_at)
```

These support the MVP query patterns.

---

# 12. report_classifications

Stores AI/ML classification output separately from raw report data.

Fields:

```text
id                  UUID PK
report_id           UUID FK reports.id
predicted_category  VARCHAR
confidence          DOUBLE PRECISION
model_name          VARCHAR
model_version       VARCHAR
created_at          TIMESTAMPTZ
```

Optional:

```text
explanation         TEXT
```

The original report category must remain preserved.

---

# 13. clusters

Represents a detected geographic/temporal group.

Fields:

```text
id                  UUID PK

category            VARCHAR
centroid            GEOMETRY(Point, 4326)

radius_meters       DOUBLE PRECISION
report_count        INTEGER

start_time          TIMESTAMPTZ
end_time            TIMESTAMPTZ

algorithm            VARCHAR
algorithm_version    VARCHAR

created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

Optional:

```text
boundary            GEOMETRY(Polygon, 4326)
```

Do not require polygon generation if it adds complexity.

---

# 14. cluster_reports

Many-to-many relationship:

```text
cluster ↔ reports
```

Fields:

```text
cluster_id          UUID FK
report_id           UUID FK
created_at          TIMESTAMPTZ
```

Primary key:

```text
(cluster_id, report_id)
```

---

# 15. anomalies

Stores statistical anomaly results.

Fields:

```text
id                  UUID PK

cluster_id          UUID FK NULLABLE
category            VARCHAR

observed_value      DOUBLE PRECISION
baseline_value      DOUBLE PRECISION
anomaly_score       DOUBLE PRECISION

method              VARCHAR
window_start        TIMESTAMPTZ
window_end          TIMESTAMPTZ

explanation         JSONB

created_at          TIMESTAMPTZ
```

Example explanation:

```json
{
  "observed_reports": 31,
  "baseline_reports": 6,
  "ratio": 5.17,
  "growth_percent": 240
}
```

---

# 16. incidents

This is the central operational entity.

Fields:

```text
id                  UUID PK

category            VARCHAR NOT NULL
title               VARCHAR NOT NULL

severity            VARCHAR NOT NULL
severity_score      DOUBLE PRECISION

status              VARCHAR NOT NULL

location            GEOMETRY(Point, 4326)
radius_meters       DOUBLE PRECISION

cluster_id          UUID NULLABLE
anomaly_id          UUID NULLABLE

report_count        INTEGER

detected_at         TIMESTAMPTZ
acknowledged_at     TIMESTAMPTZ NULLABLE
assigned_at         TIMESTAMPTZ NULLABLE
resolved_at         TIMESTAMPTZ NULLABLE
verified_at         TIMESTAMPTZ NULLABLE

created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

---

# 17. Incident Status Enum

Allowed:

```text
DETECTED
ACKNOWLEDGED
ASSIGNED
IN_PROGRESS
RESOLVED
VERIFIED
REOPENED
```

Only valid transitions should be allowed by backend logic.

---

# 18. Incident Severity

Recommended:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Severity should not be stored only as text.

Store:

```text
severity
severity_score
```

This allows the UI to explain the result.

---

# 19. incident_reports

Connects incidents to their supporting reports.

Fields:

```text
incident_id        UUID FK
report_id          UUID FK
contribution_score DOUBLE PRECISION NULLABLE
created_at         TIMESTAMPTZ
```

Primary key:

```text
(incident_id, report_id)
```

Contribution score is optional.

---

# 20. assignments

Represents authority responsibility.

Fields:

```text
id                  UUID PK

incident_id         UUID FK
team_id             UUID FK
assigned_by         UUID FK users.id

assigned_at         TIMESTAMPTZ
notes               TEXT NULLABLE
```

---

# 21. incident_events

Audit/event timeline.

Fields:

```text
id                  UUID PK

incident_id         UUID FK

event_type          VARCHAR
actor_user_id       UUID NULLABLE

previous_status     VARCHAR NULLABLE
new_status          VARCHAR NULLABLE

metadata            JSONB NULLABLE

created_at          TIMESTAMPTZ
```

Examples:

```text
INCIDENT_CREATED
ACKNOWLEDGED
ASSIGNED
STATUS_CHANGED
NOTE_ADDED
RESOLVED
VERIFIED
REOPENED
```

This powers the incident timeline.

---

# 22. predictions

Prediction results must be stored separately.

Fields:

```text
id                  UUID PK

incident_id         UUID NULLABLE
category            VARCHAR

forecast_start      TIMESTAMPTZ
forecast_end        TIMESTAMPTZ

predicted_value     DOUBLE PRECISION

lower_bound         DOUBLE PRECISION NULLABLE
upper_bound         DOUBLE PRECISION NULLABLE

model_name          VARCHAR
model_version       VARCHAR

features            JSONB NULLABLE

created_at          TIMESTAMPTZ
```

Prediction must never overwrite observed report data.

---

# 23. resolutions

Fields:

```text
id                  UUID PK

incident_id         UUID UNIQUE FK
resolved_by         UUID FK users.id

resolution_type     VARCHAR
description         TEXT

evidence_url        TEXT NULLABLE

resolved_at         TIMESTAMPTZ
```

---

# 24. impact_metrics

Stores measurable before/after operational indicators.

Fields:

```text
id                  UUID PK

incident_id         UUID FK

metric_name        VARCHAR

before_value       DOUBLE PRECISION
after_value        DOUBLE PRECISION

change_percent     DOUBLE PRECISION

before_start       TIMESTAMPTZ
before_end         TIMESTAMPTZ

after_start        TIMESTAMPTZ
after_end          TIMESTAMPTZ

created_at         TIMESTAMPTZ
```

Example:

```text
metric_name:
report_activity

before_value:
18

after_value:
3

change_percent:
-83.3
```

---

# 25. Database Constraints

Required constraints:

- report category cannot be null,
- report description cannot be null,
- report location cannot be null,
- timestamps must be valid,
- severity must be an allowed value,
- status must be an allowed value,
- incident report relationships must reference valid records,
- resolution should be unique per incident for the MVP.

---

# 26. Referential Integrity

Use foreign keys.

Examples:

```text
reports.user_id → users.id

report_classifications.report_id → reports.id

cluster_reports.cluster_id → clusters.id
cluster_reports.report_id → reports.id

incidents.cluster_id → clusters.id

incident_reports.incident_id → incidents.id
incident_reports.report_id → reports.id

assignments.incident_id → incidents.id
assignments.team_id → teams.id

incident_events.incident_id → incidents.id

resolutions.incident_id → incidents.id
```

Use appropriate delete behavior.

Avoid cascading deletion of incident history accidentally.

---

# 27. Timestamp Rules

Use:

```text
TIMESTAMPTZ
```

for operational timestamps.

Backend should normalize timestamps to UTC.

Frontend may display local time.

Important timestamps:

- reported_at,
- detected_at,
- acknowledged_at,
- assigned_at,
- resolved_at,
- verified_at.

---

# 28. Soft Delete

For hackathon MVP, hard deletion can be avoided.

If deletion is required later, introduce:

```text
deleted_at
```

Do not build a complicated soft-delete system unless needed.

---

# 29. JSONB Usage

JSONB is appropriate for flexible intelligence metadata:

- anomaly explanation,
- model features,
- LLM summary metadata,
- event metadata.

Do not put core relational fields into JSONB.

Bad:

```text
incident.status inside JSONB
```

Good:

```text
incident.status as column
```

---

# 30. Seed Data Requirements

The database must support deterministic seed data.

Required scenarios:

## Scenario A — Normal

Scattered reports.

## Scenario B — Emerging

Reports start concentrating.

## Scenario C — Spike

High activity in a compact area.

## Scenario D — Detected

Incident exists.

## Scenario E — Resolved

Incident is resolved.

## Scenario F — Impact

Post-resolution activity is lower.

Use deterministic random seeds.

---

# 31. Demo Dataset Shape

Minimum recommended demo:

```text
200–500 reports
5–10 categories
multiple geographic regions
1 obvious water-leak incident
1 road-damage cluster
1 garbage cluster
normal background noise
```

The main incident should be obvious but not unrealistically perfect.

---

# 32. Example Water Leakage Dataset

Example conceptual records:

```text
Report 1
category: water_leakage
location: A
time: 14:02

Report 2
category: water_leakage
location: A + 150m
time: 14:08

Report 3
category: water_leakage
location: A + 280m
time: 14:15

...

Report 31
category: water_leakage
location: A + 580m
time: 14:30
```

These should form a detectable spatial/temporal pattern.

---

# 33. Database Query Requirements

The backend must support:

### Nearby reports

```text
reports within radius R
```

### Recent reports

```text
reports within time window T
```

### Category activity

```text
count(category, time window)
```

### Hotspot

```text
density by geography
```

### Baseline

```text
historical/rolling activity
```

### Incident evidence

```text
reports linked to incident
```

---

# 34. PostGIS Requirements

Expected functions/concepts:

- ST_DWithin
- ST_Distance
- ST_Centroid where appropriate
- ST_Collect where appropriate
- spatial indexes

Do not use raw Python loops for every geographic distance query if PostGIS can perform it efficiently.

---

# 35. Migration Requirements

Use Alembic.

Migration sequence:

```text
001_initial_schema
002_spatial_indexes
003_incident_workflow
004_prediction_impact
```

Actual migration naming can vary.

Every schema change must be reproducible.

---

# 36. Environment Configuration

Database URL:

```text
DATABASE_URL
```

Example conceptually:

```text
postgresql+psycopg://USER:PASSWORD@HOST:PORT/DB
```

Do not commit secrets.

---

# 37. Local Development

Recommended:

```text
docker-compose
 └── postgres + postgis
```

Optional:

```text
redis
```

Only add Redis if background/realtime architecture needs it.

---

# 38. Database Performance

For MVP:

- index timestamps,
- index categories,
- GiST index on spatial data,
- paginate reports,
- aggregate analytics rather than loading every report,
- avoid N+1 queries,
- use connection pooling.

Do not prematurely partition tables.

---

# 39. Database Security

Minimum:

- database credentials in environment variables,
- least-privilege production user where practical,
- no database exposed publicly without protection,
- no secrets in source code,
- validate all API inputs,
- parameterized ORM/database queries.

---

# 40. Backup / Recovery

For hackathon:

- seed data must be reproducible,
- database can be reset,
- migration can recreate schema.

Production future:

- automated backups,
- point-in-time recovery,
- retention policy.

Not required for MVP.

---

# 41. Database Definition of Done

Database is complete when:

1. PostgreSQL + PostGIS runs.
2. Migrations work from empty database.
3. Seed script works.
4. Reports can be inserted.
5. Spatial queries work.
6. Clusters can be stored.
7. Anomalies can be stored.
8. Incidents can be created.
9. Supporting reports can be linked.
10. Authority assignments can be stored.
11. Incident timeline is queryable.
12. Resolution is stored.
13. Impact metrics are stored.
14. Prediction records are stored.
15. Demo reset is reproducible.

---

# 42. Critical Database Rule

Never allow the frontend to become the source of truth for:

- severity,
- anomaly score,
- incident status,
- report count,
- resolution state,
- impact metrics.

The backend/database owns these values.

---

# 43. Final Database Flow

```text
Citizen Report
      ↓
reports
      ↓
Classification
      ↓
report_classifications
      ↓
Spatial/Temporal Processing
      ↓
clusters
      ↓
anomalies
      ↓
incidents
      ↓
incident_reports
      ↓
Authority Assignment
      ↓
assignments
      ↓
incident_events
      ↓
resolution
      ↓
impact_metrics

Prediction runs alongside the intelligence/analytics layer.
```

**End of Database PRD**
