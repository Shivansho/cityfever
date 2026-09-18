# CivicPulse — UI/UX Product Requirements Document
## Version 1.0 — Detailed Frontend Design Specification

> This document implements the UI/UX requirements defined by `01_MASTER_PRD_DETAILED.md`.
> It does not change product scope or backend behavior.

---

# 1. UI/UX Mission

CivicPulse must visually communicate one core idea:

> **The city is being observed as a living system, not as a list of complaints.**

The interface should make the intelligence pipeline visible:

```text
REPORTS
   ↓
PATTERNS
   ↓
HOTSPOTS
   ↓
EMERGING INCIDENTS
   ↓
AUTHORITY ACTION
   ↓
RESOLUTION
   ↓
IMPACT
```

The UI should feel like a modern civic operations/intelligence command center.

It must NOT look like:
- a generic admin template,
- a simple complaint CRUD app,
- a collection of unrelated charts,
- a chatbot interface.

---

# 2. Primary UX Goals

## G1 — Understand city state in seconds

When an authority opens the dashboard, they should immediately understand:

- how many reports are active,
- where incidents are concentrated,
- which incidents need attention,
- what changed recently.

## G2 — Make intelligence visually obvious

The map and incident panels must make clustering/anomaly detection visible.

## G3 — Explain every important alert

Clicking an incident should reveal the evidence behind it.

## G4 — Support action

The UI must move naturally from:

```text
Detected → Acknowledged → Assigned → In Progress → Resolved → Verified
```

## G5 — Make the live demo dramatic without becoming gimmicky

A new incident should appear on the dashboard without a full page reload.

---

# 3. User Roles

## 3.1 Citizen

Primary tasks:
- submit report,
- choose category,
- select location,
- describe problem,
- optionally attach evidence,
- see confirmation.

Citizen UI should be simple and mobile-friendly.

## 3.2 Authority

Primary tasks:
- monitor dashboard,
- inspect hotspot,
- inspect incident,
- understand evidence,
- assign response team,
- update status,
- resolve incident,
- verify impact.

Authority gets the full command-center interface.

## 3.3 Admin/Demo

Primary tasks:
- reset demo,
- seed demo,
- replay scenario,
- monitor system state.

---

# 4. Information Architecture

Recommended navigation:

```text
CivicPulse
│
├── Overview
│
├── Incidents
│   ├── Active
│   ├── All
│   └── Resolved
│
├── Hotspots
│
├── Reports
│
├── Analytics
│
└── Demo Replay
```

Keep navigation small.

Do not create pages merely to demonstrate technology.

---

# 5. Application Shell

## Desktop Layout

```text
┌───────────────────────────────────────────────────────────────┐
│ Logo │ Search │ Time Range │ Notifications │ User            │
├─────────────┬─────────────────────────────────┬───────────────┤
│             │                                 │               │
│ Navigation  │          CITY MAP               │ INCIDENTS     │
│             │                                 │               │
│ Overview    │                                 │ Emerging      │
│ Incidents   │       hotspots / reports        │ Active        │
│ Hotspots    │                                 │               │
│ Reports     │                                 │               │
│ Analytics   │                                 │               │
│             │                                 │               │
├─────────────┴─────────────────────────────────┴───────────────┤
│ Trend / Response / Impact                                    │
└───────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

On smaller screens:

```text
Header
  ↓
Key metrics
  ↓
Map
  ↓
Incidents
  ↓
Analytics
```

The authority workflow must remain usable.

---

# 6. Visual Design Direction

## Overall Feel

Target:

- premium,
- operational,
- technical,
- trustworthy,
- modern,
- data-dense but readable.

Avoid making the interface look like a sci-fi movie dashboard.

## Visual Principles

### Principle 1 — Map is the hero

The city map gets the most visual space.

### Principle 2 — Incidents have hierarchy

A high-priority incident should visually stand out from ordinary reports.

### Principle 3 — Evidence is more important than decoration

Numbers and explanations should be prominent.

### Principle 4 — Motion communicates state

Use animation for:
- new incident,
- realtime update,
- panel transition,
- status change.

Do not animate everything.

---

# 7. Design Tokens

Create centralized design tokens for:

- typography,
- spacing,
- border radius,
- shadows,
- surface/background,
- text hierarchy,
- status states,
- severity states.

Do not hardcode visual values across dozens of components.

## Severity

Severity should not rely only on color.

Represent severity using:

```text
HIGH
[icon] [label]
Evidence count
Anomaly level
```

Use:
- text,
- icon,
- border/indicator,
- optional color.

---

# 8. Dashboard

## 8.1 Header

Header contains:

- CivicPulse logo/name,
- current area/city,
- search,
- time filter,
- realtime connection state,
- notification control,
- user/role.

## 8.2 KPI Cards

Recommended:

### Active Incidents

```text
12
+3 today
```

### Emerging Incidents

```text
4
2 detected recently
```

### High Severity

```text
3
Requires attention
```

### Reports

```text
248
Last 24h
```

Metrics must come from backend data.

Never hardcode fake production statistics.

---

# 9. Map Experience

The map is the central component.

## 9.1 Layers

Support:

```text
Reports
Clusters
Hotspots
Incidents
```

Layers can be toggled.

## 9.2 Report Marker

Individual report marker should communicate:

- category,
- approximate time,
- status.

Avoid huge markers for every report.

## 9.3 Cluster Marker

Cluster marker should show:

```text
31
Reports
```

Clicking it opens cluster/incident information.

## 9.4 Hotspot

A hotspot should visually communicate density.

It can use:
- heatmap,
- translucent region,
- boundary,
- density layer.

## 9.5 Incident Region

An incident can display:

- centroid,
- affected radius,
- incident marker,
- severity indicator.

## 9.6 Map Interaction

Required:
- pan,
- zoom,
- click marker,
- click cluster,
- filter,
- fit to incident,
- reset view.

---

# 10. Incident Card

Each incident card should contain:

```text
[Severity]
WATER PIPELINE LEAKAGE

31 reports
5.1x baseline

Detected 4 min ago

580m radius

[In Progress]
```

Optional:
- trend arrow,
- department/team,
- time since detection.

Click opens detail.

---

# 11. Emerging Incident Panel

This panel is critical.

Order by operational urgency using the configured backend ordering.

Each item:

```text
HIGH
Water Pipeline Leakage
31 reports
5.1x baseline
Detected 4 min ago
```

A newly created incident should animate into the list.

---

# 12. Incident Detail

This is the most important screen after the main dashboard.

## Layout

```text
┌──────────────────────────────────────────────────────────┐
│ WATER PIPELINE LEAKAGE             HIGH     IN PROGRESS │
│ Detected 14:32                                         │
├───────────────────────┬──────────────────────────────────┤
│                       │ WHY DETECTED?                     │
│       MAP             │ 31 reports                       │
│                       │ 5.1x baseline                    │
│       580m            │ 580m cluster radius             │
│                       │ Rapid recent growth              │
├───────────────────────┴──────────────────────────────────┤
│ CONTRIBUTING REPORTS                                     │
├──────────────────────────────────────────────────────────┤
│ TIMELINE                                                 │
├──────────────────────────────────────────────────────────┤
│ AUTHORITY ACTION                                        │
├──────────────────────────────────────────────────────────┤
│ RESOLUTION / IMPACT                                     │
└──────────────────────────────────────────────────────────┘
```

---

# 13. "Why Detected?" Evidence Panel

Never show only:

```text
AI detected this incident.
```

Instead:

```text
WHY DETECTED

31 reports
5.1x historical/rolling baseline
580m spatial radius
+240% recent growth

Detection factors:
✓ High report concentration
✓ Activity spike
✓ Persistent recent activity
```

The actual values must come from the backend.

---

# 14. Contributing Reports

Show reports contributing to the incident.

Each report:

```text
#RP-1031
Water leakage
"Water is flowing continuously..."
12:42
Location: 220m from incident center
```

Support:
- pagination,
- filtering,
- map highlight.

Do not load hundreds of reports into the DOM at once.

---

# 15. Incident Timeline

Timeline example:

```text
14:02
Citizen report received

14:08
Additional report received

14:15
Spatial cluster formed

14:28
Activity exceeded baseline

14:32
Emerging incident created

14:34
Authority acknowledged

14:37
Water Response Team assigned
```

Each event should have:
- timestamp,
- event type,
- actor if available,
- short description.

---

# 16. Authority Action Panel

For a detected incident:

```text
Status
[ DETECTED ]

[ Acknowledge ]
```

After acknowledgement:

```text
Assign Team
[ Water Response Team ▼ ]

[ Assign ]
```

Then:

```text
[ Mark In Progress ]
```

Then:

```text
[ Resolve Incident ]
```

Only valid actions should be shown/enabled.

---

# 17. Resolution UI

Resolution form:

```text
Resolution Type
[ Pipeline Repair ▼ ]

Description
[................................]

Evidence
[Optional]

[ Resolve Incident ]
```

After resolution:

```text
✓ Incident Resolved

Resolved at 15:42
```

---

# 18. Impact UI

Impact should be visual.

Example:

```text
RESOLUTION IMPACT

Before
18 reports / 6h

After
3 reports / 6h

Activity change
-83%
```

Include measurement window:

```text
Compared across equivalent 6-hour windows.
```

Do not imply causality.

---

# 19. Prediction UI

Prediction is secondary.

Example:

```text
NEAR-TERM ACTIVITY

Next 6 hours

Projected:
18 reports

Recent activity remains elevated.

[View model evidence]
```

If uncertainty exists:

```text
Expected range:
14–22
```

Never show a fake "99% accurate" label.

---

# 20. Analytics

Required charts:

## Reports Over Time

Line/area chart.

## Category Distribution

Bar/donut chart.

## Incident Trend

Time series.

## Response Metrics

- average acknowledgement time,
- average assignment time,
- average resolution time.

Only show metrics that can be computed from available data.

## Resolution Impact

Before/after comparison.

---

# 21. Hotspot Page

Show:

- map,
- hotspot list,
- category,
- report count,
- radius,
- activity level,
- time window.

Example:

```text
HOTSPOT #07

Water Leakage
31 reports
580m radius
6-hour window

Activity:
5.1x baseline
```

Clicking a hotspot should focus the map.

---

# 22. Citizen Report UI

## Step 1 — Category

```text
What is the problem?

[ Water Leakage ]
[ Road Damage ]
[ Garbage ]
[ Drainage ]
[ Streetlight ]
[ Traffic/Safety ]
```

## Step 2 — Description

Text field.

## Step 3 — Location

Map picker.

## Step 4 — Evidence

Optional image.

## Step 5 — Submit

```text
[ Submit Report ]
```

## Confirmation

```text
Report submitted.

Reference:
#RP-1042

Thank you for helping identify civic issues.
```

Keep this flow short.

---

# 23. Demo Replay UI

This is an internal/demo feature.

Display:

```text
DEMO REPLAY

Scenario:
Water Pipeline Leakage

[Start] [Pause] [Reset]

Speed:
1x  2x  5x

Timeline:
00:00 Normal
00:10 Reports increasing
00:20 Cluster detected
00:30 Incident created
00:45 Authority assigned
01:00 Resolved
```

The replay must use backend-controlled deterministic events.

---

# 24. Realtime UX

When an incident is created:

1. map updates,
2. incident panel updates,
3. KPI updates,
4. subtle notification appears,
5. incident card enters list.

Example notification:

```text
New Emerging Incident

Water Pipeline Leakage
31 reports • 5.1x baseline

View incident →
```

Do not use disruptive modal dialogs for every realtime event.

---

# 25. Loading States

Use skeletons for:

- dashboard cards,
- incident list,
- incident detail,
- charts.

Map may use:
- loading overlay,
- placeholder state.

---

# 26. Empty States

Examples:

```text
No active incidents.

The city is currently within normal
observed activity levels.
```

For no reports:

```text
No reports match your filters.
```

Do not show blank white panels.

---

# 27. Error States

Example:

```text
Unable to load incidents.

Please retry.

[ Retry ]
```

Realtime:

```text
Realtime connection unavailable.
Showing periodically refreshed data.
```

The application must remain usable.

---

# 28. Component Architecture

Suggested structure:

```text
src/
├── components/
│   ├── layout/
│   ├── map/
│   ├── incidents/
│   ├── reports/
│   ├── analytics/
│   ├── workflow/
│   ├── realtime/
│   └── ui/
│
├── pages/
│   ├── Overview
│   ├── Incidents
│   ├── IncidentDetail
│   ├── Reports
│   ├── Hotspots
│   ├── Analytics
│   └── DemoReplay
│
├── api/
├── hooks/
├── types/
├── utils/
└── styles/
```

---

# 29. Map Component Architecture

Suggested:

```text
CityMap
 ├── ReportLayer
 ├── ClusterLayer
 ├── HotspotLayer
 ├── IncidentLayer
 ├── MapControls
 └── MapLegend
```

Keep map state isolated from unrelated UI state.

---

# 30. Data Fetching

Use a centralized API layer.

Example conceptual functions:

```text
getOverview()
getIncidents()
getIncident(id)
getHotspots()
getReports()
createReport()
updateIncidentStatus()
assignIncident()
resolveIncident()
getPredictions()
getAnalytics()
```

Components should not each implement their own network logic.

---

# 31. Type Safety

Create TypeScript interfaces/types matching backend schemas.

Core types:

```text
Report
Classification
Cluster
Anomaly
Incident
IncidentEvidence
Assignment
IncidentEvent
Prediction
Resolution
ImpactMetric
```

Avoid `any` for API responses.

---

# 32. State Management

Separate:

### Server State
- reports,
- incidents,
- analytics,
- predictions.

### UI State
- selected incident,
- map layer toggles,
- filter state,
- panel open/closed.

Do not put everything into one global store.

---

# 33. API Integration Contract

Frontend expects stable response shapes.

Example incident:

```json
{
  "id": "uuid",
  "category": "water_leakage",
  "title": "Water Pipeline Leakage",
  "severity": "HIGH",
  "status": "DETECTED",
  "report_count": 31,
  "radius_meters": 580,
  "detected_at": "2026-01-01T14:32:00Z",
  "evidence": {
    "baseline": 6,
    "observed": 31,
    "anomaly_score": 5.1,
    "reasons": [
      "High report concentration",
      "Activity above baseline"
    ]
  }
}
```

The exact backend schema may refine field names, but the semantic contract must remain.

---

# 34. Realtime Contract

Example event:

```json
{
  "event_id": "uuid",
  "event_type": "incident.created",
  "timestamp": "2026-01-01T14:32:00Z",
  "entity_type": "incident",
  "entity_id": "uuid",
  "payload": {
    "severity": "HIGH",
    "category": "water_leakage"
  }
}
```

Frontend must update affected state without full-page reload.

---

# 35. Animation Requirements

Use animation for:

- new incident appearance,
- marker pulse,
- status transition,
- panel entrance,
- number update.

Keep duration short.

Avoid:
- constant pulsing everywhere,
- spinning dashboards,
- excessive parallax,
- animations that slow interaction.

---

# 36. Accessibility

Minimum:

- semantic buttons,
- labels for form controls,
- keyboard navigation,
- visible focus,
- meaningful alt text for images,
- status not communicated only by color,
- readable font sizes.

---

# 37. Performance

## Map
Use:
- clustering,
- viewport filtering,
- simplified layers.

## Lists
Use:
- pagination,
- virtualization if necessary.

## API
Avoid:
- duplicate requests,
- refetching everything after every event.

## Realtime
Update only affected entities.

---

# 38. Mobile Citizen Experience

Citizen report flow must work well on mobile.

Prioritize:

```text
Category
 ↓
Description
 ↓
Location
 ↓
Evidence
 ↓
Submit
```

Authority command center can prioritize desktop.

---

# 39. Demo-Specific Visual Requirements

The water leakage demo should visibly progress.

### Initial

```text
Normal activity
```

### During replay

Reports begin appearing.

### Detection

A cluster appears.

### Anomaly

Evidence panel changes.

### Incident

A new high-priority card appears.

### Response

Assignment/status changes.

### Resolution

Incident leaves active queue.

### Impact

Before/after metric appears.

This sequence should be understandable even if the presenter says very little.

---

# 40. Do Not Build

For the hackathon MVP, do NOT spend time on:

- 3D city maps,
- complex GIS editing,
- dozens of map layers,
- social feeds,
- generic chatbot pages,
- complicated user profiles,
- unnecessary settings pages,
- dark-mode/light-mode duplication,
- elaborate onboarding,
- advanced animation libraries,
- custom design systems beyond what is needed.

---

# 41. Definition of Done

UI is complete when:

1. Dashboard loads real backend data.
2. Map displays reports/hotspots/incidents.
3. Incident cards update.
4. Incident detail shows evidence.
5. Authority can change valid statuses.
6. Assignment works.
7. Resolution works.
8. Impact is displayed.
9. Realtime incident creation updates UI without reload.
10. Citizen can submit a report.
11. Loading/error/empty states work.
12. Demo replay is reproducible.

---

# 42. Frontend Acceptance Test

### Test

Start with normal demo data.

1. Open Overview.
2. Confirm normal map.
3. Start replay.
4. Watch reports appear.
5. Observe cluster/hotspot.
6. Observe emerging incident.
7. Open incident.
8. Read evidence.
9. Acknowledge.
10. Assign response team.
11. Mark In Progress.
12. Resolve.
13. Verify impact.
14. Confirm incident leaves active queue.

If this sequence works smoothly, the UI satisfies the primary hackathon objective.

---

# 43. Final UX Principle

The interface should make the judge feel:

```text
"I can see the problem emerging."
        ↓
"I can see why the system detected it."
        ↓
"I can see what the authority should do."
        ↓
"I can see what happened after action."
```

That is the complete CivicPulse visual story.
