# CivicFlow — Demo Recovery / Fallback Plan

Owner: Member 6. Purpose: if something breaks during the live demo, degrade gracefully
instead of stalling in front of judges.

## Two datasets, two purposes — do not merge them

**Primary — `backend/civicflow_seed_complaints.json` + `backend/seed_demo.py`.** Raw
complaint texts (+ lat/long), no precomputed fields. Posts each entry through the real
`POST /api/complaints` pipeline so department, confidence, priority, and duplicate cluster
are all genuine model/rule output, not invented numbers:

```
cd backend && uvicorn main:app --reload --port 8000   # terminal 1
python backend/seed_demo.py                            # terminal 2
```

Coverage against `06`'s required demo-data characteristics: multiple departments (roads,
water, sanitation, electrical, sewage, traffic, parks, ambiguous), a 3-report duplicate
cluster (Krishna Nagar pothole — a third near-duplicate report was added here since the
original had only 2), several 2-report near-duplicate pairs (Rakabganj water, Bijlighar
wire, Shaheed Nagar manhole), low-confidence/ambiguous complaints, and complaints with
duration and locality phrases throughout.

**Open risk, not fixed here:** `seed_demo.py`'s `wait_for_backend()` polls `GET /` expecting
`200`. FastAPI has no default root route — if `backend/main.py` doesn't define one, this will
time out and falsely report the backend unreachable even though `/docs` works fine. Either
add a trivial `@app.get("/")` in `main.py`, or point the health check at `/docs` instead
(see `tests/test_integration.py` for that pattern). Confirm with Member 2 before the actual
demo rehearsal.

**Fallback only — `data/fallback/civicflow_fallback_demo.csv`.** 25 complaints with every
field (department, confidence, priority, status, cluster ID) filled in by hand. **These
values are illustrative, not model output** — never present them as real predictions.
This exists solely for the tiers below.

## Tier 1 — Everything works
Run the live pipeline as scripted in `docs/pitch/DEMO_SCRIPT.md`, seeded via
`backend/seed_demo.py`.

## Tier 2 — Backend or ML fails, frontend is fine
1. Stop trying to fix it live.
2. Load `data/fallback/civicflow_fallback_demo.csv` directly into the database
   (bypasses the ML/priority pipeline — every field is already populated).
3. Narrate explicitly: **"To keep the demo moving I'm loading a pre-computed dataset — here
   is what the live pipeline produces on a fresh submission"** and show one terminal-level
   example of `predict_complaint()` / `calculate_priority()` output instead, if time allows.
4. Never present the fallback CSV's numbers as live model output without saying so. Per
   `06`: synthetic/demo data must be labeled as such — this applies doubly to a fallback
   shown after the live path has visibly failed.

## Tier 3 — Frontend fails, backend is fine
Fall back to Swagger UI (`{backend_url}/docs`) and walk through `POST /api/complaints`,
`GET /api/dashboard/stats`, and `GET /api/complaints/{id}/similar` directly. Less polished,
still demonstrates the actual intelligence layer working.

## Tier 4 — No internet (Mapbox / venue wifi down)
Skip the live map. Have 2–3 screenshots of the map view (with markers, a cluster, and a
filter applied) ready as static slides. Say plainly that the map is shown as a screenshot due
to connectivity, not that it's live.

## Tier 5 — Total failure
Screen-record a full successful run once, before presenting, as an absolute last resort.
Label it clearly as a recording if it has to be shown.

## Pre-demo warm-up (do every time, not just once)
- Send one throwaway complaint through the API before judges arrive, so joblib model loading
  happens off-camera and the first real submission isn't the slow one.
- Confirm the DB isn't already full of test junk from rehearsal — reset if needed
  (`python backend/seed_demo.py` has no `--reset` flag itself, but `backend/civicflow.db`
  can be deleted and the backend restarted to reinitialize a clean schema).
- Re-run `pytest tests/test_integration.py -v` one final time against the exact environment
  you'll present on, not just your laptop from yesterday.