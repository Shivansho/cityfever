# CivicPulse — Authority Workflow Product Requirements Document
## Version 1.0 — Detection-to-Resolution Operations

> This document defines how CivicPulse converts a detected civic incident into an actionable authority workflow.
> It follows the Master, UI/UX, Database, Backend/API, AI Intelligence, and Prediction PRDs.

---

# 1. Purpose

CivicPulse must not stop at:

```text
"Problem detected."
```

The platform must enable:

```text
Problem detected
      ↓
Authority reviews evidence
      ↓
Incident acknowledged
      ↓
Team assigned
      ↓
Work started
      ↓
Problem resolved
      ↓
Resolution verified
      ↓
Impact measured
```

This workflow is the operational heart of the product.

---

# 2. Primary Users

## Authority Operator

Monitors the command center and handles incoming incidents.

Permissions:

- view incidents,
- inspect evidence,
- acknowledge,
- assign teams,
- change workflow status,
- add notes,
- mark resolved,
- verify resolution.

## Response Team

Represents the operational department handling the issue.

Examples:

```text
Water Department
Road Maintenance
Drainage Team
Sanitation Team
Electrical Team
```

## Admin

Can:

- manage users/teams,
- run demo scenarios,
- reset demo state,
- inspect system health.

---

# 3. Core Workflow

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

Optional:

```text
RESOLVED
   ↓
REOPENED
   ↓
IN_PROGRESS
```

The backend owns state transitions.

---

# 4. Incident Lifecycle

## Stage 1 — DETECTED

System creates an incident after sufficient evidence exists.

Authority sees:

- incident title,
- category,
- severity,
- map location,
- report count,
- anomaly score,
- baseline comparison,
- affected radius,
- recent growth,
- AI-generated evidence summary.

Primary action:

```text
Review Incident
```

---

# 5. Stage 2 — ACKNOWLEDGED

Authority confirms that the incident has been reviewed.

Action:

```text
Acknowledge
```

This records:

```text
acknowledged_at
actor
event
```

The incident remains visible in the active queue.

---

# 6. Stage 3 — ASSIGNED

Authority selects an appropriate response team.

Example:

```text
Incident:
Water Pipeline Leakage

Team:
Water Response Team
```

Optional note:

```text
Inspect pipeline around the highlighted 580m zone.
```

Backend creates an assignment record and timeline event.

---

# 7. Stage 4 — IN_PROGRESS

Response team has started handling the incident.

Authority action:

```text
Start Response
```

The dashboard should show:

```text
Assigned
→
In Progress
```

The map remains visible.

---

# 8. Stage 5 — RESOLVED

Authority/team records the completed action.

Required:

```text
resolution_type
description
resolved_by
resolved_at
```

Example:

```text
Resolution Type:
Pipeline Repair

Description:
Damaged section repaired and water flow restored.
```

---

# 9. Stage 6 — VERIFIED

Verification confirms that the incident appears to be resolved.

Possible evidence:

- authority confirmation,
- reduced incoming reports,
- uploaded evidence,
- manual inspection,
- optional citizen confirmation.

For hackathon MVP:

```text
Authority verification
+
reduced report activity
```

is sufficient.

---

# 10. Reopened State

If the issue returns:

```text
VERIFIED
   ↓
REOPENED
   ↓
IN_PROGRESS
```

Example:

```text
Water leakage reports rise again
```

The existing incident can be reopened instead of creating an unrelated duplicate.

---

# 11. Authority Command Center

The primary authority screen should contain:

```text
┌──────────────────────────────────────────────────┐
│ CivicPulse Command Center                        │
├──────────────────────────────────────────────────┤
│ Active Incidents │ Emerging │ High │ Resolved   │
├──────────────────────────────────────────────────┤
│                                                  │
│              LIVE CITY MAP                       │
│                                                  │
│       ● Incident                                 │
│       ◉ Emerging hotspot                         │
│                                                  │
├───────────────────────┬──────────────────────────┤
│ Incident Queue        │ Selected Incident        │
│                       │                          │
│ Water Leakage  HIGH   │ Evidence                 │
│ Road Damage   MEDIUM  │ Assignment               │
│ Drainage      HIGH    │ Timeline                 │
│                       │ Actions                  │
└───────────────────────┴──────────────────────────┘
```

---

# 12. Incident Queue

Each card should show:

```text
Severity
Category
Title
Location
Report count
Age
Status
```

Example:

```text
HIGH
Water Pipeline Leakage

31 reports
580m area
Detected 8 min ago

[Review]
```

Sort/filter options:

```text
severity
status
category
time
location
```

---

# 13. Priority Queue

The system may calculate an operational priority score.

Conceptual:

```text
priority =
severity
+
anomaly
+
growth
+
persistence
```

Do not hide the reasoning.

Show the most important contributing signals.

---

# 14. Incident Detail Screen

Required sections:

```text
Header
Map
Why Detected?
Affected Reports
Prediction
Authority Action
Timeline
Resolution
Impact
```

The authority should understand the incident without navigating through many pages.

---

# 15. "Why Detected?" Panel

This is a critical trust feature.

Example:

```text
WHY DETECTED?

31 reports detected
within 580m

5.17× historical baseline

+240% recent activity

Pattern persisted
for 6 hours

Confidence:
Evidence-backed
```

Use actual stored evidence.

Do not display fake numbers.

---

# 16. Supporting Reports

Authority should be able to inspect reports contributing to the incident.

Each report:

```text
description
category
timestamp
map location
image if available
```

The UI should allow:

```text
Show all reports
```

and:

```text
Show on map
```

---

# 17. Map Interaction

Clicking an incident should highlight:

```text
incident centroid
affected radius
supporting reports
nearby activity
```

Optional:

```text
cluster boundary
```

The map should make the geographic relationship visually obvious.

---

# 18. Team Assignment UI

Assignment modal:

```text
Assign Response Team

Incident:
Water Pipeline Leakage

Recommended Team:
Water Response Team

Available Teams:
○ Water Response Team
○ Drainage Team
○ Road Maintenance

Notes:
[______________________]

[Assign Team]
```

Recommendation can be rule-based.

Do not require an LLM to choose a team.

---

# 19. Team Recommendation Logic

Simple mapping:

```text
water_leakage → Water Team
road_damage → Road Team
garbage → Sanitation Team
drainage → Drainage Team
streetlight → Electrical Team
traffic_safety → Traffic Team
```

Future version may use workload, distance, skills, and availability.

---

# 20. Assignment Validation

Backend must check:

- incident exists,
- team exists,
- authority is authorized,
- incident is assignable,
- team is active.

If invalid:

```text
409 Conflict
```

or appropriate validation error.

---

# 21. Workflow Actions

Available actions should depend on state.

## DETECTED

```text
Acknowledge
```

## ACKNOWLEDGED

```text
Assign Team
```

## ASSIGNED

```text
Start Response
```

## IN_PROGRESS

```text
Resolve
```

## RESOLVED

```text
Verify
Reopen
```

## VERIFIED

```text
Reopen
```

Never show irrelevant actions.

---

# 22. Notes

Authority should be able to add notes.

Example:

```text
"Team reached location."
"Pipe section isolated."
"Waiting for replacement valve."
```

Store notes as incident events or a dedicated note entity if required later.

For MVP, event metadata can be sufficient.

---

# 23. Timeline

Timeline should show:

```text
14:32
Incident detected

14:34
Authority acknowledged

14:36
Water Response Team assigned

14:52
Response started

15:28
Incident resolved

15:40
Resolution verified
```

This is one of the strongest visual proof points in the demo.

---

# 24. Realtime Workflow

When an authority changes state:

```text
PATCH /incidents/{id}/status
```

backend:

```text
validate
↓
update DB
↓
create incident event
↓
publish WebSocket event
```

Connected dashboards update automatically.

---

# 25. Realtime Events

Required:

```text
incident.created
incident.acknowledged
incident.assigned
incident.started
incident.resolved
incident.verified
incident.reopened
```

Optional:

```text
report.created
hotspot.updated
```

---

# 26. Authority Notifications

For MVP, notifications can be in-app.

Examples:

```text
NEW HIGH-SEVERITY INCIDENT

Water leakage activity has increased
5.17× above baseline.
```

Assignment:

```text
TEAM ASSIGNED

Water Response Team assigned to Incident #104.
```

Resolution:

```text
INCIDENT RESOLVED

Water Pipeline Leakage marked resolved.
```

Avoid building SMS/email/push infrastructure during the hackathon unless already available.

---

# 27. SLA Indicators

Optional visual indicator:

```text
Detected:
8 min ago

Acknowledgement:
2 min

Response:
14 min
```

These can later become department-specific SLAs.

For MVP, simply display elapsed time.

---

# 28. Operational Metrics

Track:

```text
time_to_acknowledge
time_to_assign
time_to_start
time_to_resolve
time_to_verify
```

These create measurable product value.

---

# 29. Impact Measurement

After resolution compare:

```text
Before
↓
Intervention
↓
After
```

Example:

```text
Before repair:
31 reports

After repair:
4 reports

Change:
-87%
```

Do not claim that the intervention alone caused the reduction unless the methodology supports that conclusion.

Use wording:

```text
Report activity decreased 87% after resolution.
```

---

# 30. Authority Dashboard KPIs

Recommended:

```text
Active Incidents
Emerging Signals
High Severity
Average Resolution Time
Reports Today
Resolved Today
```

Do not overwhelm the dashboard with 30 metrics.

---

# 31. Filtering

Authority can filter:

```text
All
High Priority
Emerging
Assigned to Me
In Progress
Resolved
```

Category:

```text
Water
Road
Garbage
Drainage
Electrical
Traffic
```

---

# 32. Search

Search by:

```text
incident ID
category
location
keyword
```

Keep search simple for MVP.

---

# 33. Role-Based UI

Citizen:

```text
Report issue
My reports
Report status
```

Authority:

```text
Command Center
Incidents
Map
Teams
Analytics
```

Admin:

```text
Authority views
Demo controls
System health
```

---

# 34. Authority Workflow API Contract

Required endpoints:

```text
GET  /incidents
GET  /incidents/{id}
PATCH /incidents/{id}/status
POST /incidents/{id}/assign
GET  /incidents/{id}/events
POST /incidents/{id}/resolve
```

Optional:

```text
POST /incidents/{id}/verify
POST /incidents/{id}/reopen
```

---

# 35. Backend State Machine

Implement explicitly.

Conceptual:

```python
TRANSITIONS = {
    "DETECTED": ["ACKNOWLEDGED"],
    "ACKNOWLEDGED": ["ASSIGNED"],
    "ASSIGNED": ["IN_PROGRESS"],
    "IN_PROGRESS": ["RESOLVED"],
    "RESOLVED": ["VERIFIED", "REOPENED"],
    "VERIFIED": ["REOPENED"],
    "REOPENED": ["IN_PROGRESS"]
}
```

This prevents inconsistent workflows.

---

# 36. Audit Trail

Every important action should create an event.

Minimum:

```text
who
what
when
previous state
new state
metadata
```

Example:

```json
{
  "event_type": "ASSIGNED",
  "actor_user_id": "uuid",
  "previous_status": "ACKNOWLEDGED",
  "new_status": "ASSIGNED",
  "metadata": {
    "team_id": "uuid"
  }
}
```

---

# 37. Demo Scenario

Primary scenario:

```text
Water leakage
```

Sequence:

```text
Reports start appearing
      ↓
Hotspot grows
      ↓
Incident detected
      ↓
Authority receives realtime alert
      ↓
Opens incident
      ↓
Sees WHY DETECTED
      ↓
Acknowledges
      ↓
Assigns Water Team
      ↓
Starts Response
      ↓
Resolves
      ↓
Verifies
      ↓
Impact graph updates
```

---

# 38. Strongest Demo Moment

The strongest moment is not the form.

It is:

```text
LIVE MAP
    ↓
31 reports converge
    ↓
HOTSPOT FORMS
    ↓
INCIDENT CARD APPEARS
    ↓
WHY DETECTED
    ↓
AUTHORITY ACKNOWLEDGES
    ↓
TEAM ASSIGNED
    ↓
TIMELINE UPDATES LIVE
    ↓
RESOLVED
    ↓
AFTER-ACTIVITY FALLS
```

This tells the complete product story.

---

# 39. What Typical Teams Will Do

Typical implementation:

```text
Complaint submitted
→ Admin sees complaint
→ Admin changes status
→ Complaint marked solved
```

CivicPulse should demonstrate:

```text
Multiple independent signals
→ intelligence
→ emerging incident
→ evidence
→ priority
→ response workflow
→ measured outcome
```

That difference is important.

---

# 40. Differentiation

## 1. Evidence-first operations

Every incident answers:

```text
Why now?
Why here?
Why this severity?
```

## 2. Closed-loop workflow

Detection must connect to action.

## 3. Measurable response

Show operational timestamps and post-resolution activity.

---

# 41. Future Scalability

Future workflow can support:

```text
multiple departments
department SLAs
team workload
nearest available team
mobile field app
photo verification
citizen confirmation
escalation
multi-agency incidents
procurement/work orders
GIS infrastructure layers
```

These are future extensions, not MVP requirements.

---

# 42. What NOT to Build

Do not build:

- complex enterprise RBAC,
- full HR/team management,
- payroll,
- field-worker GPS tracking,
- SMS infrastructure,
- email automation,
- government ERP integrations,
- procurement system,
- complicated approval hierarchy.

The hackathon needs a convincing workflow, not an entire government operating system.

---

# 43. Security

Authority actions require authorization.

Never trust:

```text
role = AUTHORITY
```

from the frontend.

Backend verifies the authenticated user's role.

Audit all important mutations.

---

# 44. Failure Cases

## Incident already resolved

Do not allow:

```text
ASSIGNED
```

unless reopened.

## Team unavailable

Show:

```text
Team currently inactive
```

## Duplicate assignment

Prevent duplicate active assignments.

## Realtime failure

The database state remains correct.

Frontend can refresh using REST APIs.

---

# 45. Offline/Fallback Concept

Future field app may support offline updates.

Not required for hackathon.

For MVP:

```text
network required
```

is acceptable.

---

# 46. Authority Workflow Definition of Done

Complete when:

1. Authority can see incidents.
2. Incident evidence is visible.
3. Incident can be acknowledged.
4. Team can be assigned.
5. Response can start.
6. Incident can be resolved.
7. Resolution can be verified.
8. Incident can be reopened.
9. Timeline records all actions.
10. Realtime updates work.
11. Operational timestamps are stored.
12. Impact metrics appear after resolution.
13. Role permissions are enforced.
14. Invalid state transitions are blocked.

---

# 47. Final Workflow Principle

CivicPulse is not merely:

```text
Complaint Management
```

The intended workflow is:

```text
SENSE
  ↓
UNDERSTAND
  ↓
DETECT
  ↓
PRIORITIZE
  ↓
ACT
  ↓
VERIFY
  ↓
MEASURE
```

The authority workflow is what turns CivicPulse from a visualization/demo into an operational civic intelligence product.

**End of Authority Workflow PRD**
