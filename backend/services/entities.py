"""
Plug point for Member 4's entity extraction (locality + duration).

CONTRACT (do not change):
    extract(text: str, provided_locality: str | None) -> {
        "locality": str | None,
        "duration_text": str | None,
    }

Placeholder implementation below does simple regex/keyword extraction so the
pipeline is fully runnable now. Swap the body for Member 4's real extractor
without changing the function signature or output keys.
"""

import re

_DURATION_PATTERN = re.compile(
    r"\b\d+\s*(day|days|week|weeks|month|months|hour|hours)\b", re.IGNORECASE
)

# Small placeholder gazetteer — replace with Member 4's real locality list.
_KNOWN_LOCALITIES = [
    "Krishna Nagar", "Sadar Bazaar", "Sanjay Place", "Shastripuram",
    "Dayalbagh", "Kamla Nagar", "Rakabganj", "Tajganj",
]


def extract(text: str, provided_locality: str | None = None) -> dict:
    locality = provided_locality
    if not locality:
        for name in _KNOWN_LOCALITIES:
            if name.lower() in text.lower():
                locality = name
                break

    duration_match = _DURATION_PATTERN.search(text)
    duration_text = duration_match.group(0) if duration_match else None

    return {"locality": locality, "duration_text": duration_text}
