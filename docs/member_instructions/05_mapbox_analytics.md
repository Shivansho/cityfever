# Member 5 — Mapbox + Geospatial Analytics

## Mission
Build the geospatial intelligence layer using Mapbox and connect it to real complaint data from the backend.

## Ownership
- Mapbox map.
- Complaint markers.
- Marker detail interaction.
- Filters.
- Complaint density/heatmap visualization if time permits.
- Locality-level analytics.
- Map-to-dashboard integration.

## Map requirements

Use Mapbox API/token supplied by the team.

Do NOT commit the token to Git.

Use:
```text
VITE_MAPBOX_TOKEN
```
or the environment-variable convention already used by the project.

## Marker data

Use these backend fields:
```text
id
latitude
longitude
department
issue_type
priority_level
priority_score
status
locality
```

Marker click should display:
```text
Complaint ID
Issue
Department
Priority
Locality
Status
```

## Filters

At minimum:
```text
Department
Priority
Status
```

The map must update based on the same complaint dataset as the officer queue.

## Heatmap / density

If time permits, add a Mapbox heatmap showing complaint concentration.

The goal is not decoration. It should answer:
> "Where are complaints concentrated?"

Optional filters:
- last 24 hours
- last 7 days
- last 30 days

## Geospatial duplicate support

Member 4 owns the duplicate algorithm. You only visualize its output.

If a complaint belongs to a duplicate cluster:
```text
Cluster: CL-017
Reports: 4
```

Do not independently create a second duplicate algorithm.

## Analytics

At minimum provide:
- complaints by department,
- complaints by priority,
- complaint count by locality,
- high-priority concentration.

Use backend `/api/dashboard/stats` where possible.

## Definition of Done
A judge can:
1. See complaints on the map.
2. Click a marker.
3. See complaint details.
4. Filter the map.
5. See concentration/heatmap if implemented.
6. Open the corresponding complaint in the dashboard.

## Handoff
Tell Member 3:
- component location,
- required environment variable,
- map component props/API contract,
- how to run it.

Tell Member 2 if you need any additional backend fields.
