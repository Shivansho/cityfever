"""
CivicFlow — Backend Services
=============================
Operational & ML Intelligence Layer:
- ML / Rule-based Classifier (predict_complaint)
- Explainable Priority Scoring (calculate_priority)
- Entity Extraction (extract_entities)
- Similar/Duplicate Detection (find_similar_complaints)
"""

from .classifier import predict_complaint
from .priority import calculate_priority, CONFIG as PRIORITY_CONFIG
from .entities import extract_entities, extract_duration, extract_locality
from .duplicates import find_similar_complaints, haversine_distance_meters, DUPLICATE_CONFIG
from .clusters import cluster_spatial_incidents, detect_hotspots

__all__ = [
    "predict_complaint",
    "calculate_priority",
    "extract_entities",
    "extract_duration",
    "extract_locality",
    "find_similar_complaints",
    "haversine_distance_meters",
    "cluster_spatial_incidents",
    "detect_hotspots",
    "PRIORITY_CONFIG",
    "DUPLICATE_CONFIG",
]

