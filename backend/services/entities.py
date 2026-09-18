"""
CivicFlow — Entity Extraction Engine
=====================================
Member 4 | Rule-based entity & metadata extraction for civic complaints.

Extracts operational entities without requiring heavy transformer models:
- Locality / Landmark / Location hint
- Duration / Elapsed time
- Normalized structured outputs for downstream priority and clustering

Function contract:
    extract_entities(text: str) -> dict
"""

from __future__ import annotations
import re
from typing import Optional, Any


# ────────────────────────────────────────────────────────────
# Pre-compiled Regex Patterns for Duration & Locality
# ────────────────────────────────────────────────────────────

# Duration patterns (e.g. "for 5 days", "since Monday", "past 3 weeks", "2 hours ago")
DURATION_PATTERNS = [
    # "for 5 days", "for past 2 weeks", "for about 3 hours"
    re.compile(r"\bfor\s+(?:the\s+)?(?:past\s+|last\s+|about\s+)?(\d+\s*(?:hours?|hrs?|days?|weeks?|months?|years?))\b", re.IGNORECASE),
    # "since Monday", "since yesterday", "since 15th Aug", "since last week"
    re.compile(r"\bsince\s+(yesterday|last\s+\w+|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w+)\b", re.IGNORECASE),
    # "past 3 days", "last 2 weeks"
    re.compile(r"\b(?:past|last)\s+(\d+\s*(?:hours?|hrs?|days?|weeks?|months?))\b", re.IGNORECASE),
    # "3 days ago", "48 hours ago"
    re.compile(r"\b(\d+\s*(?:hours?|hrs?|days?|weeks?|months?))\s+ago\b", re.IGNORECASE),
    # "already 4 days", "from 3 days"
    re.compile(r"\b(?:already|from)\s+(\d+\s*(?:hours?|hrs?|days?|weeks?|months?))\b", re.IGNORECASE),
]

# Specific location hint prefixes (landmarks, gates, pillars, stops)
LANDMARK_HINT_PATTERNS = [
    re.compile(r"\b(?:near|opp(?:osite)?|behind|beside|adjacent to|next to|in front of|across)\s+([A-Z0-9][A-Za-z0-9\s\.\-]{2,30}?)(?=[\.,;\n]|\b(?:for|since|due to|and|with|please|is|are|has|have)\b|$)", re.IGNORECASE),
    re.compile(r"\b(Gate\s+(?:No\.?\s*)?[A-Za-z0-9\-]+)\b", re.IGNORECASE),
    re.compile(r"\b(Pillar\s+(?:No\.?\s*)?[A-Za-z0-9\-]+)\b", re.IGNORECASE),
    re.compile(r"\b(Metro\s+Station(?:\s+[A-Za-z0-9\-]+)?)\b", re.IGNORECASE),
    re.compile(r"\b(Bus\s+(?:Stop|Stand)(?:\s+[A-Za-z0-9\-]+)?)\b", re.IGNORECASE),
]

# Locality suffixes common across cities (e.g. Indian & general urban schemes)
LOCALITY_SUFFIX_PATTERN = re.compile(
    r"\b((?:[A-Z][a-zA-Z0-9\-]+\s+){1,2}(?:Nagar|Colony|Enclave|Vihar|Puram|Ganj|Bagh|Bazaar|Road|Street|Marg|Layout|Extension|Sector\s*\d+|Ward\s*\d+|Phase\s*\d+|Block\s*[A-Z0-9]+|Cross|Main|Mohalla|Gali))\b",
    re.IGNORECASE
)

# "in <Locality>", "at <Locality>"
IN_AT_LOCALITY_PATTERN = re.compile(
    r"\b(?:in|at)\s+([A-Z][a-zA-Z0-9\-]+(?:\s+[A-Z][a-zA-Z0-9\-]+){0,2})(?=[\.,;\n]|\b(?:for|since|due to|and|with|please|near|is|are|has|have)\b|$)"
)

# Words to ignore/filter if caught by locality regex
STOPWORDS_LOCATION = {
    "the", "a", "an", "this", "that", "our", "my", "your", "area", "street", "road",
    "morning", "evening", "night", "today", "yesterday", "urgent", "trouble", "problem",
    "complaint", "issue", "city", "town", "society", "colony", "ward", "sector"
}


def _clean_extracted_text(text: str) -> str:
    """Strip punctuation and extraneous whitespace from extracted text."""
    cleaned = re.sub(r"^[\s,.;:\-'\"]+|[\s,.;:\-'\"]+$", "", text).strip()
    return re.sub(r"\s+", " ", cleaned)


def extract_duration(text: str) -> Optional[str]:
    """
    Extract duration string from text (e.g. 'for 5 days' -> '5 days' or 'since Monday').
    """
    if not text:
        return None

    # Check full patterns with context first
    for pattern in DURATION_PATTERNS:
        match = pattern.search(text)
        if match:
            # If pattern captured 'since Monday', preserve 'since Monday'
            matched_str = match.group(0).strip()
            # Clean common trailing or leading connectors
            matched_str = _clean_extracted_text(matched_str)
            return matched_str

    return None


def extract_locality(text: str) -> tuple[Optional[str], Optional[str]]:
    """
    Extract locality and location hint from text.
    
    Returns
    -------
    tuple (locality, location_hint)
    """
    if not text:
        return None, None

    location_hint = None
    locality = None

    # 1. Look for specific landmark / location hints (e.g. "near Gate 2", "Pillar 123", "opp Metro Station")
    for pattern in LANDMARK_HINT_PATTERNS:
        match = pattern.search(text)
        if match:
            hint_val = _clean_extracted_text(match.group(1) if match.lastindex else match.group(0))
            if hint_val and hint_val.lower() not in STOPWORDS_LOCATION and len(hint_val) > 2:
                location_hint = hint_val
                break

    # 2. Check "in <Locality>" or "at <Locality>" first
    in_match = IN_AT_LOCALITY_PATTERN.search(text)
    if in_match:
        cand = _clean_extracted_text(in_match.group(1))
        if cand and cand.lower() not in STOPWORDS_LOCATION and len(cand) > 2 and len(cand.split()) <= 4:
            locality = cand

    # 3. Look for locality with well-known suffixes (e.g. "Krishna Nagar", "Sector 14", "MG Road")
    if not locality:
        suffix_match = LOCALITY_SUFFIX_PATTERN.search(text)
        if suffix_match:
            loc_val = _clean_extracted_text(suffix_match.group(1))
            loc_val = re.sub(r"^(?:in|at|near|opp|from|behind|beside)\s+", "", loc_val, flags=re.IGNORECASE).strip()
            if loc_val and loc_val.lower() not in STOPWORDS_LOCATION:
                locality = loc_val

    # 4. If locality is still None but we have location hint, we can share context
    if not locality and location_hint:
        locality = location_hint

    # Ensure any leading prepositions are stripped from locality
    if locality:
        locality = re.sub(r"^(?:in|at|near|opp|from|behind|beside)\s+", "", locality, flags=re.IGNORECASE).strip()

    return locality, location_hint


def extract_entities(text: str) -> dict[str, Any]:
    """
    Extract civic entities from complaint text.
    
    Parameters
    ----------
    text : str
        The raw complaint text from citizen.

    Returns
    -------
    dict
        {
            "locality": str | None,
            "location_hint": str | None,
            "duration_text": str | None,
            "entities": {
                "locality": str | None,
                "location_hint": str | None,
                "duration_text": str | None
            }
        }
    """
    if not text or not isinstance(text, str):
        return {
            "locality": None,
            "location_hint": None,
            "duration_text": None,
            "entities": {
                "locality": None,
                "location_hint": None,
                "duration_text": None,
            },
        }

    duration = extract_duration(text)
    locality, location_hint = extract_locality(text)

    return {
        "locality": locality,
        "location_hint": location_hint,
        "duration_text": duration,
        "entities": {
            "locality": locality,
            "location_hint": location_hint,
            "duration_text": duration,
        },
    }
