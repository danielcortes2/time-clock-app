import pytest
from app.services.health_service import HealthService

class TestHealthService:
    def test_init(self):
        service = HealthService()
        assert service is not None

    def test_health_check(self):
        result = HealthService.health_check()
        assert result == {"status": "Working"}