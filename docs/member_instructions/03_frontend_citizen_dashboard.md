# Member 3 — Frontend: Citizen + Officer Dashboard

## Mission
Build the main web interface. It must consume the backend API instead of using hard-coded complaint results.

## Ownership
Build two views:
1. Citizen complaint submission.
2. Officer operations dashboard.

## Recommended stack
React + Vite.

If the team already selected plain HTML/JS, keep that choice instead. Do not rewrite the entire project because of framework preference.

## Citizen page

Fields:
- Complaint text — required.
- Locality — optional if it can be extracted automatically.
- Location — allow Mapbox/location selection if Member 5 exposes it.
- Submit button.

After submission show:
```text
Complaint ID
Issue type
Department
Priority
Confidence
Locality
Status
```

Example:
```text
Complaint #C1024

Department: Roads
Issue: Pothole
Priority: HIGH — 82/100
Confidence: 94%
Location: Krishna Nagar

Reason:
Safety-related infrastructure issue
Duration: 3 days
```

## Officer dashboard

Show:
- Total complaints.
- High/Medium/Low counts.
- Manual review count.
- Department filter.
- Priority filter.
- Complaint table/queue.
- Complaint details.
- Reassign button.
- Status update.
- Link/open map action.

## API contract
Do not invent frontend data models. Consume Member 2's canonical response:

```json
{
  "id": "C1024",
  "department": "Roads",
  "issue_type": "Pothole",
  "department_confidence": 0.94,
  "issue_confidence": 0.91,
  "priority_score": 82,
  "priority_level": "High",
  "locality": "Krishna Nagar",
  "latitude": 27.492,
  "longitude": 77.673,
  "status": "Pending"
}
```

## Important
- No fake dashboard numbers once API integration begins.
- Create a small mock fallback only during UI development.
- Keep API calls in one service/helper file so backend URL can be changed once.
- Do not implement ML logic in React.
- Do not duplicate priority calculations in frontend.

## Definition of Done
A judge can:
1. Open the website.
2. Submit a complaint.
3. See the real prediction from the backend.
4. Open the officer dashboard.
5. Filter complaints.
6. Open a complaint and see its prediction/explanation.
7. Reassign/update status.

## Handoff
Give the team:
- frontend folder,
- run command,
- backend URL configuration location,
- list of expected environment variables.
