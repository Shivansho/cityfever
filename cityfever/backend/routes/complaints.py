"""
CivicFlow — Complaints Endpoints
================================
Implements the canonical complaint pipeline:
clean text -> ML classification -> entity extraction -> priority scoring -> duplicate check -> save
"""

import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import ComplaintModel
from ..schemas import ComplaintCreate, ComplaintUpdate, ComplaintReassign, ComplaintResponse, ComplaintListResponse
from ..services import predict_complaint, calculate_priority, extract_entities, find_similar_complaints

router = APIRouter(prefix="/complaints", tags=["Complaints"])

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def submit_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Submit a citizen complaint and run it through the full CivicFlow operational pipeline.
    """
    clean_text = payload.complaint_text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty")

    # 1. ML Classification (Member 1)
    ml_result = predict_complaint(clean_text)
    department = ml_result["department"]
    issue_type = ml_result["issue_type"]
    dep_conf = ml_result["department_confidence"]
    issue_conf = ml_result["issue_confidence"]

    # 2. Entity Extraction (Member 4)
    entities = extract_entities(clean_text)
    locality = entities.get("locality")
    duration_text = entities.get("duration_text")

    # 3. Priority Scoring (Member 4)
    priority_result = calculate_priority(
        text=clean_text,
        issue_type=issue_type,
        duration_text=duration_text,
        locality=locality
    )
    priority_score = priority_result["priority_score"]
    priority_level = priority_result["priority_level"]
    priority_reasons = priority_result["priority_reasons"]

    # 4. Duplicate Detection (Member 4)
    # Query last 100 complaints for comparison
    recent_records = db.query(ComplaintModel).order_by(desc(ComplaintModel.created_at)).limit(100).all()
    existing_list = [r.to_dict() for r in recent_records]

    dup_result = find_similar_complaints(
        complaint_text=clean_text,
        latitude=payload.latitude,
        longitude=payload.longitude,
        existing_complaints=existing_list
    )
    duplicate_cluster_id = dup_result["duplicate_cluster_id"] if dup_result["is_duplicate"] else None

    # 5. Confidence check rule: if department confidence < 0.60 -> Manual Review
    initial_status = "Manual Review" if dep_conf < CONFIDENCE_THRESHOLD else "Pending"

    # 6. Generate ID and save
    complaint_count = db.query(ComplaintModel).count()
    new_id = f"C{1000 + complaint_count + 1}"

    record = ComplaintModel(
        id=new_id,
        complaint_text=clean_text,
        department=department,
        issue_type=issue_type,
        department_confidence=dep_conf,
        issue_confidence=issue_conf,
        priority_score=priority_score,
        priority_level=priority_level,
        locality=locality,
        duration_text=duration_text,
        latitude=payload.latitude,
        longitude=payload.longitude,
        duplicate_cluster_id=duplicate_cluster_id,
        status=initial_status,
    )
    record.priority_reasons = priority_reasons

    db.add(record)
    db.commit()
    db.refresh(record)

    return record.to_dict()


@router.get("", response_model=ComplaintListResponse)
def list_complaints(
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority_level: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(ComplaintModel)
    if department:
        query = query.filter(ComplaintModel.department == department)
    if status:
        query = query.filter(ComplaintModel.status == status)
    if priority_level:
        query = query.filter(ComplaintModel.priority_level == priority_level)

    total = query.count()
    items = query.order_by(desc(ComplaintModel.priority_score), desc(ComplaintModel.created_at)).offset(offset).limit(limit).all()

    return {
        "total": total,
        "items": [r.to_dict() for r in items]
    }


@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint(id: str, db: Session = Depends(get_db)):
    record = db.query(ComplaintModel).filter(ComplaintModel.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Complaint with id '{id}' not found")
    return record.to_dict()


@router.patch("/{id}", response_model=ComplaintResponse)
def update_complaint(id: str, payload: ComplaintUpdate, db: Session = Depends(get_db)):
    record = db.query(ComplaintModel).filter(ComplaintModel.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Complaint with id '{id}' not found")

    if payload.status:
        record.status = payload.status
        db.commit()
        db.refresh(record)

    return record.to_dict()


@router.post("/{id}/reassign", response_model=ComplaintResponse)
def reassign_complaint(id: str, payload: ComplaintReassign, db: Session = Depends(get_db)):
    record = db.query(ComplaintModel).filter(ComplaintModel.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Complaint with id '{id}' not found")

    record.department = payload.department
    if record.status == "Manual Review":
        record.status = "Pending"

    # Add reassignment reason to priority_reasons
    reasons = record.priority_reasons
    if payload.reason:
        reasons.append(f"Reassigned to {payload.department}: {payload.reason}")
    else:
        reasons.append(f"Manually reassigned to {payload.department}")
    record.priority_reasons = reasons

    db.commit()
    db.refresh(record)
    return record.to_dict()


@router.get("/{id}/similar")
def get_similar_complaints(id: str, db: Session = Depends(get_db)):
    record = db.query(ComplaintModel).filter(ComplaintModel.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Complaint with id '{id}' not found")

    matched: list[dict] = []
    if record.duplicate_cluster_id:
        cluster_items = db.query(ComplaintModel).filter(
            ComplaintModel.duplicate_cluster_id == record.duplicate_cluster_id,
            ComplaintModel.id != id
        ).all()
        matched = [c.to_dict() for c in cluster_items]

    return {
        "target_id": id,
        "cluster_id": record.duplicate_cluster_id,
        "matched_complaints": matched
    }
