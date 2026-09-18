from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Complaint
from schemas import QueueOut

router = APIRouter(prefix="/api/queues", tags=["queues"])


@router.get("/{department}", response_model=QueueOut)
def get_department_queue(department: str, db: Session = Depends(get_db)):
    """Complaints for one department's officer view, highest priority first.
    Per contract: only non-resolved complaints are included."""
    items = (
        db.query(Complaint)
        .filter(Complaint.department == department, Complaint.status != "Resolved")
        .order_by(Complaint.priority_score.desc().nullslast(), Complaint.created_at.desc())
        .all()
    )
    return QueueOut(
        department=department,
        pending_count=len(items),
        high_priority_count=sum(1 for c in items if c.priority_level == "High"),
        items=items,
    )
