from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Complaint
from schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()

    by_department = Counter(c.department for c in complaints if c.department)
    by_priority_level = Counter(c.priority_level for c in complaints if c.priority_level)

    return DashboardStats(
        total_complaints=len(complaints),
        pending=sum(1 for c in complaints if c.status == "Pending"),
        manual_review=sum(1 for c in complaints if c.status == "Manual Review"),
        resolved=sum(1 for c in complaints if c.status == "Resolved"),
        by_department=dict(by_department),
        by_priority_level=dict(by_priority_level),
    )
