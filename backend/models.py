"""
SQLAlchemy models. The Complaint table mirrors the canonical complaint
schema field-for-field so routes/schemas never need to rename anything.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, DateTime

from database import Base


def generate_complaint_id() -> str:
    # Short, demo-friendly IDs like "C1024" instead of a raw UUID.
    return f"C{uuid.uuid4().int % 9000 + 1000}"


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=generate_complaint_id)
    complaint_text = Column(String, nullable=False)

    department = Column(String, nullable=True)
    issue_type = Column(String, nullable=True)
    department_confidence = Column(Float, nullable=True)
    issue_confidence = Column(Float, nullable=True)

    priority_score = Column(Integer, nullable=True)
    priority_level = Column(String, nullable=True)

    locality = Column(String, nullable=True)
    duration_text = Column(String, nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    duplicate_cluster_id = Column(String, nullable=True)

    status = Column(String, nullable=False, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
