"""
CivicFlow — Spatial Clustering & Incident Hotspot Engine
=========================================================
Member 3 | Spatial clustering and incident grouping stub.

Groups co-located complaints into geographical incident clusters
using DBSCAN (with Haversine metric) and provides pure-Python
spatial fallback when scikit-learn is unavailable.

Exported Functions:
    cluster_spatial_incidents(complaints: list[dict], eps_km: float, min_samples: int) -> list[dict]
    detect_hotspots(complaints: list[dict], min_count: int, radius_km: float) -> list[dict]
"""

from __future__ import annotations
import math
from collections import Counter, defaultdict
from typing import Optional, Any

try:
    import numpy as np
    from sklearn.cluster import DBSCAN
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in kilometers."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c


def _pure_python_clustering(
    valid_complaints: list[dict], eps_km: float = 0.5, min_samples: int = 2
) -> list[int]:
    """
    Connected components / greedy neighborhood clustering fallback
    when scikit-learn is not installed.
    Returns a list of cluster labels (-1 for noise).
    """
    n = len(valid_complaints)
    labels = [-1] * n
    cluster_id = 0

    # Build adjacency list
    adj = defaultdict(list)
    for i in range(n):
        for j in range(i + 1, n):
            c1 = valid_complaints[i]
            c2 = valid_complaints[j]
            dist = haversine_km(c1["latitude"], c1["longitude"], c2["latitude"], c2["longitude"])
            if dist <= eps_km:
                adj[i].append(j)
                adj[j].append(i)

    visited = [False] * n
    for i in range(n):
        if visited[i]:
            continue
        # Find connected component (density-reachable)
        component = []
        queue = [i]
        visited[i] = True

        while queue:
            curr = queue.pop(0)
            component.append(curr)
            for neighbor in adj[curr]:
                if not visited[neighbor]:
                    visited[neighbor] = True
                    queue.append(neighbor)

        if len(component) >= min_samples:
            for idx in component:
                labels[idx] = cluster_id
            cluster_id += 1
        else:
            for idx in component:
                labels[idx] = -1

    return labels


def cluster_spatial_incidents(
    complaints: list[dict],
    eps_km: float = 0.5,
    min_samples: int = 2,
) -> list[dict]:
    """
    Clusters a list of complaints based on GPS coordinates.

    Args:
        complaints: List of complaint dictionaries containing 'id', 'latitude', 'longitude', etc.
        eps_km: Neighborhood radius in kilometers (default: 0.5km = 500m).
        min_samples: Minimum number of complaints required to form a cluster.

    Returns:
        List of cluster summary dictionaries:
        [
            {
                "cluster_id": "SP-CLUST-001",
                "center_latitude": 28.6139,
                "center_longitude": 77.2090,
                "complaint_count": 4,
                "dominant_department": "Water",
                "high_priority_count": 2,
                "radius_meters": 142.5,
                "complaint_ids": ["C1001", "C1005", ...]
            }
        ]
    """
    valid_complaints = [
        c for c in complaints
        if c.get("latitude") is not None and c.get("longitude") is not None
    ]

    if len(valid_complaints) < min_samples:
        return []

    # Run clustering
    if SKLEARN_AVAILABLE and len(valid_complaints) > 0:
        try:
            coords = np.array([
                [math.radians(c["latitude"]), math.radians(c["longitude"])]
                for c in valid_complaints
            ])
            # eps in radians = eps_km / Earth radius
            kms_per_radian = EARTH_RADIUS_KM
            epsilon = eps_km / kms_per_radian
            db = DBSCAN(eps=epsilon, min_samples=min_samples, metric="haversine")
            labels = db.fit_predict(coords).tolist()
        except Exception:
            labels = _pure_python_clustering(valid_complaints, eps_km, min_samples)
    else:
        labels = _pure_python_clustering(valid_complaints, eps_km, min_samples)

    # Group complaints by cluster label
    clusters_dict = defaultdict(list)
    for c, label in zip(valid_complaints, labels):
        if label != -1:
            clusters_dict[label].append(c)

    results = []
    for label, group in clusters_dict.items():
        lats = [c["latitude"] for c in group]
        lngs = [c["longitude"] for c in group]
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)

        # Calculate max radius from centroid in meters
        max_dist_m = max(
            haversine_km(center_lat, center_lng, c["latitude"], c["longitude"]) * 1000.0
            for c in group
        )

        # Department breakdown
        dept_counts = Counter(c.get("department") or "Unknown" for c in group)
        dominant_dept = dept_counts.most_common(1)[0][0]

        high_priority = sum(1 for c in group if c.get("priority_level") == "High")

        results.append({
            "cluster_id": f"SP-CLUST-{label + 1:03d}",
            "center_latitude": round(center_lat, 6),
            "center_longitude": round(center_lng, 6),
            "complaint_count": len(group),
            "dominant_department": dominant_dept,
            "high_priority_count": high_priority,
            "radius_meters": round(max_dist_m, 1),
            "complaint_ids": [c["id"] for c in group if "id" in c],
        })

    # Sort descending by complaint count
    results.sort(key=lambda x: x["complaint_count"], reverse=True)
    return results


def detect_hotspots(
    complaints: list[dict],
    min_count: int = 3,
    radius_km: float = 0.75,
) -> list[dict]:
    """
    Detects high-density complaint hotspots requiring emergency or supervisory attention.
    """
    clusters = cluster_spatial_incidents(complaints, eps_km=radius_km, min_samples=min_count)
    # Filter hotspots with higher density or urgency
    hotspots = []
    for c in clusters:
        urgency = "High" if c["high_priority_count"] > 1 or c["complaint_count"] >= 5 else "Medium"
        hotspots.append({
            **c,
            "urgency": urgency,
            "description": f"{c['complaint_count']} reports concentrated within {int(c['radius_meters'])}m ({c['dominant_department']})"
        })
    return hotspots
