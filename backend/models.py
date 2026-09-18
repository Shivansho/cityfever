"""
CivicFlow — SQLAlchemy ORM Models
==================================
Implements the canonical complaint schema agreed across all 6 members.
"""

from datetime import datetime, timezone
import json
from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from .database import Base


class ComplaintModel(Base):
    __tablename__ = "complaints"

    id = Column(String(32), primary_key=True, index=True)
    complaint_text = Column(Text, nullable=False)
    department = Column(String(64), nullable=False, index=True)
    issue_type = Column(String(64), nullable=False)
    department_confidence = Column(Float, nullable=False)
    issue_confidence = Column(Float, nullable=False)
    priority_score = Column(Integer, nullable=False, index=True)
    priority_level = Column(String(16), nullable=False, index=True)
    _priority_reasons = Column("priority_reasons", Text, default="[]")
    locality = Column(String(128), nullable=True, index=True)
    duration_text = Column(String(64), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    duplicate_cluster_id = Column(String(32), nullable=True, index=True)
    status = Column(String(32), default="Pending", index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def priority_reasons(self) -> list[str]:
        if not self._priority_reasons:
            return []
        try:
            return json.loads(self._priority_reasons)
        except Exception:
            return [self._priority_reasons]

    @priority_reasons.setter
    def priority_reasons(self, value: list[str]):
        self._priority_reasons = json.dumps(value or [])

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "complaint_text": self.complaint_text,
            "department": self.department,
            "issue_type": self.issue_type,
            "department_confidence": round(self.department_confidence, 2),
            "issue_confidence": round(self.issue_confidence, 2),
            "priority_score": self.priority_score,
            "priority_level": self.priority_level,
            "priority_reasons": self.priority_reasons,
            "locality": self.locality,
            "duration_text": self.duration_text,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "duplicate_cluster_id": self.duplicate_cluster_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
