"""
Pydantic schemas. ComplaintOut matches the canonical schema exactly —
do not rename fields here, frontend/analytics/Mapbox all depend on them.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ComplaintCreate(BaseModel):
    complaint_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    # Locality can be sent by the client (e.g. picked on a map) but will be
    # overwritten by Member 4's entity extraction if that returns a value.
    locality: Optional[str] = None


class ComplaintOut(BaseModel):
    id: str
    complaint_text: str
    department: Optional[str] = None
    issue_type: Optional[str] = None
    department_confidence: Optional[float] = None
    issue_confidence: Optional[float] = None
    priority_score: Optional[int] = None
    priority_level: Optional[str] = None
    locality: Optional[str] = None
    duration_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    duplicate_cluster_id: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintUpdate(BaseModel):
    department: Optional[str] = None
    issue_type: Optional[str] = None
    priority_score: Optional[int] = None
    priority_level: Optional[str] = None
    locality: Optional[str] = None
    status: Optional[str] = None


class ReassignRequest(BaseModel):
    department: str
    reason: Optional[str] = None


class DashboardStats(BaseModel):
    total_complaints: int
    pending: int
    manual_review: int
    resolved: int
    by_department: dict
    by_priority_level: dict
