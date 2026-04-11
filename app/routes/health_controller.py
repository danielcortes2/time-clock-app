from fastapi import APIRouter
from pydantic import BaseModel
from app.services.health_service import HealthService

router = APIRouter()

class HealthCheckResponse(BaseModel):
    status: str

@router.get("/health")
def health_check():
    service_response = HealthService.health_check()
    return HealthCheckResponse(**service_response)

@router.get("/health/db")
def db_health_check():
    try:
        from app.db.database import get_engine
        engine = get_engine()
        with engine.connect() as conn:
            conn.execute(__import__('sqlalchemy').text("SELECT 1"))
        return {"status": "connected", "db_url": str(engine.url).replace(str(engine.url.password or ""), "***")}
    except Exception as e:
        return {"status": "error", "detail": str(e)}