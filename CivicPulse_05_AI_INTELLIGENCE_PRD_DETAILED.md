# CivicPulse — AI Intelligence Product Requirements Document
## Version 1.0 — AI/ML Intelligence Layer

> This document defines how AI/ML contributes to CivicPulse.
> It follows the Master PRD, Database PRD, Backend API PRD, and UI/UX PRD.
> AI must create measurable operational value; it must not be added merely as a buzzword.

---

# 1. AI Mission

The AI layer converts raw citizen reports into structured, explainable intelligence.

Core transformation:

```text
Raw Citizen Reports
        ↓
Understand
        ↓
Normalize
        ↓
Group
        ↓
Detect abnormal activity
        ↓
Assess severity
        ↓
Explain
        ↓
Create actionable incident
```

The goal is not:

> "Build a chatbot."

The goal is:

> **Detect emerging civic problems earlier than manual complaint-by-complaint monitoring and explain the evidence behind the detection.**

---

# 2. AI Responsibilities

AI/ML may perform:

1. report text normalization,
2. category classification,
3. semantic similarity,
4. duplicate/near-duplicate detection,
5. spatial-temporal pattern support,
6. anomaly detection,
7. severity scoring,
8. incident summarization,
9. authority-facing explanation,
10. optional short-term prediction.

---

# 3. Non-AI Responsibilities

The following must remain deterministic or backend-controlled:

- authentication,
- authorization,
- database integrity,
- geographic coordinates,
- workflow state,
- authority assignment,
- audit events,
- final status transitions.

Do not let an LLM directly decide:

```text
"Create a critical incident because I feel this is serious."
```

Instead use structured evidence.

---

# 4. AI Architecture

```text
                    REPORT
                       ↓
              Text Preprocessing
                       ↓
             ┌─────────┴─────────┐
             ↓                   ↓
       Classification       Embedding
             ↓                   ↓
          Category        Similarity/Duplicate
             └─────────┬─────────┘
                       ↓
              Spatial + Temporal
                   Analysis
                       ↓
                Cluster Detection
                       ↓
               Anomaly Detection
                       ↓
               Severity Scoring
                       ↓
              Incident Evaluation
                       ↓
              Evidence Generation
                       ↓
                LLM Explanation
                       ↓
                  Authority UI
```

---

# 5. AI Pipeline

## Step 1 — Receive Report

Input:

```json
{
  "description": "Water is continuously flowing from the road near the main market.",
  "category": "water_leakage",
  "latitude": 27.1767,
  "longitude": 78.0081
}
```

Store the raw report before AI processing.

---

# 6. Text Normalization

Normalize:

- whitespace,
- casing,
- obvious formatting,
- language variations where practical.

Do not destroy the original description.

Store:

```text
raw_description
normalized_description
```

---

# 7. Category Classification

The system should map reports to canonical categories:

```text
water_leakage
road_damage
garbage
drainage
streetlight
traffic_safety
other
```

## MVP Strategy

If the user explicitly selects a category:

```text
Use selected category.
```

AI can validate or suggest an alternative.

If no category is provided:

```text
Use text classifier/LLM classification.
```

This reduces unnecessary AI dependence.

---

# 8. Classification Output

Example:

```json
{
  "category": "water_leakage",
  "confidence": 0.94,
  "model": "classifier-v1"
}
```

Confidence should be stored.

If confidence is low:

```text
category = other
```

or flag for review rather than pretending certainty.

---

# 9. Embeddings

Embeddings can represent report descriptions as vectors.

Purpose:

- semantic similarity,
- duplicate detection,
- related-report discovery,
- future clustering support.

Example:

```text
"Water leaking near market"
        ↕
"Road is flooded because pipe is broken"
```

These may be semantically related even if exact words differ.

---

# 10. Vector Storage

For MVP, options include:

### Option A

PostgreSQL + pgvector.

Preferred if available.

### Option B

In-memory/vector library for demo.

Only appropriate for very small datasets.

Avoid introducing a separate vector database unless necessary.

---

# 11. Duplicate Detection

Before treating every report as independent evidence:

```text
New report
   ↓
Semantic similarity
   +
Spatial proximity
   +
Temporal proximity
   ↓
Possible duplicate
```

A duplicate candidate should not automatically be discarded.

Instead:

```text
duplicate_score
```

can be stored and used as supporting intelligence.

---

# 12. Spatial Intelligence

AI is not solely responsible for geography.

Use PostGIS for exact geographic operations.

Example:

```text
Find reports within 500m
```

Then combine with:

```text
same/similar category
+
recent time window
```

This creates the candidate group.

---

# 13. Temporal Intelligence

The system should analyze report activity over time.

Example:

```text
10:00 → 1 report
11:00 → 2 reports
12:00 → 3 reports
13:00 → 7 reports
14:00 → 18 reports
```

This indicates a possible activity spike.

---

# 14. Cluster Detection

For MVP, use a simple explainable approach.

Possible:

```text
DBSCAN
```

Inputs:

```text
latitude/longitude
category
time window
```

Output:

```text
cluster_id
centroid
radius
report_count
```

Do not make clustering unnecessarily complex.

---

# 15. Cluster Requirements

A candidate cluster should have:

```text
minimum report count
maximum spatial radius
maximum time window
```

Example demo configuration:

```text
minimum reports: 5
radius: 750m
time window: 6h
```

These values must be configurable.

They are demonstration defaults, not universal civic thresholds.

---

# 16. Baseline Calculation

Anomaly detection requires a baseline.

Possible baseline:

```text
same category
same area
previous comparable time windows
```

For MVP, a rolling baseline is sufficient.

Example:

```text
baseline = average reports per equivalent time window
```

---

# 17. Anomaly Score

Simple interpretable metric:

```text
anomaly_ratio =
observed_activity / max(baseline_activity, epsilon)
```

Example:

```text
Observed = 31
Baseline = 6

ratio = 5.17x
```

This is easy to explain to judges.

---

# 18. Growth Signal

Also calculate recent growth.

Example:

```text
previous window = 10 reports
current window = 25 reports

growth = +150%
```

Growth should complement, not replace, anomaly detection.

---

# 19. Severity Model

Severity should combine structured factors.

Example:

```text
severity_score =
  w1 * normalized_report_volume
+ w2 * normalized_anomaly
+ w3 * growth_signal
+ w4 * persistence
```

Weights must be configuration-driven.

Do not claim scientific validity for hackathon weights.

---

# 20. Severity Bands

Example:

```text
0–0.25    LOW
0.25–0.50 MEDIUM
0.50–0.75 HIGH
0.75–1.00 CRITICAL
```

These are configurable demonstration bands.

---

# 21. Incident Creation Rule

A candidate incident can be created when:

```text
cluster qualifies
AND
anomaly exceeds threshold
AND
category is actionable
```

Example:

```text
report_count >= 5
AND anomaly_ratio >= 2.0
```

The exact thresholds should be configurable.

---

# 22. Avoid Alert Spam

The system must not create:

```text
Incident #1
Incident #2
Incident #3
```

for the same underlying event.

Use:

```text
category
+
spatial overlap
+
time overlap
```

to determine whether an existing incident should be updated.

---

# 23. Incident Merge Logic

If a new cluster overlaps an existing active incident:

```text
update existing incident
```

rather than:

```text
create another incident
```

This is important for demo realism.

---

# 24. Evidence Object

Every incident should have structured evidence.

Example:

```json
{
  "observed_reports": 31,
  "baseline_reports": 6,
  "anomaly_ratio": 5.17,
  "growth_percent": 240,
  "radius_meters": 580,
  "time_window_hours": 6,
  "reasons": [
    "31 reports concentrated within 580m",
    "Activity is 5.17x baseline",
    "Recent report volume increased rapidly"
  ]
}
```

This powers the UI's:

> Why detected?

panel.

---

# 25. LLM Role

The LLM should convert structured evidence into a concise operational summary.

Input:

```text
Category:
water_leakage

Reports:
31

Baseline:
6

Anomaly:
5.17x

Radius:
580m

Recent growth:
240%
```

Output:

```text
A concentrated increase in water leakage reports
has emerged within a 580m area. Current activity
is approximately 5.2x the baseline, with rapid
growth in recent reports.
```

The LLM should not invent evidence.

---

# 26. LLM Guardrails

LLM output must:

- use only supplied facts,
- avoid unsupported claims,
- avoid inventing locations,
- avoid inventing infrastructure,
- avoid claiming certainty,
- remain concise.

Prompt should explicitly say:

```text
Do not introduce facts that are not present in the input.
If evidence is insufficient, say so.
```

---

# 27. LLM Failure Handling

If the LLM API fails:

```text
Structured evidence remains available.
```

Fallback:

```text
Template-generated explanation.
```

Example:

```text
31 reports were observed within 580m,
compared with a baseline of 6.
```

The incident should still function.

---

# 28. Multilingual Reports

Potential future feature:

```text
Hindi
English
Hinglish
regional languages
```

For MVP:

- preserve original text,
- optionally normalize into English for downstream processing,
- never replace original user content.

Do not spend hackathon time supporting every language unless it is central to the judging criteria.

---

# 29. Image Intelligence

Optional.

If users upload images, future AI can identify:

- visible road damage,
- garbage accumulation,
- water presence,
- broken infrastructure.

For MVP:

```text
image stored as evidence
```

is sufficient unless a reliable vision model is already available.

Do not make image AI a dependency for incident detection.

---

# 30. AI Confidence

Every model output should have a confidence/quality signal where applicable.

Examples:

```text
classification_confidence
duplicate_similarity
anomaly_score
```

Do not represent an anomaly score as model probability unless it actually is one.

---

# 31. Model Registry Metadata

Store:

```text
model_name
model_version
created_at
```

For reproducibility.

Example:

```text
classifier-v1
embedding-model-v1
anomaly-engine-v1
```

---

# 32. Explainability

The system should answer:

```text
Why was this incident created?
```

with structured evidence.

Minimum:

```text
report count
baseline
anomaly ratio
radius
time window
recent growth
```

This is more useful than a generic AI explanation.

---

# 33. AI API Boundary

Internal service:

```text
AIService
```

Possible methods:

```text
classify_report()
embed_report()
find_similar_reports()
summarize_incident()
```

Intelligence engine:

```text
IntelligenceService
```

handles:

```text
cluster
baseline
anomaly
severity
incident decision
```

This separation prevents LLM logic from becoming the entire intelligence engine.

---

# 34. Suggested AI Tech Stack

## Core

```text
Python
FastAPI
scikit-learn
numpy
pandas
```

## Spatial

```text
PostGIS
GeoAlchemy2
```

## Embeddings

Possible:

```text
sentence-transformers
```

or an external embedding API.

## LLM

Any approved LLM API available to the team.

Keep the provider behind an abstraction.

---

# 35. Model Selection Strategy

Do not optimize for the fanciest model.

Choose based on:

```text
accuracy
latency
cost
availability
explainability
implementation effort
```

For the hackathon, deterministic statistical intelligence + lightweight ML + LLM explanation is a strong architecture.

---

# 36. AI Processing Latency

Target:

```text
normal report:
< 2–3 seconds
```

for the demo path.

If an external LLM makes the pipeline too slow:

```text
store report first
process explanation asynchronously
```

Do not block the entire reporting system unnecessarily.

---

# 37. AI Data Flow

```text
User Report
   ↓
Store Raw Data
   ↓
Normalize
   ↓
Category
   ↓
Embedding
   ↓
Spatial Candidate Search
   ↓
Temporal Candidate Search
   ↓
Cluster
   ↓
Baseline
   ↓
Anomaly
   ↓
Severity
   ↓
Incident Decision
   ↓
Structured Evidence
   ↓
LLM Explanation
   ↓
Incident API
   ↓
Dashboard
```

---

# 38. Demo Intelligence Scenario

Water leakage:

```text
Background:
6 reports / equivalent window

New reports:
31 reports

Area:
580m radius

Growth:
+240%

Anomaly:
5.17x

Result:
HIGH severity emerging incident
```

The exact demo numbers should be generated from the deterministic dataset and not hardcoded only in the frontend.

---

# 39. AI Demo Moment

The strongest AI moment should be:

```text
New reports appear
       ↓
Map cluster forms
       ↓
"Emerging Incident" appears
       ↓
Click
       ↓
WHY DETECTED?
       ↓
31 reports
5.17x baseline
580m radius
+240% growth
       ↓
AI generates concise explanation
```

This demonstrates AI as part of a real intelligence pipeline.

---

# 40. What Typical Teams Will Do

Likely approach:

```text
Complaint form
+
LLM chatbot
+
"AI predicts issue"
+
dashboard
```

This is easy to copy.

CivicPulse should instead show:

```text
Citizen signals
      ↓
Spatial intelligence
      ↓
Temporal anomaly
      ↓
Explainable incident
      ↓
Authority action
      ↓
Measured outcome
```

---

# 41. Differentiation

## Differentiator 1 — Evidence

Do not say:

```text
AI detected a hotspot.
```

Say:

```text
31 reports
5.17x baseline
580m radius
+240% recent growth
```

## Differentiator 2 — Operational workflow

Detection must lead to:

```text
assignment
→ response
→ resolution
```

## Differentiator 3 — Closed loop

Show:

```text
Before → Action → After
```

---

# 42. AI Risks

## Risk 1 — Hallucination

Mitigation:

```text
LLM only receives structured evidence.
```

## Risk 2 — Slow API

Mitigation:

```text
async explanation
fallback template
```

## Risk 3 — Bad classification

Mitigation:

```text
user category + confidence
```

## Risk 4 — False positives

Mitigation:

```text
multiple signals required
```

## Risk 5 — Overengineering

Mitigation:

```text
simple explainable algorithms
```

---

# 43. What NOT to Build

Do not spend hackathon time on:

- custom foundation model,
- complex deep-learning architecture,
- autonomous government decision-making,
- fully automated dispatch,
- facial recognition,
- expensive computer vision pipeline,
- reinforcement learning,
- massive vector infrastructure,
- training models from scratch.

None is required to demonstrate the core intelligence.

---

# 44. AI Evaluation Metrics

Track simple measurable metrics:

## Classification

```text
accuracy
confidence
```

## Duplicate similarity

```text
similarity score
```

## Detection

```text
true/false demo detection
detection delay
```

## Prediction

```text
MAE/RMSE where meaningful
```

## LLM

Use qualitative checks:

```text
grounded
concise
no unsupported claims
```

---

# 45. AI Definition of Done

AI layer is complete when:

1. Reports can be normalized.
2. Categories are canonicalized.
3. Classification output can be stored.
4. Similarity can be calculated if enabled.
5. Spatial grouping works.
6. Temporal grouping works.
7. Baseline can be calculated.
8. Anomaly score can be calculated.
9. Severity score can be calculated.
10. Incident decision is explainable.
11. Structured evidence is stored.
12. LLM summary can be generated.
13. LLM failure has a fallback.
14. AI model versions are recorded.
15. Demo scenario reliably produces the expected incident.

---

# 46. Final AI Principle

CivicPulse should never say:

> "AI knows there is a problem."

It should demonstrate:

> **"The system observed a measurable change in civic activity, detected a spatial-temporal pattern, quantified the anomaly, explained the evidence, and converted that signal into an actionable incident."**

That is the AI story.

**End of AI Intelligence PRD**
