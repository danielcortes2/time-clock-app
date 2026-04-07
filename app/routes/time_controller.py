from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.dto import User, TimeEntry
from app.auth import get_current_user
import datetime

router = APIRouter()

def entry_to_dict(entry):
    return {
        "id": entry.id,
        "user_id": entry.user_id,
        "clock_in": entry.clock_in.isoformat() if entry.clock_in else None,
        "clock_out": entry.clock_out.isoformat() if entry.clock_out else None,
    }

@router.post("/clock-in")
async def clock_in(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(TimeEntry).filter(TimeEntry.user_id == current_user.id, TimeEntry.clock_out == None).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already clocked in")
    entry = TimeEntry(user_id=current_user.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"message": "Clocked in", "entry": entry_to_dict(entry)}

@router.post("/clock-out")
async def clock_out(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = db.query(TimeEntry).filter(TimeEntry.user_id == current_user.id, TimeEntry.clock_out == None).first()
    if not entry:
        raise HTTPException(status_code=400, detail="Not clocked in")
    entry.clock_out = datetime.datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return {"message": "Clocked out", "entry": entry_to_dict(entry)}

@router.get("/my-entries")
async def get_my_entries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = db.query(TimeEntry).filter(TimeEntry.user_id == current_user.id).order_by(TimeEntry.clock_in).all()
    return [entry_to_dict(e) for e in entries]

@router.get("/all-entries")
async def get_all_entries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    entries = db.query(TimeEntry).order_by(TimeEntry.clock_in).all()
    return [entry_to_dict(e) for e in entries]