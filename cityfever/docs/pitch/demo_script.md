# CivicFlow — Demo Script & Pitch Guide

## 1. Problem Statement (30 seconds)
- Municipal operations receive thousands of complaints daily.
- Routing is slow, manual, or based on opaque black-box models.
- Duplicate reports clutter the queues.
- High-risk incidents (e.g. hazardous sewage leaks near schools) get lost in the backlog.

## 2. Solution: CivicFlow (45 seconds)
- **Automatic NLP Complaint Routing**: Classifies department and issue type with calibrated confidence scores.
- **Explainable Operational Priority**: 100-point transparent scoring system with human-readable explanations.
- **Geospatial & Semantic De-duplication**: TF-IDF cosine similarity + Haversine distance clustering without deleting citizen submissions.
- **Unified Operations & Mapbox Dashboard**: Real-time triage queue for city officers.

## 3. Live Demo Flow (2 minutes)
1. **Citizen Submission**:
   - Submit a real-world complaint: *"Dangerous open sewer leaking outside Delhi Public School for 5 days, kids at risk of falling"*.
2. **Instant Pipeline Execution**:
   - Department classified as `Sewage` (Confidence: 0.96).
   - Priority calculated as `88 / 100 (High)` with explicit reasons:
     - *"High-severity issue type: Sewage Overflow"*
     - *"Reported duration exceeds 48 hours"*
     - *"Public location detected: school"*
     - *"Safety-related infrastructure issue"*
   - Extracted locality: *"Delhi Public School"*, Duration: *"5 days"*.
3. **Duplicate Detection Demonstration**:
   - Second citizen submits: *"Sewage overflow near DPS school entrance"*.
   - Automatically flagged as duplicate $\to$ added to cluster `CL-001`, preserving both submissions.
4. **Officer Queue & Mapbox Heatmap**:
   - Officer views sorted priority queue.
   - Low confidence complaints routed to "Manual Review".

## 4. Operational & Social Impact (30 seconds)
- Cuts triage time from hours to milliseconds.
- Increases accountability with explainable criteria.
- Protects citizen safety and prioritizes public institutions.
