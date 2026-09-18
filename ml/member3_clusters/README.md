# Member 3 — Spatial Incident Clustering & Hotspot Analytics

## 📌 Role Overview
Member 3 is responsible for detecting emerging incident clusters, geographical hotspots, and volume anomalies across incoming municipal complaints.

---

## 🎯 Target Responsibilities
- Group co-located complaints within spatial proximity (e.g. 500m radius) using algorithms such as DBSCAN (Haversine metric) or grid clustering.
- Detect spatial incident spikes (e.g., sudden concentration of water contamination or sewer bursts in a single neighborhood).
- Produce cluster centroids, dominant departments, radii, and member complaint ID lists for map visualization.
- Feed cluster coordinates into Mapbox / GeoJSON layers for city operations triage.

---

## 🔌 Integration Point
- **Backend service file**: `backend/services/clusters.py`
- **Dashboard route**: `backend/routes/dashboard.py` (`GET /api/dashboard/clusters`, `GET /api/dashboard/hotspots`)
- **Main function contract**:
  ```python
  def cluster_spatial_incidents(
      complaints: list[dict],
      eps_km: float = 0.5,
      min_samples: int = 2
  ) -> list[dict]:
      """
      Returns:
          [
              {
                  "cluster_id": "SP-CLUST-001",
                  "center_latitude": 28.6139,
                  "center_longitude": 77.2090,
                  "complaint_count": 5,
                  "dominant_department": "Sewage",
                  "high_priority_count": 3,
                  "radius_meters": 120.0,
                  "complaint_ids": ["C1001", "C1003", ...]
              }
          ]
      """
  ```

---

## 🧪 Verification
Test spatial clustering logic:
```bash
python -c "from backend.services.clusters import cluster_spatial_incidents; print(cluster_spatial_incidents([{'id': '1', 'latitude': 28.6, 'longitude': 77.2}, {'id': '2', 'latitude': 28.601, 'longitude': 77.201}]))"
```
