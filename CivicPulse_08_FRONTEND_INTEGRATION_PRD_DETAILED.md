# CivicPulse — Frontend Integration Product Requirements Document
## Version 1.0 — Frontend ↔ Backend ↔ AI ↔ Realtime Integration

> This document defines how the CivicPulse frontend consumes and presents backend, AI, prediction, authority workflow, map, authentication, and realtime capabilities.
> It is an integration contract, not a visual redesign document.

---

# 1. Purpose

The frontend must turn CivicPulse backend intelligence into a fast, reliable, judge-friendly interface.

Core principle:

```text
Backend is the source of truth.
Frontend is the presentation + interaction layer.
```

The frontend must never independently invent:

- incident status,
- severity,
- report counts,
- anomaly scores,
- prediction values,
- authority permissions,
- resolution state.

---

# 2. Frontend Architecture

Recommended:

```text
Next.js
   ↓
React Components
   ↓
Feature Modules
   ↓
API Client
   ↓
FastAPI Backend
```

Realtime:

```text
FastAPI WebSocket
        ↓
Realtime Client
        ↓
State Store / Query Cache
        ↓
UI Update
```

---

# 3. Main Frontend Areas

Required routes:

```text
/
```

Landing/home page.

```text
/report
```

Citizen issue reporting.

```text
/reports
```

Citizen report history.

```text
/authority
```

Authority command center.

```text
/authority/incidents/[id]
```

Incident details.

```text
/login
```

Authentication.

Optional:

```text
/admin
```

Demo/admin controls.

---

# 4. Frontend User Roles

## Citizen

Can:

- submit report,
- view own reports,
- see status,
- inspect report details.

## Authority

Can:

- view incidents,
- inspect evidence,
- acknowledge,
- assign,
- start response,
- resolve,
- verify,
- reopen.

## Admin

Can:

- manage demo data,
- inspect system,
- access authority screens where authorized.

---

# 5. API Client

Create a single API layer.

Example structure:

```text
src/
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── reports.ts
│   ├── incidents.ts
│   ├── predictions.ts
│   ├── teams.ts
│   └── analytics.ts
```

Do not scatter raw `fetch()` calls across components.

---

# 6. Environment Variables

Frontend:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_MAP_PROVIDER=
```

Never hardcode production backend URLs.

Never expose secret API keys using:

```text
NEXT_PUBLIC_*
```

Only public configuration belongs there.

---

# 7. Authentication Flow

```text
Login
  ↓
POST /auth/login
  ↓
Access token
  ↓
Store securely
  ↓
API requests include token
  ↓
Backend validates token
```

Preferred storage strategy depends on backend architecture.

For a production-oriented implementation, prefer secure HTTP-only cookies where possible.

Do not place sensitive secrets in localStorage unnecessarily.

---

# 8. Protected Routes

Authority pages must be protected.

```text
/authority
/authority/incidents/*
```

If unauthenticated:

```text
→ /login
```

If authenticated but unauthorized:

```text
→ 403 / access denied
```

Do not rely only on frontend route guards.

Backend authorization remains mandatory.

---

# 9. Report Submission Flow

```text
Citizen
  ↓
Report Form
  ↓
Client Validation
  ↓
POST /reports
  ↓
Backend stores report
  ↓
AI processing
  ↓
Response
  ↓
Success UI
```

Form should support:

```text
category
description
location
latitude
longitude
image
```

depending on the final Master PRD scope.

---

# 10. Client Validation

Validate obvious issues before sending.

Examples:

```text
description required
category valid
latitude valid
longitude valid
image type supported
file size within limit
```

Client validation improves UX.

Backend must repeat validation.

---

# 11. Report Success Experience

After submission:

```text
Report Submitted
```

Show:

```text
Report ID
Category
Location
Current Status
```

Optional:

```text
"We'll analyze nearby reports for emerging patterns."
```

Do not claim an incident was detected unless the backend actually returned that result.

---

# 12. Incident API Integration

Frontend consumes:

```text
GET /incidents
GET /incidents/{id}
PATCH /incidents/{id}/status
POST /incidents/{id}/assign
POST /incidents/{id}/resolve
POST /incidents/{id}/verify
POST /incidents/{id}/reopen
GET /incidents/{id}/events
```

All mutations should update frontend state after backend confirmation.

---

# 13. Incident List Data Model

Example:

```json
{
  "id": "uuid",
  "title": "Water Pipeline Leakage",
  "category": "water_leakage",
  "severity": "HIGH",
  "status": "DETECTED",
  "report_count": 31,
  "latitude": 27.1767,
  "longitude": 78.0081,
  "radius_meters": 580,
  "anomaly_ratio": 5.17,
  "created_at": "2026-09-18T14:32:00Z"
}
```

Frontend should render only available fields.

---

# 14. Incident Card

Recommended display:

```text
HIGH

Water Pipeline Leakage

31 reports
580m affected area

5.17× baseline

Detected 8 min ago

[Review Incident]
```

The card should immediately communicate:

```text
What?
Where?
How serious?
Why?
How recent?
```

---

# 15. Authority Dashboard Data Loading

Initial page:

```text
GET /incidents
GET /analytics/summary
GET /teams
```

Use parallel requests where possible.

Do not block the entire page on a non-critical analytics request.

---

# 16. Loading States

Every major async component needs a loading state.

Examples:

```text
Skeleton cards
Map loading state
Table skeleton
Incident detail skeleton
```

Avoid a completely blank page.

---

# 17. Error States

Example:

```text
Unable to load incidents.

[Retry]
```

For mutations:

```text
Unable to assign team.
Please try again.
```

Do not silently swallow API failures.

---

# 18. Empty States

Example:

```text
No active incidents

CivicPulse is currently not detecting
any high-priority emerging incidents.
```

Avoid generic:

```text
No data.
```

---

# 19. AI Intelligence Integration

Backend returns structured intelligence:

```json
{
  "report_count": 31,
  "baseline": 6,
  "anomaly_ratio": 5.17,
  "growth_percent": 240,
  "radius_meters": 580,
  "evidence_reasons": [
    "31 reports concentrated within 580m",
    "Activity is 5.17× baseline",
    "Recent report volume increased rapidly"
  ],
  "ai_summary": "A concentrated increase..."
}
```

Frontend renders:

```text
WHY DETECTED?
```

with structured evidence first.

---

# 20. Why Detected Component

Required:

```text
Why detected?

31 reports
5.17× baseline
+240% recent activity
580m radius

AI Summary:
A concentrated increase...
```

Important:

```text
AI summary
```

must never replace the underlying evidence.

---

# 21. Prediction Integration

Prediction is secondary intelligence.

Endpoint:

```text
GET /predictions
```

or incident-specific:

```text
GET /incidents/{id}/prediction
```

Frontend should display:

```text
Forecast

24 expected
18–31 range

↑ Rising
```

If unavailable:

```text
Prediction unavailable
Insufficient historical data
```

Never display placeholder values.

---

# 22. Prediction Chart

Preferred:

```text
Observed
───────────────╮
               ╰───────
                        ╱ Forecast
                       ╱
                      ╱
```

With a forecast range.

Use the existing charting library selected by the frontend team.

Do not introduce a heavy visualization dependency without need.

---

# 23. Map Integration

Map is a core CivicPulse experience.

It should display:

```text
incident markers
report markers
hotspot radius
cluster area
watch area
```

Map data comes from backend.

---

# 24. Map State

When selecting an incident:

```text
incident marker selected
        ↓
map centers
        ↓
affected radius highlighted
        ↓
supporting reports displayed
```

This creates a strong geographic relationship.

---

# 25. Map Performance

Do not render thousands of DOM markers individually.

If demo dataset is small, standard markers are acceptable.

For larger data:

```text
clustering
viewport filtering
server-side geographic filtering
```

can be introduced later.

---

# 26. Realtime Architecture

WebSocket connection:

```text
Frontend
   ↓
WS /ws
   ↓
FastAPI
```

Events:

```text
incident.created
incident.updated
incident.assigned
incident.resolved
incident.verified
incident.reopened
report.created
```

---

# 27. Realtime Event Handling

Example:

```json
{
  "event": "incident.created",
  "data": {
    "incident_id": "uuid"
  }
}
```

Frontend then:

```text
receive event
   ↓
invalidate/refetch incident query
   ↓
update UI
```

For MVP, refetch-after-event is safer than manually reconstructing complex state.

---

# 28. Realtime Reconnection

If WebSocket disconnects:

```text
retry
```

with bounded backoff.

After reconnect:

```text
refetch current dashboard data
```

This prevents stale state.

---

# 29. Notification UI

When a new high-severity incident appears:

```text
┌────────────────────────────┐
│ NEW HIGH-SEVERITY INCIDENT │
│ Water leakage detected     │
│ 31 reports · 5.17× baseline│
│ [View Incident]             │
└────────────────────────────┘
```

Use in-app notifications.

---

# 30. Status Mutation UX

Example:

```text
[ Acknowledge Incident ]
```

On click:

```text
button disabled
spinner
API call
success
state refresh
```

Prevent double submissions.

---

# 31. Assignment UX

Flow:

```text
Review Incident
      ↓
Assign Team
      ↓
Select Team
      ↓
Optional Note
      ↓
Confirm
      ↓
Backend
      ↓
ASSIGNED
```

If backend rejects:

```text
keep modal open
show error
```

---

# 32. Resolution UX

Resolution form:

```text
Resolution Type
Description
Evidence (optional)
```

Submit:

```text
POST /incidents/{id}/resolve
```

Then:

```text
RESOLVED
```

Timeline updates.

---

# 33. Verification UX

Show:

```text
Resolution recorded.

[Verify Resolution]
```

After verification:

```text
VERIFIED
```

Impact panel becomes visible.

---

# 34. Impact Visualization

After resolution:

```text
REPORT ACTIVITY

Before
31 reports

After
4 reports
```

Use backend-calculated metrics.

Avoid frontend calculations that could conflict with backend definitions.

---

# 35. State Management

Recommended combination:

```text
React Query / TanStack Query
+
small local UI state
```

Use server-state tools for:

```text
incidents
reports
teams
analytics
predictions
```

Use local state for:

```text
modal open
selected marker
filter
form fields
```

Avoid a huge global store for everything.

---

# 36. Caching

Reasonable cache behavior:

```text
incident list → short cache
incident detail → short cache
static categories → longer cache
team list → moderate cache
```

Mutation should invalidate affected queries.

---

# 37. Optimistic Updates

Use carefully.

For critical workflow mutations:

```text
acknowledge
assign
resolve
verify
```

prefer server-confirmed updates.

Do not show a successful workflow transition before backend confirmation.

---

# 38. API Error Contract

Frontend should handle:

```text
400
401
403
404
409
422
429
500
```

Examples:

```text
401 → session expired
403 → unauthorized
404 → incident not found
409 → invalid state transition
422 → validation error
500 → server error
```

---

# 39. Pagination

Incident/report lists should support:

```text
page
page_size
cursor
```

according to the Backend API PRD.

Frontend should not assume the entire database is returned in one request.

---

# 40. Filters

Authority dashboard:

```text
status
severity
category
time range
assigned team
```

Changing filters should update API query parameters.

---

# 41. URL-Synced Filters

Recommended:

```text
/authority?severity=HIGH&status=DETECTED
```

This allows:

- refresh persistence,
- shareable demo URLs,
- predictable navigation.

---

# 42. Date/Time Handling

Backend timestamps should be treated as timezone-aware.

Frontend can display:

```text
18 Sep, 2:32 PM
```

and relative:

```text
8 min ago
```

Be consistent.

---

# 43. Accessibility

Required basics:

- keyboard navigation,
- visible focus,
- sufficient text contrast,
- semantic buttons,
- form labels,
- alt text for meaningful images,
- accessible status announcements where practical.

Do not sacrifice usability for visual effects.

---

# 44. Responsive Design

Primary target:

```text
desktop authority dashboard
```

Secondary:

```text
tablet
mobile citizen reporting
```

Do not spend excessive time making the complex command center perfect on every screen size.

---

# 45. Performance Targets

Aim for:

```text
fast initial shell
lazy-loaded map
lazy-loaded heavy charts
compressed images
minimal unnecessary re-renders
```

Do not optimize prematurely.

---

# 46. Demo Mode

The frontend should support a deterministic demo scenario.

Possible control:

```text
Start Water Leakage Scenario
```

Then:

```text
reports appear
→ hotspot forms
→ incident appears
→ notification
→ authority workflow
→ resolution
→ impact
```

The demo controller should call backend demo APIs rather than fabricating frontend-only state.

---

# 47. Demo Replay

Optional:

```text
Reset Demo
Start Demo
Pause
Resume
```

This is valuable if judges ask to see the scenario again.

---

# 48. Frontend Security

Never trust:

```text
isAuthority = true
```

from client state.

Never put:

```text
LLM API keys
database credentials
private backend secrets
```

in frontend code.

All privileged operations go through FastAPI.

---

# 49. Component Architecture

Suggested:

```text
components/
├── layout/
├── map/
├── incidents/
│   ├── IncidentCard
│   ├── IncidentList
│   ├── IncidentHeader
│   ├── EvidencePanel
│   ├── IncidentTimeline
│   ├── AssignmentModal
│   └── ResolutionModal
├── reports/
├── predictions/
├── analytics/
└── notifications/
```

---

# 50. Page Architecture

Authority page:

```text
AuthorityDashboard
│
├── KPIBar
├── FilterBar
├── LiveMap
├── IncidentQueue
├── IncidentPreview
└── RealtimeNotifications
```

Incident page:

```text
IncidentDetail
│
├── IncidentHeader
├── IncidentMap
├── EvidencePanel
├── SupportingReports
├── PredictionPanel
├── AuthorityActions
├── Timeline
└── ImpactPanel
```

---

# 51. API Response Normalization

If backend wraps responses:

```json
{
  "data": {},
  "meta": {}
}
```

frontend client should normalize this consistently.

Do not make every component understand different response formats.

---

# 52. Type Safety

If using TypeScript:

```text
Incident
Report
Team
Prediction
IncidentEvent
Evidence
User
```

must have explicit types.

Avoid:

```typescript
any
```

for core API objects.

---

# 53. Generated API Types

If time permits, generate TypeScript types from FastAPI/OpenAPI.

Preferred architecture:

```text
FastAPI OpenAPI
      ↓
Type generation
      ↓
Frontend types
```

This reduces frontend/backend mismatch.

---

# 54. Testing

Minimum:

## Component tests

- IncidentCard
- EvidencePanel
- AssignmentModal
- ResolutionModal

## Integration tests

- login → authority dashboard
- incident → assignment
- incident → resolution

## E2E demo test

```text
login
→ dashboard
→ open incident
→ assign
→ resolve
```

---

# 55. Frontend Failure Scenarios

Test:

```text
backend offline
WebSocket offline
expired session
slow API
empty incident list
invalid incident ID
duplicate button click
failed mutation
```

---

# 56. Frontend Definition of Done

Frontend is complete when:

1. Login works.
2. Citizen can submit report.
3. Authority can view incidents.
4. Map displays incident/report locations.
5. AI evidence is visible.
6. Prediction panel is visible where data exists.
7. Authority can acknowledge.
8. Authority can assign.
9. Authority can start response.
10. Authority can resolve.
11. Authority can verify.
12. Timeline updates.
13. Realtime incident events work.
14. API failures are handled.
15. Loading/empty states exist.
16. Demo scenario can be replayed.
17. Privileged actions are backend-authorized.
18. Core screens work without frontend hardcoded fake state.

---

# 57. What NOT to Build

Do not build:

- separate frontend backend logic,
- frontend-only fake incidents,
- complex global state management,
- excessive animation,
- multiple map libraries,
- custom chart engine,
- unnecessary microfrontends,
- elaborate design system during hackathon,
- frontend-generated AI conclusions.

---

# 58. 48-Hour Frontend Execution Priority

## Phase 1

```text
API client
Auth
Dashboard shell
```

## Phase 2

```text
Incident list
Incident detail
Map
```

## Phase 3

```text
Authority workflow
AI evidence
Prediction
```

## Phase 4

```text
WebSocket
Notifications
Impact
```

## Phase 5

```text
Polish
Loading/error states
Demo replay
```

---

# 59. Final Frontend Principle

The frontend should make the CivicPulse intelligence obvious in seconds.

A judge should be able to look at the screen and understand:

```text
WHAT is happening?
WHERE is it happening?
WHY did CivicPulse detect it?
HOW serious is it?
WHAT is the authority doing?
DID the situation improve?
```

The UI is successful when the intelligence and workflow are visible without requiring the judge to understand the underlying code.

**End of Frontend Integration PRD**
