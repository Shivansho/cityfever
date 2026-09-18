"""
CivicFlow — Duplicate Complaint Detection Engine
=================================================
Member 4 | Identifies similar and duplicate complaints using text similarity
and geospatial proximity.

Combines:
- TF-IDF Cosine Similarity for complaint text
- Haversine Distance for coordinate proximity

Function contract:
    find_similar_complaints(
        complaint_text: str,
        latitude: float | None,
        longitude: float | None,
        existing_complaints: list
    ) -> dict

Output contract:
    {
        "is_duplicate": bool,
        "duplicate_cluster_id": str | None,
        "similarity": float,
        "matched_complaint_ids": list[str]
    }
"""

from __future__ import annotations
import math
import re
from typing import Optional, Any

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


# ────────────────────────────────────────────────────────────
# Configurable Thresholds
# ────────────────────────────────────────────────────────────

DUPLICATE_CONFIG = {
    # If coordinates are within proximity distance, this text similarity triggers duplicate
    "text_similarity_with_coords": 0.40,
    # Distance in meters considered "same location"
    "proximity_distance_meters": 150.0,
    # If coordinates are missing or far, this higher text similarity triggers duplicate
    "text_similarity_standalone": 0.75,
    # Max distance (meters) to consider any spatial match
    "max_spatial_radius_meters": 500.0,
}


# ────────────────────────────────────────────────────────────
# Geospatial Distance: Haversine Formula
# ────────────────────────────────────────────────────────────

def haversine_distance_meters(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """
    Calculate the great-circle distance between two points on Earth in meters.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


# ────────────────────────────────────────────────────────────
# Text Preprocessing & Fallback Similarity
# ────────────────────────────────────────────────────────────

def _tokenize(text: str) -> list[str]:
    """Tokenize and normalize text."""
    clean = re.sub(r"[^\w\s]", " ", text.lower())
    return [t for t in clean.split() if len(t) > 2]


def _simple_cosine_similarity(text1: str, text2: str) -> float:
    """
    Fallback character-ngram / word-frequency cosine similarity
    in case scikit-learn is not installed in the environment.
    """
    tokens1 = _tokenize(text1)
    tokens2 = _tokenize(text2)
    if not tokens1 or not tokens2:
        return 0.0

    freq1: dict[str, int] = {}
    freq2: dict[str, int] = {}
    for t in tokens1:
        freq1[t] = freq1.get(t, 0) + 1
    for t in tokens2:
        freq2[t] = freq2.get(t, 0) + 1

    all_keys = set(freq1.keys()) | set(freq2.keys())
    dot = sum(freq1.get(k, 0) * freq2.get(k, 0) for k in all_keys)
    norm1 = math.sqrt(sum(v * v for v in freq1.values()))
    norm2 = math.sqrt(sum(v * v for v in freq2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot / (norm1 * norm2))


def _compute_text_similarities(
    target_text: str, candidate_texts: list[str]
) -> list[float]:
    """Compute cosine similarity of target text against all candidate texts."""
    if not candidate_texts:
        return []

    if SKLEARN_AVAILABLE:
        corpus = [target_text] + candidate_texts
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 1),
            min_df=1
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)
        sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        return [float(s) for s in sims]
    else:
        return [_simple_cosine_similarity(target_text, c) for c in candidate_texts]


# ────────────────────────────────────────────────────────────
# Main Handoff Function: find_similar_complaints
# ────────────────────────────────────────────────────────────

def find_similar_complaints(
    complaint_text: str,
    latitude: float | None,
    longitude: float | None,
    existing_complaints: list[dict[str, Any]],
    config: dict[str, Any] | None = None
) -> dict[str, Any]:
    """
    Detect if an incoming complaint is a duplicate or similar to an existing one.

    Parameters
    ----------
    complaint_text : str
        The citizen complaint text.
    latitude : float | None
        GPS latitude of the report if provided.
    longitude : float | None
        GPS longitude of the report if provided.
    existing_complaints : list[dict]
        List of historical or active complaints to compare against.
        Supports keys: 'id'/'complaint_id', 'text'/'description',
        'latitude'/'lat', 'longitude'/'lng'/'lon', 'duplicate_cluster_id'.
    config : dict | None
        Optional overrides for thresholds.

    Returns
    -------
    dict
        {
            "is_duplicate": bool,
            "duplicate_cluster_id": str | None,
            "similarity": float,              # 0.0 to 1.0 (highest match)
            "matched_complaint_ids": list[str] # ids of matched complaints
        }
    """
    cfg = DUPLICATE_CONFIG.copy()
    if config:
        cfg.update(config)

    empty_response = {
        "is_duplicate": False,
        "duplicate_cluster_id": None,
        "similarity": 0.0,
        "matched_complaint_ids": [],
    }

    if not complaint_text or not existing_complaints:
        return empty_response

    candidate_texts: list[str] = []
    normalized_candidates: list[dict[str, Any]] = []

    for c in existing_complaints:
        c_id = str(c.get("id") or c.get("complaint_id") or "")
        c_text = str(c.get("complaint_text") or c.get("text") or c.get("description") or "")
        c_lat = c.get("latitude") if c.get("latitude") is not None else c.get("lat")
        c_lon = c.get("longitude") if c.get("longitude") is not None else c.get("lng", c.get("lon"))
        c_cluster = c.get("duplicate_cluster_id") or c.get("cluster_id")

        if not c_text:
            continue

        candidate_texts.append(c_text)
        normalized_candidates.append({
            "id": c_id,
            "text": c_text,
            "latitude": float(c_lat) if c_lat is not None else None,
            "longitude": float(c_lon) if c_lon is not None else None,
            "duplicate_cluster_id": c_cluster,
        })

    if not candidate_texts:
        return empty_response

    # Calculate text similarities
    text_sims = _compute_text_similarities(complaint_text, candidate_texts)

    matched_ids: list[str] = []
    best_similarity = 0.0
    best_cluster_id: Optional[str] = None
    best_matched_id: Optional[str] = None

    for idx, cand in enumerate(normalized_candidates):
        sim = text_sims[idx]
        has_coords = (
            latitude is not None
            and longitude is not None
            and cand["latitude"] is not None
            and cand["longitude"] is not None
        )

        is_match = False

        if has_coords:
            dist = haversine_distance_meters(
                latitude, longitude, cand["latitude"], cand["longitude"]
            )
            # Match if close + reasonable text similarity
            if dist <= cfg["proximity_distance_meters"] and sim >= cfg["text_similarity_with_coords"]:
                is_match = True
            # Or if text similarity is very high even within broader spatial radius
            elif dist <= cfg["max_spatial_radius_meters"] and sim >= cfg["text_similarity_standalone"]:
                is_match = True
        else:
            # Fallback without coordinates: purely text similarity
            if sim >= cfg["text_similarity_standalone"]:
                is_match = True

        if is_match:
            matched_ids.append(cand["id"])
            if sim > best_similarity:
                best_similarity = sim
                best_cluster_id = cand["duplicate_cluster_id"]
                best_matched_id = cand["id"]

    if matched_ids:
        # Determine cluster ID: reuse existing cluster, or create a new cluster ID
        if not best_cluster_id:
            best_cluster_id = f"CL-{best_matched_id or '001'}"

        return {
            "is_duplicate": True,
            "duplicate_cluster_id": best_cluster_id,
            "similarity": round(best_similarity, 3),
            "matched_complaint_ids": matched_ids,
        }

    # If no duplicate found, return highest observed similarity for visibility
    max_sim = max(text_sims) if text_sims else 0.0
    return {
        "is_duplicate": False,
        "duplicate_cluster_id": None,
        "similarity": round(max_sim, 3),
        "matched_complaint_ids": [],
    }
