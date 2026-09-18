"""
CivicFlow — Backend Services
=============================
Member 4: Operational Intelligence Layer
- Explainable Priority Scoring (calculate_priority)
- Entity Extraction (extract_entities)
- Similar/Duplicate Detection (find_similar_complaints)
"""

from .priority import calculate_priority, CONFIG as PRIORITY_CONFIG
from .entities import extract_entities, extract_duration, extract_locality
from .duplicates import find_similar_complaints, haversine_distance_meters, DUPLICATE_CONFIG

__all__ = [
    "calculate_priority",
    "extract_entities",
    "extract_duration",
    "extract_locality",
    "find_similar_complaints",
    "haversine_distance_meters",
    "PRIORITY_CONFIG",
    "DUPLICATE_CONFIG",
]
