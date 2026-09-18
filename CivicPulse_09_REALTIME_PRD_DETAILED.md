# CivicPulse — Realtime Product Requirements Document
## Version 1.0 — Live Civic Intelligence and Event Synchronization

> This document defines the realtime layer of CivicPulse.
> Its purpose is to make report detection, incident creation, authority actions, notifications, and dashboard state appear live without requiring manual page refreshes.

---

# 1. Realtime Mission

CivicPulse should feel like a live civic command center.

The intended experience is:

```text
Citizen submits report
        ↓
Backend processes report
        ↓
Intelligence detects pattern
        ↓
Incident created
        ↓
Authority dashboard updates
        ↓
Notification appears
        ↓
Authority takes action
        ↓
Timeline updates
```

The realtime layer connects these events.

---

# 2. Core Principle

Realtime is a **delivery mechanism**, not the source of truth.

```text
PostgreSQL
     ↓
Source of truth

FastAPI
     ↓
Business logic

WebSocket
     ↓
Realtime delivery

Next.js
     ↓
UI
```

If WebSocket fails, the product must still work through REST APIs.

---

# 3. Realtime Events

Minimum required events:

```text
report.created
incident.created
incident.updated
incident.acknowledged
incident.assigned
incident.started
incident.resolved
incident.verified
incident.reopened
```

Optional:

```text
hotspot.updated
prediction.updated
notification.created
```

---

# 4. Event Envelope

Every WebSocket event should use a consistent structure.

Example:

```json
{
  "event_id": "uuid",
  "event_type": "incident.created",
  "timestamp": "2026-09-18T14:32:10Z",
  "data": {
    "incident_id": "uuid"
  }
}
```

Required:

```text
event_id
event_type
timestamp
data
```

---

# 5. Why Event IDs Matter

An event ID allows the client/backend to identify duplicate events.

Example:

```text
event_id = abc123
```

If the same event is accidentally delivered twice, the frontend can avoid processing it twice.

---

# 6. WebSocket Endpoint

Recommended:

```text
/ws
```

Authenticated authority connection may use:

```text
/ws/authority
```

depending on the final backend architecture.

The endpoint must validate authentication.

---

# 7. Authentication

Do not create a public authority WebSocket.

Connection should be authenticated using the application's normal authentication mechanism.

Backend verifies:

```text
user identity
role
permissions
```

before subscribing the connection to authority events.

---

# 8. Connection Lifecycle

```text
CONNECT
  ↓
AUTHENTICATE
  ↓
SUBSCRIBE
  ↓
RECEIVE EVENTS
  ↓
PING/PONG
  ↓
DISCONNECT
```

Frontend should handle every state.

---

# 9. Connection States

UI-level state:

```text
LIVE
CONNECTING
RECONNECTING
OFFLINE
```

Optional status indicator:

```text
● LIVE
```

If disconnected:

```text
○ Reconnecting...
```

Do not make the dashboard appear live when the socket is actually disconnected.

---

# 10. Initial Data Load

Never depend on WebSocket to populate the first page.

Correct flow:

```text
Page opens
   ↓
REST API fetch
   ↓
Dashboard populated
   ↓
WebSocket connects
   ↓
Live events begin
```

This prevents missing state when the page loads.

---

# 11. Event Handling Strategy

Recommended MVP strategy:

```text
WebSocket event
       ↓
Identify affected resource
       ↓
Invalidate/refetch REST query
       ↓
UI updates
```

Example:

```text
incident.created
       ↓
invalidate incidents query
       ↓
GET /incidents
       ↓
new incident appears
```

This is safer than manually rebuilding complicated state from partial WebSocket payloads.

---

# 12. Why Refetch Is Good for the Hackathon

Manual event-state synchronization can create:

- stale state,
- duplicate state,
- race conditions,
- difficult debugging.

For a small hackathon dataset:

```text
event → refetch
```

is simple and reliable.

---

# 13. Incident Created Event

Example:

```json
{
  "event_id": "evt-001",
  "event_type": "incident.created",
  "timestamp": "2026-09-18T14:32:10Z",
  "data": {
    "incident_id": "inc-101",
    "severity": "HIGH",
    "category": "water_leakage"
  }
}
```

Frontend:

```text
refresh incident list
show notification
optionally highlight map
```

---

# 14. Report Created Event

Example:

```json
{
  "event_type": "report.created",
  "data": {
    "report_id": "rep-501",
    "category": "water_leakage"
  }
}
```

Authority dashboard can:

```text
update report counters
refresh map
trigger intelligence refresh
```

Only do expensive recalculation when required by backend logic.

---

# 15. Incident Updated Event

Use for changes that do not fit a dedicated event.

Example:

```json
{
  "event_type": "incident.updated",
  "data": {
    "incident_id": "inc-101"
  }
}
```

Frontend refetches the affected incident.

---

# 16. Workflow Events

When authority acknowledges:

```text
incident.acknowledged
```

When team is assigned:

```text
incident.assigned
```

When response starts:

```text
incident.started
```

When resolved:

```text
incident.resolved
```

When verified:

```text
incident.verified
```

When reopened:

```text
incident.reopened
```

These events make the command center feel operational.

---

# 17. Notification Handling

For high-value events:

```text
incident.created
incident.assigned
incident.resolved
```

frontend can show a toast.

Example:

```text
NEW HIGH-SEVERITY INCIDENT

Water Pipeline Leakage
31 reports · 5.17× baseline

[View]
```

Do not generate notifications for every low-value event.

---

# 18. Notification Priority

Suggested:

```text
HIGH:
critical/high incident

MEDIUM:
assignment / escalation

LOW:
routine update
```

Keep the notification system simple.

---

# 19. Map Realtime Updates

When a new report arrives:

```text
report.created
    ↓
map refresh/update
```

When an incident is created:

```text
incident.created
    ↓
new incident marker
    ↓
affected radius
```

When resolved:

```text
incident.resolved
    ↓
marker state changes
```

---

# 20. Hotspot Realtime

Optional event:

```text
hotspot.updated
```

Example:

```json
{
  "event_type": "hotspot.updated",
  "data": {
    "category": "water_leakage",
    "cluster_id": "cluster-12"
  }
}
```

Frontend can refetch hotspot data.

This is useful for the live demo but not mandatory if incident creation already provides enough visual movement.

---

# 21. Prediction Realtime

Optional:

```text
prediction.updated
```

When forecast data changes:

```text
event
 ↓
prediction query invalidated
 ↓
forecast chart refreshes
```

Prediction remains secondary to incident detection.

---

# 22. Reconnection Strategy

If connection drops:

```text
immediate retry
      ↓
short delay
      ↓
longer delay
      ↓
bounded retry interval
```

Example:

```text
1s
2s
5s
10s
20s
```

Do not reconnect infinitely at very high frequency.

---

# 23. Reconnect Recovery

After reconnect:

```text
WebSocket connected
      ↓
REST refetch
      ↓
dashboard synchronized
```

This handles events that may have been missed while offline.

---

# 24. Heartbeat

Backend can periodically send:

```text
ping
```

and client responds:

```text
pong
```

or use the WebSocket implementation's built-in heartbeat.

Purpose:

```text
detect dead connections
```

---

# 25. Connection Cleanup

When user leaves the authority page:

```text
close WebSocket
```

Avoid leaked connections.

When switching accounts:

```text
close old connection
open authenticated connection
```

---

# 26. Multi-Tab Behavior

For hackathon MVP:

```text
each tab may have its own connection
```

This is acceptable.

Future optimization:

```text
shared browser connection
```

is not required.

---

# 27. Authority Scoping

Authority users should receive only events relevant to their authorized scope if the product supports departmental/geographic permissions.

Possible future scope:

```text
department
district
zone
ward
```

For MVP:

```text
single authority scope
```

is acceptable.

---

# 28. Event Ordering

Events may arrive close together.

Example:

```text
incident.created
incident.assigned
incident.started
```

Frontend should not assume a single event is enough to determine final state.

The safest strategy:

```text
event
 ↓
refetch resource
 ↓
render backend state
```

---

# 29. Duplicate Events

If duplicate events arrive:

```text
same event_id
```

ignore duplicate processing where practical.

Do not create duplicate notifications or duplicate incidents on the frontend.

---

# 30. Race Conditions

Example:

```text
Authority A resolves incident
Authority B also resolves incident
```

Backend controls the final state.

Frontend handles:

```text
409 Conflict
```

by refreshing the incident.

Do not try to resolve workflow conflicts purely client-side.

---

# 31. Security

WebSocket must enforce:

```text
authentication
authorization
```

Do not accept arbitrary:

```text
user_id
role
authority_id
```

from the client as trusted identity.

The backend derives identity from authentication.

---

# 32. Event Payload Security

Do not broadcast:

- passwords,
- access tokens,
- secret API keys,
- unnecessary private data.

Event payload should contain only what clients need.

Example:

```text
incident_id
event type
public operational fields
```

---

# 33. Realtime Backend Architecture

Recommended:

```text
FastAPI
   │
   ├── REST API
   │
   ├── WebSocket Manager
   │
   └── Intelligence Services
             ↓
         PostgreSQL
```

For hackathon scale, an in-process connection manager is sufficient.

---

# 34. Connection Manager

Conceptual responsibility:

```text
connect()
disconnect()
broadcast()
broadcast_to_authorities()
broadcast_to_scope()
```

Do not put business logic into the WebSocket manager.

---

# 35. Event Publisher

Business service should publish events.

Example:

```text
IncidentService
      ↓
create incident
      ↓
database commit
      ↓
publish incident.created
```

Important:

```text
Commit database state first.
Then broadcast.
```

This avoids clients receiving an event for a state that was never successfully committed.

---

# 36. Event Reliability

For hackathon MVP:

```text
in-memory WebSocket broadcast
```

is acceptable.

For production:

```text
Redis Pub/Sub
Redis Streams
Kafka
NATS
```

may be considered.

Do not introduce these unless the deployment architecture needs multiple backend instances.

---

# 37. Scaling Beyond One Backend

If multiple FastAPI instances run:

```text
Client A → Server 1
Client B → Server 2
```

an in-memory connection manager on Server 1 cannot notify Client B.

Production architecture can use:

```text
FastAPI instances
       ↓
Redis Pub/Sub
       ↓
all WebSocket instances
```

This is future scalability, not MVP necessity.

---

# 38. Realtime API Health

Optional endpoint:

```text
GET /health
```

should report backend availability.

WebSocket UI can separately show:

```text
LIVE
```

based on actual connection state.

---

# 39. Frontend Realtime Module

Suggested:

```text
src/
├── realtime/
│   ├── websocket.ts
│   ├── eventTypes.ts
│   ├── connectionManager.ts
│   └── handlers.ts
```

Keep realtime code separate from UI components.

---

# 40. Event Type Definitions

TypeScript example concept:

```text
type RealtimeEventType =
  | "report.created"
  | "incident.created"
  | "incident.updated"
  | "incident.acknowledged"
  | "incident.assigned"
  | "incident.started"
  | "incident.resolved"
  | "incident.verified"
  | "incident.reopened";
```

Use explicit types.

Avoid:

```text
event: any
```

---

# 41. Demo Mode

The realtime layer should support a controlled demo.

Demo sequence:

```text
T+00
Initial dashboard

T+05
Report appears

T+10
More reports appear

T+15
Hotspot expands

T+20
Incident created

T+25
Authority notification

T+35
Incident acknowledged

T+45
Team assigned

T+60
Response started

T+90
Incident resolved

T+110
Impact updates
```

Actual timings can be accelerated.

---

# 42. Demo Replay

Admin/demo control:

```text
Reset
Start
Pause
Resume
```

Backend owns demo state.

Frontend displays the resulting realtime events.

---

# 43. Strongest Live Demo

Recommended:

```text
Open authority dashboard
        ↓
No active incident
        ↓
Trigger Water Leakage Demo
        ↓
Reports appear on map
        ↓
Map cluster forms
        ↓
Incident appears automatically
        ↓
Toast notification
        ↓
Open incident
        ↓
Why Detected evidence
        ↓
Prediction panel
        ↓
Assign response team
        ↓
Timeline updates live
        ↓
Resolve
        ↓
Impact panel changes
```

This should be rehearsed before judging.

---

# 44. Realtime UX Rules

Do:

```text
show subtle live status
show meaningful notifications
animate new items briefly
update counters
highlight new incidents
```

Do not:

```text
flash the entire screen
reload the whole page
play unnecessary sounds
animate every report excessively
```

The interface should feel professional, not noisy.

---

# 45. Performance

For hackathon scale:

```text
small event payloads
```

Recommended.

Do not broadcast complete incident objects every time.

Prefer:

```text
incident_id
event_type
```

then refetch.

---

# 46. Backpressure

If many report events arrive:

```text
debounce/refetch batching
```

may be used.

Example:

```text
20 report.created events
        ↓
one dashboard refresh
```

Do not trigger 20 expensive API calls.

---

# 47. Realtime + AI Processing

Important sequence:

```text
Report submitted
      ↓
Report committed
      ↓
AI/intelligence processing
      ↓
Incident committed
      ↓
incident.created event
```

Do not announce an incident before the intelligence pipeline actually creates it.

---

# 48. Realtime + Prediction

Prediction update should happen only after prediction data is successfully generated and stored.

Flow:

```text
new data
  ↓
forecast calculation
  ↓
prediction stored
  ↓
prediction.updated
```

---

# 49. Failure Handling

## WebSocket fails

Fallback:

```text
REST refresh
```

## Event malformed

Ignore safely and log.

## Backend unavailable

Show:

```text
Unable to connect
```

## Reconnect

Refetch state.

---

# 50. Logging

Backend should log:

```text
connection opened
connection closed
authentication failure
event published
broadcast failure
```

Do not log:

```text
tokens
passwords
private secrets
```

---

# 51. Testing

Minimum tests:

## Backend

- WebSocket authentication
- connect/disconnect
- event broadcast
- unauthorized connection
- event schema

## Frontend

- event handling
- reconnect
- notification
- query refresh
- offline state

## E2E

```text
create report
→ incident created
→ dashboard receives event
→ authority changes state
→ timeline updates
```

---

# 52. Acceptance Criteria

Realtime is complete when:

1. Authority dashboard receives incident creation without manual refresh.
2. New incident notification appears.
3. Incident list updates.
4. Map updates.
5. Workflow changes appear live.
6. Timeline updates.
7. WebSocket reconnect works.
8. REST refresh recovers missed state.
9. Unauthorized connections are rejected.
10. Duplicate events do not create duplicate UI actions.
11. Demo sequence can be replayed reliably.

---

# 53. What NOT to Build

Do not build:

- Kafka cluster,
- complex event sourcing,
- distributed consensus,
- multi-region realtime,
- advanced presence system,
- chat system,
- voice notifications,
- mobile push infrastructure,
- custom realtime protocol.

For the hackathon:

```text
FastAPI WebSocket
+
simple connection manager
+
REST refetch
```

is enough.

---

# 54. 48-Hour Implementation Priority

## Priority 1

```text
WebSocket endpoint
authentication
event envelope
incident.created
```

## Priority 2

```text
workflow events
frontend event listener
query invalidation
```

## Priority 3

```text
notifications
map updates
connection indicator
```

## Priority 4

```text
reconnect
demo replay
performance polish
```

---

# 55. Final Realtime Principle

CivicPulse should feel like a living system:

```text
REPORT
  ↓
SIGNAL
  ↓
INCIDENT
  ↓
ALERT
  ↓
ACTION
  ↓
RESOLUTION
```

without the authority user needing to press:

```text
Refresh
```

The realtime layer is successful when a judge can watch a civic issue emerge on the map and see the command center react automatically.

**End of Realtime PRD**
