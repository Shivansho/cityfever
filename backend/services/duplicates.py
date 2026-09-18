"""
Plug point for Member 4's duplicate/similar-complaint detection.

CONTRACT (do not change):
    find_duplicate_cluster(new_text: str, new_department: str,
                            new_locality: str | None,
                            existing: list[dict]) -> str | None
        existing: list of {"id": str, "complaint_text": str,
                            "department": str, "locality": str | None,
                            "duplicate_cluster_id": str | None}
        returns an existing duplicate_cluster_id to reuse, a *new* cluster id
        string if this complaint starts a new cluster with a prior one, or
        None if it's not a duplicate of anything.

Placeholder implementation: naive word-overlap similarity within the same
department+locality. Replace with Member 4's real similarity model
(e.g. TF-IDF cosine or embeddings) without changing the function signature.
"""

import uuid


def _word_overlap(a: str, b: str) -> float:
    words_a = set(a.lower().split())
    words_b = set(b.lower().split())
    if not words_a or not words_b:
        return 0.0
    return len(words_a & words_b) / len(words_a | words_b)


def find_duplicate_cluster(
    new_text: str,
    new_department: str,
    new_locality: str | None,
    existing: list[dict],
    threshold: float = 0.35,
) -> str | None:
    for complaint in existing:
        if complaint.get("department") != new_department:
            continue
        if new_locality and complaint.get("locality") not in (None, new_locality):
            continue
        similarity = _word_overlap(new_text, complaint.get("complaint_text", ""))
        if similarity >= threshold:
            return complaint.get("duplicate_cluster_id") or f"CL{uuid.uuid4().hex[:6]}"
    return None
