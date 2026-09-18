"""
CivicFlow — Text Preprocessing Module
=====================================
Member 1 | Prepares complaint text for both training and inference.
Guarantees consistent text cleaning between training and inference phases.
"""

import re


def clean_text(text: str) -> str:
    """
    Clean and normalize complaint text:
    - Lowercase
    - Replace URLs and email addresses
    - Normalize whitespace and special characters
    - Preserve alphanumeric terms, locations, and units
    """
    if not text or not isinstance(text, str):
        return ""

    text = text.lower()
    # Strip URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    # Strip emails
    text = re.sub(r"\S+@\S+", "", text)
    # Replace non-alphanumeric punctuation with spaces (keep hyphens in compound words)
    text = re.sub(r"[^\w\s\-]", " ", text)
    # Strip standalone numbers and excessive hyphens
    text = re.sub(r"-+", "-", text)
    # Normalize multiple whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text
