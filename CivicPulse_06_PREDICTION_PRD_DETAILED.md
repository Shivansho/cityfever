# CivicPulse — Prediction Product Requirements Document
## Version 1.0 — Civic Issue Forecasting

> This document defines the prediction layer of CivicPulse.
> Prediction is a supporting intelligence capability, not the source of truth for incident detection.

---

# 1. Prediction Mission

CivicPulse should not only answer:

> "What problem is happening now?"

It should also help answer:

> **"Where and what type of civic issue may become more significant next?"**

The prediction layer uses historical and recent civic activity to generate short-horizon forecasts.

The prediction must be:

- measurable,
- explainable,
- bounded,
- uncertainty-aware,
- useful for prioritization,
- demonstrable during the hackathon.

---

# 2. What Prediction Is NOT

Prediction is not:

- guaranteed future knowledge,
- a claim that an incident will definitely happen,
- an autonomous government decision,
- a replacement for real-world verification,
- a reason to fabricate alerts.

The UI must use language such as:

```text
Predicted increase
Forecast
Elevated likelihood
Expected activity
Potential emerging area
```

Avoid:

```text
This WILL happen.
```

---

# 3. Prediction Use Cases

The MVP focuses on three use cases.

## Use Case A — Category Forecast

Predict near-term report volume for a category.

Example:

```text
Water leakage
Current activity: 18 reports
Expected next window: 24 reports
```

## Use Case B — Area Risk Signal

Identify areas with increasing recent activity.

Example:

```text
Zone A
Recent activity: increasing
Expected pressure: elevated
```

## Use Case C — Trend Forecast

Show whether a civic issue is:

```text
RISING
STABLE
DECLINING
```

These are easier to demonstrate than complex long-term forecasting.

---

# 4. Prediction Horizon

For hackathon MVP:

```text
6 hours
12 hours
24 hours
```

Primary demo horizon:

```text
next 6–12 hours
```

Do not build long-term yearly forecasts.

Short-horizon forecasting is more aligned with the operational use case.

---

# 5. Prediction Inputs

Potential features:

```text
recent report count
historical report count
category
time of day
day of week
recent growth
anomaly ratio
spatial density
active incident count
recent trend
```

Optional future features:

```text
weather
traffic
public events
seasonality
infrastructure metadata
```

Do not make external data dependencies mandatory for the MVP.

---

# 6. Data Pipeline

```text
Historical Reports
       ↓
Aggregation
       ↓
Feature Engineering
       ↓
Trend Detection
       ↓
Forecast Model
       ↓
Prediction + Uncertainty
       ↓
Store Prediction
       ↓
Prediction API
       ↓
Dashboard
```

---

# 7. Data Aggregation

Reports should be aggregated into consistent time buckets.

Example:

```text
1-hour buckets
```

Dataset:

```text
10:00 → 2
11:00 → 3
12:00 → 4
13:00 → 7
14:00 → 11
15:00 → 14
```

The model works on the time series rather than individual raw reports.

---

# 8. Minimum Data Requirement

A prediction model should not pretend to be reliable with almost no historical data.

For the hackathon:

```text
Synthetic/deterministic demo data
```

can be used.

The UI must label demo forecasts appropriately if they are based on synthetic data.

---

# 9. Recommended MVP Model

Start simple.

Possible approaches:

### Baseline 1 — Moving Average

```text
forecast =
average(previous N comparable windows)
```

### Baseline 2 — Exponential Smoothing

Useful for trend-following behavior.

### Baseline 3 — Linear Trend

Useful for a visually obvious rising sequence.

Use the simplest model that creates a believable and measurable demo.

---

# 10. Optional ML Model

If time permits:

```text
RandomForestRegressor
GradientBoostingRegressor
XGBoost
```

with engineered temporal/spatial features.

Do not use a complex deep-learning model unless the team already has expertise and enough data.

---

# 11. Why Simple Models Are Acceptable

For a hackathon, judges should be able to understand:

```text
Historical activity
        ↓
Recent trend
        ↓
Forecast
```

A complicated black-box model with no credible dataset can weaken the project.

Explainability is more valuable than model complexity for the MVP.

---

# 12. Forecast Output

Store:

```text
predicted_value
lower_bound
upper_bound
forecast_start
forecast_end
model_name
model_version
```

Example:

```json
{
  "category": "water_leakage",
  "forecast_start": "2026-09-18T18:00:00Z",
  "forecast_end": "2026-09-19T06:00:00Z",
  "predicted_value": 24,
  "lower_bound": 18,
  "upper_bound": 31,
  "model_name": "exponential_smoothing",
  "model_version": "v1"
}
```

---

# 13. Uncertainty

Predictions should not be shown as one perfect number.

Show:

```text
Expected: 24
Range: 18–31
```

This communicates uncertainty honestly.

---

# 14. Trend Classification

The system can derive:

```text
RISING
STABLE
DECLINING
```

based on recent activity.

Example:

```text
last 3 windows:
8 → 13 → 21

trend:
RISING
```

The trend classification should be based on explicit rules.

---

# 15. Forecast Confidence

Avoid calling statistical uncertainty a generic "AI confidence."

Use terminology such as:

```text
Forecast range
Prediction interval
Model confidence
```

only where technically justified.

If a confidence metric is used, document how it is calculated.

---

# 16. Spatial Prediction

Spatial forecasting can be simplified.

Instead of trying to predict an exact future coordinate:

```text
predict activity for geographic cells/zones
```

Example:

```text
Zone A → elevated
Zone B → normal
Zone C → rising
```

For the MVP, use grid cells or predefined zones.

---

# 17. Geographic Grid

Possible approach:

```text
Map
 ↓
Divide into cells
 ↓
Count reports per cell
 ↓
Build time series per cell
 ↓
Forecast high-activity cells
```

This avoids attempting an unrealistic city-scale geospatial prediction model.

---

# 18. Prediction + Current Incident

Prediction should complement current detection.

Example:

```text
CURRENT:
Water leakage incident detected

FORECAST:
Water-related reports expected to remain elevated
over the next 6 hours
```

Do not let the prediction automatically create a critical incident.

---

# 19. Prediction + Emerging Signal

A useful operational signal:

```text
Recent activity rising
+
Forecast rising
+
Spatial concentration
```

can produce:

```text
WATCH AREA
```

This is distinct from a confirmed incident.

---

# 20. Watch Area

A watch area is a lower-confidence operational signal.

Example:

```text
WATCH AREA

Category:
Drainage

Trend:
Rising

Forecast:
Elevated

Action:
Monitor incoming reports
```

This creates a useful distinction:

```text
Incident = detected problem
Watch = potential emerging problem
```

---

# 21. Prediction API

## GET `/predictions`

Parameters:

```text
category
horizon
zone_id
start_time
```

Example:

```text
GET /api/v1/predictions?category=water_leakage&horizon=12h
```

Response:

```json
{
  "category": "water_leakage",
  "horizon_hours": 12,
  "predicted_value": 24,
  "lower_bound": 18,
  "upper_bound": 31,
  "trend": "RISING"
}
```

---

# 22. Prediction by Incident

## GET `/incidents/{incident_id}/prediction`

Returns prediction relevant to an active incident.

Example:

```json
{
  "incident_id": "uuid",
  "category": "water_leakage",
  "trend": "RISING",
  "predicted_value": 24,
  "lower_bound": 18,
  "upper_bound": 31
}
```

If insufficient data exists:

```json
{
  "available": false,
  "reason": "INSUFFICIENT_HISTORY"
}
```

Never fabricate a prediction.

---

# 23. Prediction Storage

Use the `predictions` table defined in the Database PRD.

Required:

```text
id
incident_id
category
forecast_start
forecast_end
predicted_value
lower_bound
upper_bound
model_name
model_version
features
created_at
```

---

# 24. Feature Storage

Store important model inputs in JSONB.

Example:

```json
{
  "recent_count": 21,
  "moving_average": 12.4,
  "growth_percent": 69.3,
  "anomaly_ratio": 2.8
}
```

This helps explain the forecast.

Do not store sensitive information unnecessarily.

---

# 25. Prediction Explainability

The UI should answer:

> "Why is this forecast rising?"

Example:

```text
Forecast is rising because:

• Report activity increased 69% recently
• Current activity is above historical average
• Water leakage reports are concentrated in the same area
```

These reasons should be generated from structured features.

LLM may turn structured evidence into natural language, but must not invent the evidence.

---

# 26. LLM Role in Prediction

LLM can help with:

```text
forecast explanation
authority summary
natural-language interpretation
```

LLM should NOT calculate the forecast.

Preferred:

```text
Forecast model
      ↓
Structured result
      ↓
LLM explanation
```

Not:

```text
LLM:
"I predict 87% chance of leakage."
```

unless a real calibrated model supports that exact probability.

---

# 27. Prediction Refresh

For demo:

```text
refresh after significant new report batches
```

or:

```text
every 15–30 minutes
```

For a live hackathon demo, a manual/demo refresh is acceptable.

Do not build a complex streaming forecasting platform.

---

# 28. Prediction Demo

Recommended demo:

```text
Historical graph
      ↓
Activity begins increasing
      ↓
Prediction panel appears
      ↓
Expected next-window reports: 24
      ↓
Range: 18–31
      ↓
Trend: RISING
      ↓
Map highlights watch area
```

Then incoming reports can reinforce the narrative.

---

# 29. Strong Visual Design

Prediction should not be a plain number.

Show:

```text
┌─────────────────────────────┐
│ WATER LEAKAGE FORECAST      │
│                             │
│      24 expected            │
│      18 — 31 range          │
│                             │
│      ↑ RISING               │
│                             │
│  Activity has increased     │
│  69% in recent windows      │
└─────────────────────────────┘
```

Use a time-series chart with:

```text
observed line
forecast line
forecast interval
```

---

# 30. Prediction + Map

A strong visual:

```text
CITY MAP

  normal area

       ███
     ███████
    █████████     ← WATCH AREA
     ███████
       ███

     incident ●
```

Use different visual semantics for:

```text
Observed incident
Watch area
Historical activity
Forecast
```

Do not make every map region look alarming.

---

# 31. Prediction Metrics

Track:

### Forecast error

```text
MAE
RMSE
```

when enough test data exists.

### Directional accuracy

Did the model correctly identify:

```text
RISING / STABLE / DECLINING
```

### Coverage

If prediction intervals are used:

```text
percentage of actual values inside interval
```

For a hackathon, simple holdout evaluation is sufficient.

---

# 32. Train/Test Split

Do not randomly shuffle time-series data.

Use chronological split.

Example:

```text
First 80% → training
Last 20% → testing
```

or rolling validation.

---

# 33. Leakage Prevention

Do not use future data when creating historical features.

For each forecast:

```text
Only data available before forecast time
```

must be used.

This is important if judges ask how the model was evaluated.

---

# 34. Prediction Failure Modes

## Insufficient data

Return:

```text
INSUFFICIENT_HISTORY
```

## Sudden regime change

Display:

```text
Forecast uncertainty increased
```

where possible.

## API/model failure

Fallback:

```text
last known trend
```

but clearly label it as a fallback.

---

# 35. Prediction Risks

### Risk 1 — Fake intelligence

If forecast is based on arbitrary numbers, judges may notice.

Mitigation:

```text
deterministic dataset
real calculation
visible methodology
```

### Risk 2 — Overcomplicated model

Mitigation:

```text
start with moving average/exponential smoothing
```

### Risk 3 — Overclaiming accuracy

Mitigation:

```text
show evaluation metrics
state limitations
```

### Risk 4 — Prediction distracts from detection

Mitigation:

```text
detection remains primary
prediction is supporting intelligence
```

---

# 36. Typical Hackathon Team Approach

Most teams might build:

```text
"AI predicts future civic problems"
```

with:

```text
random chart
+
AI-generated prediction text
```

This is weak.

CivicPulse should build:

```text
real/deterministic time series
+
actual forecasting calculation
+
prediction interval
+
trend signal
+
geographic watch area
+
explanation from structured features
```

---

# 37. Differentiation Strategy

## Differentiator 1

Show actual forecast mathematics/metrics behind the visual.

## Differentiator 2

Connect forecast to geography.

## Differentiator 3

Connect prediction to action:

```text
Watch Area
    ↓
Monitor
    ↓
Incoming reports
    ↓
Incident detection
```

This creates a closed intelligence loop.

---

# 38. 48-Hour Scope

Must build:

```text
time-series aggregation
moving average/exponential smoothing
forecast endpoint
prediction card
forecast chart
trend indicator
```

Should build if time permits:

```text
spatial watch areas
prediction explanation
evaluation metrics
```

Avoid:

```text
deep learning forecasting
city-wide real-world deployment
weather/infrastructure data fusion
```

unless already available.

---

# 39. Suggested Tech Stack

```text
Python
FastAPI
pandas
numpy
scikit-learn
statsmodels
PostgreSQL
PostGIS
React/Next.js frontend
Recharts/ECharts
```

Use whichever chart library already exists in the frontend.

Do not add a new frontend visualization framework only for prediction.

---

# 40. Prediction Service Architecture

```text
PredictionService
│
├── aggregate_time_series()
├── build_features()
├── train_or_fit_model()
├── forecast()
├── calculate_interval()
├── evaluate()
└── explain_prediction()
```

Keep model code separate from API routes.

---

# 41. Prediction Data Flow

```text
Reports
  ↓
Time Buckets
  ↓
Features
  ↓
Forecast Model
  ↓
Prediction
  ↓
Prediction Interval
  ↓
Trend
  ↓
Database
  ↓
FastAPI
  ↓
Frontend
```

---

# 42. Final End-to-End Intelligence Loop

```text
REPORTS
   ↓
DETECTION
   ↓
INCIDENT
   ↓
ACTION
   ↓
RESOLUTION
   ↓
OUTCOME

Meanwhile:

REPORT HISTORY
   ↓
FORECAST
   ↓
WATCH AREA
   ↓
NEW REPORTS
   ↓
DETECTION
```

This is the larger CivicPulse vision.

---

# 43. What NOT to Build

Do not build:

- LLM-based numeric forecasting,
- fake probability scores,
- deep-learning forecasting without data,
- long-term city predictions,
- autonomous government decisions,
- overly precise future coordinates,
- weather integration unless readily available,
- dozens of forecasting models.

One credible model is better than five questionable models.

---

# 44. Prediction Definition of Done

Prediction is complete when:

1. Historical report activity can be aggregated.
2. Features can be generated without future leakage.
3. A baseline forecast works.
4. Forecast values are stored.
5. Prediction interval/range is available where supported.
6. Trend is calculated.
7. Prediction API works.
8. Frontend displays forecast chart.
9. Forecast explanation uses structured evidence.
10. Insufficient-history case is handled.
11. Model version is stored.
12. Basic evaluation is available.
13. Demo forecast is deterministic and reproducible.

---

# 45. Final Prediction Principle

CivicPulse should not claim:

> "We know what will happen."

It should demonstrate:

> **"Based on recent and historical civic activity, the system identifies where activity is trending upward, estimates the next-window volume, communicates uncertainty, and gives authorities an early watch signal before the situation becomes a confirmed incident."**

**End of Prediction PRD**
