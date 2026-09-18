from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Complaint
from schemas import ComplaintCreate, ComplaintOut, ComplaintUpdate, ReassignRequest
from services import classifier, entities, priority, duplicates

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

# Below this department-confidence, we don't trust the auto-routing.
CONFIDENCE_THRESHOLD = 0.60


@router.post("", response_model=ComplaintOut)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Full submission flow:
    clean text -> ML prediction -> entity extraction -> priority scoring
    -> duplicate detection -> save -> return complete result.
    """
    text = payload.complaint_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="complaint_text cannot be empty")

    # 1. ML prediction (Member 1's contract)
    prediction = classifier.predict(text)

    # 2. Entity extraction (Member 4's contract)
    extracted = entities.extract(text, payload.locality)

    # 3. Priority scoring (Member 4's contract)
    priority_result = priority.score(
        department=prediction["department"],
        issue_type=prediction["issue_type"],
        duration_text=extracted["duration_text"],
        text=text,
    )

    # 4. Duplicate detection against existing complaints in the same
    #    department (kept simple/in-memory-per-request for the hackathon;
    #    fine at demo-day data volumes).
    existing = [
        {
            "id": c.id,
            "complaint_text": c.complaint_text,
            "department": c.department,
            "locality": c.locality,
            "duplicate_cluster_id": c.duplicate_cluster_id,
        }
        for c in db.query(Complaint).filter(Complaint.department == prediction["department"]).all()
    ]
    cluster_id = duplicates.find_duplicate_cluster(
        new_text=text,
        new_department=prediction["department"],
        new_locality=extracted["locality"],
        existing=existing,
    )

    # Confidence rule: never silently force a low-confidence prediction.
    status = "Manual Review" if prediction["department_confidence"] < CONFIDENCE_THRESHOLD else "Pending"

    complaint = Complaint(
        complaint_text=text,
        department=prediction["department"],
        issue_type=prediction["issue_type"],
        department_confidence=prediction["department_confidence"],
        issue_confidence=prediction["issue_confidence"],
        priority_score=priority_result["priority_score"],
        priority_level=priority_result["priority_level"],
        locality=extracted["locality"],
        duration_text=extracted["duration_text"],
        latitude=payload.latitude,
        longitude=payload.longitude,
        duplicate_cluster_id=cluster_id,
        status=status,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("", response_model=list[ComplaintOut])
def list_complaints(
    department: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Complaint)
    if department:
        query = query.filter(Complaint.department == department)
    if status:
        query = query.filter(Complaint.status == status)
    return query.order_by(Complaint.created_at.desc()).all()


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.patch("/{complaint_id}", response_model=ComplaintOut)
def update_complaint(complaint_id: str, payload: ComplaintUpdate, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(complaint, field, value)

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/reassign", response_model=ComplaintOut)
def reassign_complaint(complaint_id: str, payload: ReassignRequest, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.department = payload.department
    complaint.status = "Pending"  # manual reassignment clears Manual Review
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/{complaint_id}/similar", response_model=list[ComplaintOut])
def similar_complaints(complaint_id: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if not complaint.duplicate_cluster_id:
        return []

    return (
        db.query(Complaint)
        .filter(
            Complaint.duplicate_cluster_id == complaint.duplicate_cluster_id,
            Complaint.id != complaint.id,
        )
        .all()
    )
