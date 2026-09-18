"""
CivicFlow — Department Queue Endpoints
======================================
Provides prioritized triage queues for municipal officers by department.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import ComplaintModel
from ..schemas import QueueResponse

router = APIRouter(prefix="/queues", tags=["Department Queues"])


@router.get("/{department}", response_model=QueueResponse)
def get_department_queue(department: str, db: Session = Depends(get_db)):
    """
    Get all active complaints for a given department, ordered by priority score descending.
    """
    # Active items are those not yet Resolved
    active_query = db.query(ComplaintModel).filter(
        ComplaintModel.department.ilike(department),
        ComplaintModel.status != "Resolved"
    )

    pending_count = active_query.count()
    high_priority_count = active_query.filter(ComplaintModel.priority_level == "High").count()

    items = active_query.order_by(
        desc(ComplaintModel.priority_score),
        desc(ComplaintModel.created_at)
    ).all()

    return {
        "department": department,
        "pending_count": pending_count,
        "high_priority_count": high_priority_count,
        "items": [r.to_dict() for r in items]
    }
