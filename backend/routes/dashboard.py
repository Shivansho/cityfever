"""
CivicFlow — Operations Dashboard Endpoints
==========================================
Aggregated analytics and operational KPIs across all municipal complaints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import ComplaintModel
from ..schemas import DashboardStatsResponse

from ..services import cluster_spatial_incidents, detect_hotspots

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Compute real-time summary statistics for municipal operations.
    """
    total = db.query(ComplaintModel).count()

    # Status counts
    status_rows = db.query(ComplaintModel.status, func.count(ComplaintModel.id)).group_by(ComplaintModel.status).all()
    status_counts = {s: count for s, count in status_rows}
    # Ensure standard keys exist
    for key in ["Pending", "In Progress", "Resolved", "Manual Review"]:
        status_counts.setdefault(key, 0)

    # Priority distribution
    priority_rows = db.query(ComplaintModel.priority_level, func.count(ComplaintModel.id)).group_by(ComplaintModel.priority_level).all()
    priority_distribution = {p: count for p, count in priority_rows}
    for key in ["High", "Medium", "Low"]:
        priority_distribution.setdefault(key, 0)

    # Department breakdown
    dept_rows = db.query(ComplaintModel.department, func.count(ComplaintModel.id)).group_by(ComplaintModel.department).all()
    department_breakdown = {d: count for d, count in dept_rows}

    # Duplicate clusters count
    cluster_count = db.query(func.count(func.distinct(ComplaintModel.duplicate_cluster_id))).filter(
        ComplaintModel.duplicate_cluster_id.isnot(None)
    ).scalar() or 0

    return {
        "total_complaints": total,
        "status_counts": status_counts,
        "priority_distribution": priority_distribution,
        "department_breakdown": department_breakdown,
        "duplicate_clusters_count": cluster_count,
    }


@router.get("/clusters")
def get_incident_clusters(db: Session = Depends(get_db)):
    """
    Get spatial incident clusters computed across active/recent complaints (Member 3).
    """
    records = db.query(ComplaintModel).filter(
        ComplaintModel.latitude.isnot(None),
        ComplaintModel.longitude.isnot(None)
    ).all()
    complaints = [r.to_dict() for r in records]
    clusters = cluster_spatial_incidents(complaints)
    return {"total_clusters": len(clusters), "clusters": clusters}


@router.get("/hotspots")
def get_incident_hotspots(db: Session = Depends(get_db)):
    """
    Get high-density critical incident hotspots requiring operational response.
    """
    records = db.query(ComplaintModel).filter(
        ComplaintModel.latitude.isnot(None),
        ComplaintModel.longitude.isnot(None)
    ).all()
    complaints = [r.to_dict() for r in records]
    hotspots = detect_hotspots(complaints)
    return {"total_hotspots": len(hotspots), "hotspots": hotspots}

