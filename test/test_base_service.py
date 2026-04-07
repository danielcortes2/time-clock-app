import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from app.services.base_service import BaseService

class TestBaseService:
    def test_init(self, mocker):
        mock_db = mocker.MagicMock(spec=Session)
        service = BaseService(mock_db)
        assert service._db == mock_db

    def test_get_session(self, mocker):
        mock_db = mocker.MagicMock(spec=Session)
        service = BaseService(mock_db)
        with service.get_session() as session:
            assert session == mock_db