from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.db.database import get_db
from app.models.dto import User, Schedule
from app.auth import get_current_user

router = APIRouter()

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


class ScheduleEntry(BaseModel):
    day_of_week: int   # 0=Monday ... 6=Sunday
    start_time: str    # "HH:MM"
    end_time: str      # "HH:MM"
    is_active: bool = True


class ScheduleSetRequest(BaseModel):
    entries: List[ScheduleEntry]


def schedule_to_dict(s: Schedule):
    return {
        "id": s.id,
        "user_id": s.user_id,
        "day_of_week": s.day_of_week,
        "day_name": DAYS[s.day_of_week],
        "start_time": s.start_time,
        "end_time": s.end_time,
        "is_active": s.is_active,
    }


@router.get("/schedules/{user_id}")
async def get_schedule(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Admin can see anyone; regular user can only see their own
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    schedules = db.query(Schedule).filter(Schedule.user_id == user_id).order_by(Schedule.day_of_week).all()
    return [schedule_to_dict(s) for s in schedules]


@router.put("/schedules/{user_id}")
async def set_schedule(
    user_id: int,
    request: ScheduleSetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can set schedules")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.is_superuser:
        raise HTTPException(status_code=400, detail="Cannot assign schedules to admin users")

    # Validate times
    for entry in request.entries:
        if entry.day_of_week < 0 or entry.day_of_week > 6:
            raise HTTPException(status_code=400, detail=f"Invalid day_of_week: {entry.day_of_week}")
        try:
            h_start, m_start = map(int, entry.start_time.split(":"))
            h_end, m_end = map(int, entry.end_time.split(":"))
            assert 0 <= h_start <= 23 and 0 <= m_start <= 59
            assert 0 <= h_end <= 23 and 0 <= m_end <= 59
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid time format for day {entry.day_of_week}")

    # Replace all existing schedule entries for this user
    db.query(Schedule).filter(Schedule.user_id == user_id).delete()
    for entry in request.entries:
        s = Schedule(
            user_id=user_id,
            day_of_week=entry.day_of_week,
            start_time=entry.start_time,
            end_time=entry.end_time,
            is_active=entry.is_active,
        )
        db.add(s)
    db.commit()

    schedules = db.query(Schedule).filter(Schedule.user_id == user_id).order_by(Schedule.day_of_week).all()
    return [schedule_to_dict(s) for s in schedules]


@router.get("/my-schedule")
async def get_my_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    schedules = db.query(Schedule).filter(Schedule.user_id == current_user.id).order_by(Schedule.day_of_week).all()
    return [schedule_to_dict(s) for s in schedules]
