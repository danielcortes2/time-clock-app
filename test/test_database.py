import pytest
from unittest.mock import patch, MagicMock
from app.db.database import get_db_settings, get_db, SessionLocal

class TestDatabase:
    @patch('app.db.database.DbSettings')
    def test_get_db_settings(self, mock_db_settings):
        # Clear the cache to ensure we get a fresh instance
        get_db_settings.cache_clear()
        mock_instance = MagicMock()
        mock_db_settings.return_value = mock_instance
        result = get_db_settings()
        assert result == mock_instance
        # Test caching
        result2 = get_db_settings()
        assert result2 == mock_instance
        mock_db_settings.assert_called_once()

    @patch('app.db.database.SessionLocal')
    def test_get_db(self, mock_session_local):
        mock_session = MagicMock()
        mock_session_local.return_value = mock_session
        gen = get_db()
        db = next(gen)
        assert db == mock_session
        # Test commit on success
        try:
            next(gen)
        except StopIteration:
            pass
        mock_session.commit.assert_called_once()
        mock_session.close.assert_called_once()

    @patch('app.db.database.SessionLocal')
    def test_get_db_rollback_on_error(self, mock_session_local):
        mock_session = MagicMock()
        mock_session_local.return_value = mock_session
        gen = get_db()
        db = next(gen)
        assert db == mock_session
        # Simulate exception
        with pytest.raises(ValueError):
            try:
                raise ValueError("test")
            except:
                gen.throw(ValueError("test"))
        mock_session.rollback.assert_called_once()
        mock_session.close.assert_called_once()