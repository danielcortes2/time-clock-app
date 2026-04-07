from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.dto import User, TimeEntry, Schedule
from app.auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from pydantic import BaseModel
from datetime import timedelta

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    is_superuser: bool = False

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(request.password)
    user = User(email=request.email, hashed_password=hashed_password, full_name=request.full_name, is_superuser=request.is_superuser)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created"}

@router.post("/create-user")
async def create_user(request: RegisterRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    # Check if user exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(request.password)
    user = User(email=request.email, hashed_password=hashed_password, full_name=request.full_name, is_superuser=request.is_superuser)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "full_name": current_user.full_name, "is_superuser": current_user.is_superuser}

@router.get("/users")
async def get_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "is_superuser": u.is_superuser} for u in users]

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_superuser and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
    # Delete associated time entries and schedules
    db.query(TimeEntry).filter(TimeEntry.user_id == user_id).delete()
    db.query(Schedule).filter(Schedule.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}