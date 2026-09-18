from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Complaint
from schemas import ComplaintOut

router = APIRouter(prefix="/api/queues", tags=["queues"])


@router.get("/{department}", response_model=list[ComplaintOut])
def get_department_queue(department: str, db: Session = Depends(get_db)):
    """Complaints for one department's officer view, highest priority first."""
    return (
        db.query(Complaint)
        .filter(Complaint.department == department)
        .order_by(Complaint.priority_score.desc().nullslast(), Complaint.created_at.desc())
        .all()
    )
