"""
CivicFlow — Pydantic Validation & Serialization Schemas
=======================================================
"""

from typing import Optional
from pydantic import BaseModel, Field


class ComplaintCreate(BaseModel):
    complaint_text: str = Field(..., min_length=5, description="Citizen complaint description")
    latitude: Optional[float] = Field(None, description="GPS Latitude")
    longitude: Optional[float] = Field(None, description="GPS Longitude")


class ComplaintUpdate(BaseModel):
    status: Optional[str] = Field(None, description="New status: Pending, In Progress, Resolved, Manual Review")


class ComplaintReassign(BaseModel):
    department: str = Field(..., description="Target department to reassign to")
    reason: Optional[str] = Field(None, description="Reason for reassignment")


class ComplaintResponse(BaseModel):
    id: str
    complaint_text: str
    department: str
    issue_type: str
    department_confidence: float
    issue_confidence: float
    priority_score: int
    priority_level: str
    priority_reasons: list[str] = []
    locality: Optional[str] = None
    duration_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    duplicate_cluster_id: Optional[str] = None
    status: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintListResponse(BaseModel):
    total: int
    items: list[ComplaintResponse]


class QueueResponse(BaseModel):
    department: str
    pending_count: int
    high_priority_count: int
    items: list[ComplaintResponse]


class DashboardStatsResponse(BaseModel):
    total_complaints: int
    status_counts: dict[str, int]
    priority_distribution: dict[str, int]
    department_breakdown: dict[str, int]
    duplicate_clusters_count: int
