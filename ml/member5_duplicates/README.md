# Member 5 — Duplicate Complaint & Incident Grouping Engine

## 📌 Role Overview
Member 5 is responsible for deduplicating incoming complaints by matching them against recent civic reports using semantic text similarity and geospatial proximity.

---

## 🎯 Target Responsibilities
- Combine TF-IDF / embedding text similarity with Haversine distance calculations.
- Assign existing complaints into shared duplicate clusters (`duplicate_cluster_id`, e.g. `CL-004`).
- Support parent-child or group representation: do not delete duplicates; instead, cluster them so operations officers can resolve them as a single incident.
- Expose match metrics: cosine similarity score and list of matched complaint IDs.

---

## 🔌 Integration Point
- **Backend service file**: `backend/services/duplicates.py`
- **Main function contract**:
  ```python
  def find_similar_complaints(
      complaint_text: str,
      latitude: float | None,
      longitude: float | None,
      existing_complaints: list[dict]
  ) -> dict:
      """
      Returns:
          {
              "is_duplicate": bool,
              "duplicate_cluster_id": str | None,
              "similarity": float,
              "matched_complaint_ids": list[str]
          }
      """
  ```

---

## 🧪 Verification
Test similarity matching:
```bash
python -c "from backend.services.duplicates import find_similar_complaints; print(find_similar_complaints('Pothole on Main St', 28.6, 77.2, [{'id': '1', 'complaint_text': 'Big pothole on Main St', 'latitude': 28.6001, 'longitude': 77.2001, 'duplicate_cluster_id': 'CL-001'}]))"
```
