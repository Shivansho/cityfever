"""
preprocess.py
Member 1 — ML Classification

Shared text-cleaning logic. This module is imported by BOTH train.py and
predict.py so that preprocessing is guaranteed identical at train time and
inference time (per PRD requirement: "Keep preprocessing identical during
training and inference").

Keep this file dependency-light (stdlib + re only) so it never breaks the
backend's runtime environment.
"""

import re
import string

# Common English stopwords, kept minimal on purpose — complaint text is short
# and domain words (e.g. "near", "since", "for") can carry signal for the
# entity-extraction module downstream (Member 4), so we do NOT strip
# everything aggressively here. This function only prepares text for the
# TF-IDF vectorizer used by the classifiers.
_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "this", "that", "these", "those", "it", "its", "of", "to", "and", "or",
    "in", "on", "at", "as", "with", "by", "from", "there", "here",
}

_PUNCT_TABLE = str.maketrans("", "", string.punctuation)


def clean_text(text: str) -> str:
    """
    Normalize a raw complaint string before vectorization.

    Steps:
      1. Lowercase
      2. Strip URLs / extra whitespace
      3. Remove punctuation
      4. Collapse repeated whitespace
      5. Drop a small stopword list

    This function must be called on every string BEFORE it is passed to a
    fitted TfidfVectorizer, both during training and during prediction.
    """
    if text is None:
        return ""

    text = str(text).strip().lower()

    # strip URLs
    text = re.sub(r"http\S+|www\.\S+", " ", text)

    # strip digits-only noise like standalone numbers glued to punctuation
    # (kept conservative — durations like "3 days" still contain useful
    # signal for the classifier, so digits themselves are NOT removed)
    text = text.translate(_PUNCT_TABLE)

    tokens = text.split()
    tokens = [t for t in tokens if t not in _STOPWORDS]

    cleaned = " ".join(tokens)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned


def clean_batch(texts):
    """Apply clean_text to an iterable of strings. Returns a list."""
    return [clean_text(t) for t in texts]