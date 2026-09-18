# CivicPulse — Demo Data Product Requirements Document
## Version 1.0 — Realistic, Deterministic, Hackathon-Safe Demo Dataset

> This document defines the data required to demonstrate CivicPulse convincingly during judging.
> Demo data must look realistic, support the intelligence pipeline, produce visible spatial/temporal patterns, and remain deterministic enough for a reliable live demonstration.

---

# 1. Purpose

The demo dataset exists to prove the complete CivicPulse workflow:

```text
Citizen Reports
      ↓
AI Classification
      ↓
Spatial + Temporal Pattern
      ↓
Hotspot / Cluster
      ↓
Anomaly
      ↓
Incident
      ↓
Prediction
      ↓
Authority Workflow
      ↓
Resolution
      ↓
Impact
```

The dataset should make this sequence visible without requiring external government systems, real citizens, or hardware.

---

# 2. Demo Philosophy

The dataset must be:

- realistic,
- internally consistent,
- geographically coherent,
- temporally coherent,
- reproducible,
- small enough to debug,
- large enough to show intelligence,
- safe to reset.

Do not use random data that changes every time the demo runs.

---

# 3. Primary Demo Scenario

## Water Pipeline Leakage

Primary incident:

```text
Category:
Water Leakage

Location:
A concentrated urban area

Pattern:
Multiple reports appear close together
within a short period.
```

The system should identify that activity is significantly above the historical baseline.

---

# 4. Secondary Demo Scenarios

Use smaller supporting scenarios:

```text
Road Damage
Drainage Overflow
Garbage Accumulation
Streetlight Failure
```

These demonstrate multi-category capability without distracting from the primary story.

---

# 5. Dataset Entities

Minimum entities:

```text
users
reports
incidents
teams
incident_events
predictions
notifications
```

The exact schema follows the Database PRD.

---

# 6. Demo Users

## Citizen Users

Create several demo citizens.

Example:

```text
citizen_001
citizen_002
citizen_003
...
```

Use fake names and synthetic contact details.

Do not use real personal information.

---

# 7. Demo Authority User

Example:

```text
authority_demo
role:
AUTHORITY
```

This account is used during judging.

Credentials must not be hardcoded into frontend source code.

Use the project's normal authentication mechanism.

---

# 8. Response Teams

Required teams:

```text
Water Response Team
Road Maintenance Team
Drainage Response Team
Sanitation Team
Electrical Team
```

Each team should have:

```text
id
name
department
status
```

For MVP:

```text
status = ACTIVE
```

is sufficient.

---

# 9. Geographic Model

Use one consistent demo city/area.

For a hackathon demo, synthetic coordinates are acceptable.

Recommended:

```text
one central urban zone
multiple neighborhoods
```

The exact coordinates should be configurable through environment/configuration.

Do not depend on a real city's government GIS data for the core demo.

---

# 10. Geographic Distribution

Reports should have intentional spatial structure.

Example:

```text
                R R
             R R R R
           R R R R R
             R R R
                ●
          Incident Center
```

The water leakage reports should be concentrated.

Other categories should be distributed elsewhere.

---

# 11. Water Leakage Baseline

Historical period:

```text
previous 30 days
```

Typical activity:

```text
0–3 water reports/day
```

Demo event period:

```text
20–35 reports within the active window
```

This creates a strong anomaly.

The exact counts must match whatever prediction/anomaly thresholds are implemented.

---

# 12. Historical Data

Historical data should not contain the final incident pattern.

Example:

```text
Day 1 → 1 report
Day 2 → 0
Day 3 → 2
Day 4 → 1
...
Day 27 → 2
Day 28 → 1
Day 29 → 0
Day 30 → 2
```

Then the demo window creates the unusual concentration.

This makes the baseline meaningful.

---

# 13. Active Demo Reports

Recommended primary scenario:

```text
30–40 reports
```

distributed over:

```text
1–3 hours
```

with strong spatial concentration.

Example:

```text
Report 1
14:02

Report 2
14:05

Report 3
14:08

...

Report 31
14:31
```

Do not create identical timestamps.

---

# 14. Report Text Variation

Do not use the same description repeatedly.

Examples:

```text
"Water is leaking heavily near the road."

"Large amount of water collecting outside the houses."

"Pipeline appears damaged."

"Water flowing continuously from roadside."

"Roadside area is flooded with clean water."

"Possible underground pipe leakage."
```

These should still map to the same category.

---

# 15. AI Classification Data

Reports should contain natural language variation.

The AI layer should classify them into:

```text
water_leakage
```

even when users use different wording.

Example:

```text
"Pipe burst near the market"
→ water_leakage
```

```text
"Road is flooded from a leaking line"
→ water_leakage
```

This provides a meaningful AI demonstration.

---

# 16. Supporting Categories

Create reports for:

```text
road_damage
drainage_overflow
garbage
streetlight
```

These demonstrate that the intelligence system is not hardcoded to water leakage.

---

# 17. Duplicate-Like Reports

Include a few semantically similar reports.

Example:

```text
"Water leaking outside shop"
"Water continuously leaking near shop"
"Large leak outside the shop"
```

The system should recognize that they may refer to the same underlying issue.

Do not make every report identical.

---

# 18. Spatial Cluster

Primary cluster requirements:

```text
same category
nearby coordinates
close timestamps
high density
```

The cluster should generate:

```text
cluster_id
centroid
radius
report_count
```

---

# 19. Hotspot Visualization

The dataset should produce a clear map pattern:

```text
Individual Reports
        ↓
Dense Cluster
        ↓
Hotspot
        ↓
Incident
```

This should be visible from the authority dashboard.

---

# 20. Severity

Primary incident:

```text
HIGH
```

Severity should be explainable from the system's implemented rules.

Example signals:

```text
high report count
high anomaly
rapid growth
persistent activity
```

Do not assign severity arbitrarily in the frontend.

---

# 21. Prediction Dataset

Prediction requires historical observations.

Use the historical water-leakage data to create a baseline.

Then active reports create a recent upward trend.

Example:

```text
Historical:
1
0
2
1
2
1
0
2

Demo:
4
7
11
18
26
31
```

The exact values should be generated by the demo-data service and remain consistent with the Prediction PRD.

---

# 22. Forecast Demonstration

After enough historical and active data exists, prediction may show:

```text
Expected:
24

Range:
18–31

Trend:
RISING
```

These values are illustrative only.

The actual displayed prediction must come from the prediction service.

---

# 23. Authority Workflow Seed State

At demo reset:

```text
incident:
DETECTED
```

Then the judge can perform:

```text
ACKNOWLEDGE
→ ASSIGN
→ START
→ RESOLVE
→ VERIFY
```

Do not preload the incident as already resolved.

---

# 24. Incident Timeline Seed

Initial event:

```text
INCIDENT_CREATED
```

Additional events should be generated live during the demo.

Example:

```text
14:32
Incident detected
```

Then authority actions add:

```text
14:34
Acknowledged

14:36
Water Response Team assigned

14:50
Response started

15:15
Resolved

15:25
Verified
```

The timestamps should be generated by the actual backend at runtime or by the demo clock.

---

# 25. Demo Clock

Recommended feature:

```text
DEMO_MODE=true
```

Optionally use an accelerated logical clock.

Example:

```text
1 real second
=
30 logical seconds
```

This is useful if the UI displays elapsed time.

However, keep the underlying event ordering deterministic.

---

# 26. Demo Replay

Required controls:

```text
RESET DEMO
START DEMO
```

Optional:

```text
PAUSE
RESUME
```

Reset should restore:

```text
reports
incidents
events
predictions
notifications
```

to a known initial state.

---

# 27. Demo Sequence

Recommended:

## Phase 0 — Clean State

```text
No active high-severity incident
```

## Phase 1 — Reports

Reports begin appearing.

## Phase 2 — Cluster

Map becomes visibly dense.

## Phase 3 — Detection

Incident appears.

## Phase 4 — Intelligence

Show:

```text
31 reports
5.17× baseline
580m affected radius
```

using actual backend calculations.

## Phase 5 — Prediction

Show forecast if sufficient data exists.

## Phase 6 — Authority

Acknowledge.

## Phase 7 — Assignment

Assign Water Response Team.

## Phase 8 — Response

Start response.

## Phase 9 — Resolution

Mark resolved.

## Phase 10 — Verification

Verify.

## Phase 11 — Impact

Show reduced report activity.

---

# 28. Demo Notification Sequence

At incident creation:

```text
NEW HIGH-SEVERITY INCIDENT
Water Pipeline Leakage detected.
```

After assignment:

```text
WATER RESPONSE TEAM ASSIGNED
```

After resolution:

```text
INCIDENT RESOLVED
```

After verification:

```text
RESOLUTION VERIFIED
```

---

# 29. Impact Dataset

To demonstrate impact, generate post-resolution observations.

Example:

```text
Before:
31 reports

After:
4 reports
```

The actual percentage must be calculated from real demo records.

Suggested wording:

```text
Report activity decreased after resolution.
```

Avoid claiming causal proof from a simple before/after comparison.

---

# 30. Supporting Incident Dataset

Example:

```text
Road Damage
MEDIUM
12 reports

Drainage Overflow
HIGH
17 reports

Garbage Accumulation
LOW
8 reports
```

These should remain secondary to the water scenario.

---

# 31. Data Consistency Rules

The dataset must satisfy:

```text
report.category = incident.category
```

for supporting reports.

And:

```text
incident.report_count
```

must equal the number of reports actually associated with the incident according to the backend definition.

Also:

```text
incident centroid
```

must correspond to its underlying report locations.

---

# 32. Time Consistency

All demo records must follow:

```text
created_at <= acknowledged_at
acknowledged_at <= assigned_at
assigned_at <= started_at
started_at <= resolved_at
resolved_at <= verified_at
```

Do not generate impossible timelines.

---

# 33. Spatial Consistency

For the primary incident:

```text
supporting reports
```

must be physically close enough to satisfy the clustering algorithm.

Do not manually label distant reports as the same hotspot.

---

# 34. Dataset Generation

Recommended approach:

```text
scripts/
└── seed_demo.py
```

or equivalent backend seed command.

It should create:

```text
users
teams
historical reports
demo reports
incidents
```

where appropriate.

---

# 35. Demo Scenario Service

For realtime replay:

```text
services/
└── demo_scenario.py
```

Responsibilities:

```text
create report
wait
create report
wait
trigger intelligence
wait
continue
```

Do not put this logic in React.

---

# 36. Idempotency

Running:

```text
RESET DEMO
```

multiple times must not create duplicate records.

Use:

```text
demo_run_id
```

or delete/reset a known demo namespace.

---

# 37. Demo Data Namespacing

Recommended:

```text
source = DEMO
```

for synthetic records.

This allows the backend to distinguish:

```text
DEMO
REAL
```

if real data is introduced later.

---

# 38. Synthetic Images

If image upload is part of the demo:

Use only:

- synthetic images,
- openly licensed images,
- generated visuals.

Do not use private or copyrighted personal photos.

For the hackathon, a small set is enough:

```text
water_leak_01
water_leak_02
road_damage_01
drainage_01
```

---

# 39. Dataset Size

Recommended hackathon scale:

```text
Historical reports:
100–300

Active demo reports:
30–50

Supporting reports:
20–40

Teams:
5

Demo incidents:
3–5
```

Do not create millions of rows.

The goal is visual and functional proof.

---

# 40. Seed Performance

Demo seeding should finish quickly.

Target:

```text
< 10 seconds
```

on the hackathon deployment environment.

---

# 41. Demo Reset Safety

Reset must not accidentally delete non-demo data.

Only records with:

```text
source = DEMO
```

or the configured demo namespace should be reset.

---

# 42. Realism Rules

Avoid:

```text
every report exactly 5 minutes apart
every description identical
perfectly circular cluster
perfectly linear prediction
```

Add realistic variation while preserving deterministic outcomes.

---

# 43. Visual Design Support

Data should intentionally create:

```text
map density
trend movement
incident cards
timeline events
prediction chart
before/after difference
```

The dataset is part of the visual storytelling.

---

# 44. Judge Walkthrough Dataset

The judge should be able to understand the scenario in under one minute.

Suggested initial state:

```text
Active Incidents: 0–1
Reports Today: moderate
Emerging Areas: 1
```

Then the demo begins.

---

# 45. Backup Demo State

Maintain a fallback seeded incident in case the live intelligence pipeline fails during judging.

However, clearly distinguish:

```text
LIVE DEMO
```

from:

```text
FALLBACK DEMO
```

Do not pretend a manually seeded incident was detected live if it was not.

---

# 46. Demo Failure Recovery

If realtime fails:

```text
Refresh dashboard
```

If AI processing fails:

```text
Use precomputed demo classification
```

only if the demo architecture explicitly supports this fallback.

If prediction fails:

```text
Show "Prediction unavailable"
```

rather than inventing a number.

---

# 47. Data Privacy

All demo users and reports are synthetic.

Do not include:

```text
real phone numbers
real email addresses
real home addresses
private images
```

---

# 48. Data Validation Script

Recommended:

```text
scripts/
└── validate_demo.py
```

Checks:

```text
missing coordinates
invalid timestamps
orphan reports
invalid categories
invalid incident states
broken team references
prediction data gaps
```

---

# 49. Acceptance Tests

Demo dataset passes when:

1. Reset produces clean state.
2. Start produces reports.
3. Reports appear geographically clustered.
4. AI classifies relevant reports.
5. Hotspot detection works.
6. Incident is generated by the actual pipeline where intended.
7. Evidence values are consistent.
8. Prediction works when enough data exists.
9. Authority receives realtime update.
10. Workflow can be completed.
11. Timeline is coherent.
12. Impact metric updates.
13. Reset works again.

---

# 50. 48-Hour Priority

## Must Have

```text
seed script
water leakage scenario
historical baseline
active clustered reports
authority account
response teams
incident workflow
reset/start demo
```

## Nice to Have

```text
secondary categories
synthetic images
pause/resume
multiple simultaneous incidents
```

## Skip if Time Is Low

```text
large datasets
real government GIS
external data partnerships
complex image datasets
advanced simulation
```

---

# 51. What NOT to Build

Do not spend hackathon time on:

- massive synthetic populations,
- realistic city-wide simulation,
- hundreds of departments,
- real government records,
- complex demographic modeling,
- perfect geographic realism,
- complicated data generators.

A small, coherent dataset is more valuable than a huge fake dataset.

---

# 52. Final Demo Story

The dataset should support this exact story:

```text
Several citizens report
what looks like separate water issues.

        ↓

CivicPulse sees that the reports
are actually concentrated in one area.

        ↓

Activity is far above the historical baseline.

        ↓

The system creates an emerging incident.

        ↓

Authority sees the evidence
and forecast.

        ↓

Authority assigns the Water Response Team.

        ↓

The team resolves the issue.

        ↓

CivicPulse verifies the resolution
and shows reduced activity afterward.
```

---

# 53. Final Principle

The demo dataset is not decoration.

It is the controlled environment in which the entire CivicPulse intelligence story becomes visible.

The best dataset is:

```text
small
+
coherent
+
deterministic
+
realistic
+
visually obvious
+
easy to reset
```

**End of Demo Data PRD**
