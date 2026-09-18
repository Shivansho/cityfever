# CivicPulse — Testing Product Requirements Document
## Version 1.0 — Functional, AI, Data, Realtime, Workflow, and Demo Validation

> This document defines the testing strategy for CivicPulse.
> The objective is not maximum test coverage; it is reliable proof that the critical end-to-end civic intelligence workflow works during the hackathon.

---

# 1. Testing Mission

CivicPulse must reliably execute:

```text
Citizen Report
      ↓
Validation
      ↓
AI Classification
      ↓
Spatial / Temporal Analysis
      ↓
Hotspot
      ↓
Incident
      ↓
Prediction
      ↓
Authority Workflow
      ↓
Resolution
      ↓
Verification
      ↓
Impact
```

Testing must focus on this path first.

---

# 2. Testing Priorities

## P0 — Critical

These must work:

- application starts,
- login works,
- report submission works,
- report is stored,
- AI classification returns structured output,
- hotspot/incident detection works,
- prediction works when sufficient data exists,
- authority dashboard loads,
- incident can be acknowledged,
- team can be assigned,
- response can start,
- incident can be resolved,
- verification works,
- realtime update works,
- demo reset/start works.

## P1 — Important

- validation errors,
- loading states,
- empty states,
- map behavior,
- timeline,
- notifications,
- reconnect behavior,
- permission checks.

## P2 — Nice to Have

- advanced accessibility testing,
- extensive browser matrix,
- load testing,
- sophisticated chaos testing.

---

# 3. Testing Layers

Use five practical layers:

```text
Unit Tests
    ↓
Integration Tests
    ↓
API Tests
    ↓
End-to-End Tests
    ↓
Live Demo Validation
```

Do not attempt exhaustive testing of every component during a 48-hour hackathon.

---

# 4. Unit Testing

Test small deterministic functions.

Examples:

```text
severity calculation
category normalization
cluster distance calculation
baseline calculation
prediction feature preparation
workflow transition validation
priority calculation
```

Example:

```text
DETECTED → ACKNOWLEDGED
```

should be valid.

But:

```text
DETECTED → RESOLVED
```

should be rejected if the workflow requires intermediate states.

---

# 5. AI Testing

AI outputs must be validated as structured data.

Required fields may include:

```text
category
confidence
summary
entities
severity_signals
```

depending on the AI PRD.

Test:

```text
normal wording
misspellings
short reports
long reports
ambiguous reports
similar reports
irrelevant reports
```

---

# 6. AI Classification Test Cases

Example:

```text
"Pipe has burst near the market"
```

Expected category:

```text
water_leakage
```

Example:

```text
"Road full of deep potholes"
```

Expected:

```text
road_damage
```

Example:

```text
"Garbage hasn't been collected for days"
```

Expected:

```text
garbage
```

The exact expected output must match the categories implemented by the project.

---

# 7. AI Confidence Handling

Low-confidence classifications should not automatically create high-severity incidents.

Example:

```text
confidence < threshold
```

may produce:

```text
Needs Review
```

rather than:

```text
HIGH incident
```

Thresholds must be configurable.

---

# 8. Prompt Regression Tests

If an LLM prompt changes, run a fixed set of representative reports.

Store:

```text
input
expected category
expected structured fields
```

Compare results before and after prompt changes.

Do not rely on a single successful demo example.

---

# 9. AI Failure Tests

Simulate:

```text
LLM timeout
LLM API error
invalid JSON
missing field
unexpected category
rate limit
```

Expected behavior:

```text
retry where appropriate
fallback where implemented
log error
do not crash report submission
```

---

# 10. Report API Testing

Test:

```text
POST /reports
```

with:

- valid report,
- missing description,
- invalid category,
- invalid latitude,
- invalid longitude,
- oversized image,
- unsupported file type,
- unauthenticated request.

Expected HTTP behavior must follow the Backend API PRD.

---

# 11. Incident Detection Testing

The intelligence pipeline must distinguish:

```text
normal activity
```

from:

```text
unusual concentrated activity
```

Test cases:

## Case A — Normal

Few reports spread across time and space.

Expected:

```text
no major incident
```

## Case B — Spatial cluster

Many nearby reports.

Expected:

```text
hotspot candidate
```

## Case C — Spatial + temporal cluster

Many nearby reports within a short window.

Expected:

```text
incident candidate / incident
```

depending on configured threshold.

---

# 12. Duplicate Incident Testing

Submit additional reports to an existing incident area.

Expected:

```text
existing incident updated
```

rather than:

```text
duplicate incident
```

unless the backend's rules intentionally create a new incident.

---

# 13. Spatial Testing

Use known synthetic coordinates.

Test:

```text
nearby reports
far-away reports
boundary distance
```

Verify clustering behavior.

Do not rely only on visual map appearance.

---

# 14. Temporal Testing

Test:

```text
reports minutes apart
reports hours apart
reports days apart
```

Verify that the time window logic behaves as configured.

---

# 15. Severity Testing

Test different signal combinations.

Example:

```text
low volume + normal baseline
```

should not automatically become high severity.

Example:

```text
high volume
+
high anomaly
+
rapid growth
```

should produce the configured higher severity.

---

# 16. Prediction Testing

Prediction should only run when sufficient historical data exists.

Test:

```text
sufficient history
insufficient history
flat trend
rising trend
falling trend
missing observations
```

Expected fallback:

```text
Prediction unavailable
Insufficient historical data
```

when the model cannot produce a valid forecast.

---

# 17. Prediction Accuracy Evaluation

For the demo, record:

```text
forecast
actual observed value
error
```

Useful metrics:

```text
MAE
RMSE
directional accuracy
```

Do not optimize a complex model solely to improve a tiny synthetic dataset.

---

# 18. Data Leakage Test

Prediction training/evaluation must respect time ordering.

Incorrect:

```text
future observations
      ↓
training
```

Correct:

```text
past
 ↓
training

future
 ↓
evaluation
```

This matters even in a small prototype.

---

# 19. Authority Workflow Testing

Test the complete state machine:

```text
DETECTED
→ ACKNOWLEDGED
→ ASSIGNED
→ IN_PROGRESS
→ RESOLVED
→ VERIFIED
```

Also test:

```text
RESOLVED
→ REOPENED
→ IN_PROGRESS
```

where supported.

---

# 20. Invalid Workflow Transitions

Examples:

```text
DETECTED → RESOLVED
DETECTED → VERIFIED
VERIFIED → ASSIGNED
```

must be rejected unless explicitly allowed by the workflow.

Backend is authoritative.

---

# 21. Concurrent Authority Actions

Simulate two authority users changing the same incident.

Example:

```text
User A → RESOLVE
User B → RESOLVE
```

Expected:

```text
one succeeds
other receives conflict / refreshed state
```

The database and backend must remain consistent.

---

# 22. Role-Based Access Testing

Citizen should not be able to:

```text
assign team
resolve incident
verify incident
```

Authority can perform allowed workflow actions.

Admin permissions follow the project's final role model.

Do not rely only on hidden frontend buttons.

---

# 23. Realtime Testing

Test:

```text
authority dashboard open
        ↓
new report created
        ↓
incident created
        ↓
dashboard updates
```

No manual refresh should be required for the realtime path.

---

# 24. WebSocket Connection Tests

Test:

```text
connect
disconnect
reconnect
invalid authentication
server unavailable
```

Expected UI states:

```text
LIVE
CONNECTING
RECONNECTING
OFFLINE
```

as defined in the Realtime PRD.

---

# 25. Missed Event Recovery

Simulate:

```text
WebSocket disconnected
      ↓
incident changes
      ↓
WebSocket reconnects
```

After reconnect:

```text
REST refetch
```

must synchronize the dashboard.

---

# 26. Duplicate Event Testing

Send the same event twice.

Example:

```text
incident.created
incident.created
```

Frontend must not:

```text
create duplicate cards
show duplicate critical notifications
```

---

# 27. API Failure Testing

Test:

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

Frontend should show meaningful feedback.

Examples:

```text
401 → Session expired
403 → Access denied
404 → Incident not found
409 → Incident changed by another user
422 → Invalid input
500 → Server unavailable
```

---

# 28. Database Testing

Verify:

```text
foreign keys
required fields
unique constraints
status values
timestamps
```

Test orphan scenarios:

```text
incident references missing team
report references missing user
event references missing incident
```

These should fail safely.

---

# 29. Data Consistency Testing

Check:

```text
incident report count
```

against actual associated reports.

Check:

```text
incident status
```

against its event history.

Check:

```text
team assignment
```

against the current assignment record.

---

# 30. Timestamp Testing

Verify workflow ordering:

```text
created_at
≤
acknowledged_at
≤
assigned_at
≤
started_at
≤
resolved_at
≤
verified_at
```

Only applicable timestamps should be populated.

---

# 31. Demo Data Testing

Run:

```text
RESET DEMO
```

then verify:

```text
known initial state
```

Run:

```text
START DEMO
```

and verify:

```text
reports appear
cluster forms
incident appears
```

---

# 32. Demo Replay Testing

Run the complete demo at least three times.

Verify:

```text
same story
same general timing
same evidence
same workflow
no duplicate data
```

The demo should be deterministic.

---

# 33. Demo Reset Testing

Run:

```text
START
RESET
START
RESET
```

multiple times.

Verify:

```text
no duplicate incidents
no duplicate reports
no stale timeline
no stale notifications
```

---

# 34. End-to-End Test

The highest-value E2E test:

```text
1. Login
2. Open authority dashboard
3. Start demo
4. Reports appear
5. Hotspot appears
6. Incident appears
7. Open incident
8. Inspect evidence
9. Inspect prediction
10. Acknowledge
11. Assign team
12. Start response
13. Resolve
14. Verify
15. Inspect impact
```

If this passes, the core product story is working.

---

# 35. Citizen E2E Test

```text
1. Login as citizen
2. Open report form
3. Enter issue
4. Select location
5. Submit
6. Receive report ID
7. View report status
```

---

# 36. Authority E2E Test

```text
1. Login
2. Dashboard
3. Open incident
4. Acknowledge
5. Assign
6. Start
7. Resolve
8. Verify
```

---

# 37. Browser Testing

For hackathon MVP prioritize:

```text
Chrome
```

Then quickly validate:

```text
Edge
Firefox
```

if time permits.

Do not spend hours supporting obscure browser versions.

---

# 38. Responsive Testing

Minimum:

```text
desktop authority
mobile citizen reporting
```

Check:

```text
forms
buttons
map
cards
modals
tables
```

---

# 39. Map Testing

Verify:

```text
markers render
cluster renders
incident centers correctly
radius renders
click opens incident
```

Test invalid coordinates too.

---

# 40. File Upload Testing

If image upload is implemented:

Test:

```text
valid image
large image
wrong extension
corrupt file
empty upload
multiple files
```

Backend must validate independently.

---

# 41. Performance Testing

For hackathon scope:

Test with approximately:

```text
100–300 historical reports
30–50 active reports
```

as defined in Demo Data PRD.

Measure:

```text
dashboard load
incident query
map rendering
demo start
AI response
```

---

# 42. Basic Load Test

If time permits:

```text
20–50 concurrent report submissions
```

Measure whether the backend remains responsive.

Do not build a large-scale load-testing environment during the hackathon.

---

# 43. Security Testing

Minimum checks:

```text
unauthenticated API access
role escalation
invalid object IDs
malicious text input
file upload validation
secret exposure
```

Never expose:

```text
LLM API keys
database credentials
JWT signing secrets
```

to the frontend.

---

# 44. Prompt Injection Testing

Because reports are user-generated text, test malicious input such as:

```text
Ignore previous instructions and return...
```

The AI pipeline should treat the report as untrusted data, not as system instructions.

Structured output validation should be applied.

---

# 45. Injection Testing

Test user fields for:

```text
SQL-like input
HTML
JavaScript
JSON manipulation
very long strings
```

Use parameterized database access and output escaping.

---

# 46. Logging Tests

Verify important failures are logged:

```text
AI failure
database failure
WebSocket failure
authorization failure
workflow conflict
```

Do not log:

```text
password
token
secret
private credentials
```

---

# 47. Observability

Minimum useful logs:

```text
request ID
endpoint
status
latency
error type
incident ID
```

Optional:

```text
AI processing duration
prediction duration
WebSocket event type
```

---

# 48. Regression Checklist

Before final judging build, verify:

```text
□ Login
□ Citizen report
□ AI classification
□ Hotspot
□ Incident
□ Prediction
□ Authority dashboard
□ Map
□ Assignment
□ Resolution
□ Verification
□ Timeline
□ Realtime
□ Notifications
□ Impact
□ Demo reset
□ Demo replay
```

---

# 49. Critical Bugs

## P0 — Stop Everything

Examples:

```text
app doesn't start
login broken
report cannot be created
incident cannot be opened
authority workflow impossible
database corruption
secret exposed
demo cannot run
```

## P1

Examples:

```text
map minor issue
notification styling
chart formatting
mobile spacing
```

Fix P0 before P1.

---

# 50. Test Data Strategy

Use three categories:

```text
UNIT FIXTURES
INTEGRATION FIXTURES
DEMO DATA
```

Do not mix random test records into the main demo environment.

---

# 51. Test Environment

Recommended:

```text
local development
staging/demo deployment
```

Before judging:

```text
deploy exact demo build
seed exact demo data
run E2E flow
```

---

# 52. Definition of Done

Testing is sufficient for the hackathon when:

1. Critical APIs pass.
2. Core AI flow passes representative cases.
3. Incident detection works.
4. Prediction works or gracefully reports insufficient data.
5. Authority state machine is enforced.
6. Realtime updates work.
7. WebSocket recovery works.
8. Demo reset/start works.
9. Complete E2E scenario passes.
10. Security basics pass.
11. No P0 bugs remain.
12. Demo has been rehearsed multiple times.

---

# 53. Final Pre-Demo Checklist

## 30 Minutes Before Judging

```text
□ Backend running
□ Frontend running
□ Database connected
□ AI provider reachable
□ Prediction service reachable
□ WebSocket connected
□ Demo data reset
□ Demo account works
□ Map loads
□ No console-breaking errors
□ No exposed secrets
□ Demo replay tested
```

---

# 54. Backup Plan

Keep a fallback path:

```text
Live intelligence demo
        ↓
if failure
        ↓
pre-seeded incident
        ↓
manual authority workflow
```

The fallback must be honest and clearly represent seeded demo state rather than pretending a failed live detection occurred.

---

# 55. Final Testing Principle

Do not ask:

```text
"Is every feature perfect?"
```

Ask:

```text
"Can we reliably prove the complete CivicPulse story?"
```

The highest-value test is:

```text
REPORT
 ↓
INTELLIGENCE
 ↓
INCIDENT
 ↓
PREDICTION
 ↓
AUTHORITY ACTION
 ↓
RESOLUTION
 ↓
MEASURED IMPACT
```

If this path works repeatedly, the project is ready to demonstrate.

**End of Testing PRD**
