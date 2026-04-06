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