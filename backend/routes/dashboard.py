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

    status_counts = Counter(c.status for c in complaints if c.status)
    priority_distribution = Counter(c.priority_level for c in complaints if c.priority_level)
    department_breakdown = Counter(c.department for c in complaints if c.department)
    duplicate_clusters = {c.duplicate_cluster_id for c in complaints if c.duplicate_cluster_id}

    return DashboardStats(
        total_complaints=len(complaints),
        status_counts=dict(status_counts),
        priority_distribution=dict(priority_distribution),
        department_breakdown=dict(department_breakdown),
        duplicate_clusters_count=len(duplicate_clusters),
    )
