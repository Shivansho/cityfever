# Member 6 — Integration, Testing, Demo & Pitch

## Mission
Own the final integration layer. You are responsible for making sure the six people's work behaves like ONE product.

## Ownership
- Repository/project structure.
- Integration testing.
- Seed/demo dataset.
- Environment configuration.
- End-to-end demo flow.
- Final README.
- Pitch/PPT support.
- Demo recovery/fallback plan.

## Do NOT rewrite other members' modules
If something breaks, first identify the contract mismatch and communicate with the responsible member.

## Canonical end-to-end flow

```text
Citizen
  ↓
Complaint submission
  ↓
FastAPI
  ↓
ML classification
  ↓
Entity extraction
  ↓
Priority scoring
  ↓
Duplicate detection
  ↓
Database
  ↓
Officer queue
  ↓
Mapbox visualization
  ↓
Officer action
```

## Integration checklist

### Backend
- [ ] Server starts.
- [ ] Database initializes.
- [ ] ML model loads.
- [ ] Complaint POST works.
- [ ] Complaint GET works.
- [ ] Reassignment works.
- [ ] Status update works.

### ML
- [ ] No notebook dependency.
- [ ] Models exist.
- [ ] Actual metrics are available.
- [ ] Confidence is returned.

### Priority
- [ ] Score is 0–100.
- [ ] Level is Low/Medium/High.
- [ ] Reasons are returned.
- [ ] Rules are documented.

### Duplicate
- [ ] Similarity check works.
- [ ] Original complaints remain visible.
- [ ] Cluster ID is returned where applicable.

### Frontend
- [ ] Complaint form works.
- [ ] API response renders.
- [ ] Officer queue works.
- [ ] Manual-review cases are visible.
- [ ] Status/reassignment works.

### Mapbox
- [ ] Token comes from environment variable.
- [ ] Markers use real backend data.
- [ ] Clicking a marker shows details.
- [ ] Filters work.

## Seed demo dataset

Create 15–30 realistic complaints covering:
- potholes,
- garbage,
- water leakage,
- sewage overflow,
- broken street lights,
- traffic issues,
- park maintenance,
- ambiguous complaints,
- several similar complaints around one location.

Include at least:
1. One obvious high-priority complaint.
2. One low-confidence complaint.
3. One duplicate cluster with 3–4 reports.
4. One complaint with duration.
5. One complaint with locality.
6. Multiple departments.

Never present synthetic demo records as real government data. Label them as demo/synthetic data.

## 3-minute demo

### 0:00–0:30
Submit:
> "Sewage has been overflowing near a school for three days."

Show:
- Sewage
- High priority
- extracted locality/duration
- explanation

### 0:30–1:15
Open officer dashboard.

Show:
- queue
- confidence
- manual review
- filters

### 1:15–1:50
Submit a similar complaint from nearby.

Show:
> Possible duplicate cluster detected.

### 1:50–2:20
Open Mapbox.

Show:
- complaint marker
- concentration
- filters

### 2:20–3:00
Show model evaluation and explain:
> "The system recommends routing and operational priority using measurable rules and model confidence. Low-confidence cases remain with a human officer."

## Final README must contain
- Problem.
- Solution.
- Architecture.
- Tech stack.
- ML methodology.
- Priority methodology.
- Duplicate methodology.
- API endpoints.
- Setup instructions.
- Environment variables.
- Model metrics.
- Limitations.
- Future scope.

## Final pre-demo command
The whole project should be runnable from a clean environment using documented commands. Do one complete test from complaint submission to database → dashboard → map before presenting.
