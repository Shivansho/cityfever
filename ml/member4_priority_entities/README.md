# Member 4 — Priority Scoring & Entity Extraction Engine

## 📌 Role Overview
Member 4 is responsible for operational intelligence: extracting named civic entities (localities, landmarks, elapsed durations) and computing transparent, explainable priority scores ($0 - 100$) with categorical tiers (`High`, `Medium`, `Low`).

---

## 🎯 Target Responsibilities
- **Named Entity Extraction**:
  - Extract geographic localities, landmarks, road names, and colony identifiers (`locality`).
  - Extract elapsed time expressions (`duration_text`), normalizing keywords like "for 3 days", "since yesterday", "past 2 weeks".
- **Transparent Priority Scoring**:
  - Rule-based operational scoring based on issue severity weights, duration multipliers, public/sensitive location keywords, and vulnerability indicators.
  - Generates transparent, human-readable reasons explaining every score increment.

---

## 🔌 Integration Points
- **Backend service files**:
  - `backend/services/entities.py` (`extract_entities`)
  - `backend/services/priority.py` (`calculate_priority`, `PRIORITY_CONFIG`)
- **Main function contracts**:
  ```python
  def extract_entities(text: str) -> dict:
      return {
          "locality": str | None,
          "duration_text": str | None
      }

  def calculate_priority(
      text: str,
      issue_type: str | None = None,
      duration_text: str | None = None,
      locality: str | None = None
  ) -> dict:
      return {
          "priority_score": int,        # 0 - 100
          "priority_level": str,        # "High" | "Medium" | "Low"
          "priority_reasons": list[str] # Explainable justification pills
      }
  ```

---

## 🧪 Verification
Run Member 4 test suite:
```bash
python -m unittest tests/test_member4.py
```