import pytest
import os
from unittest.mock import patch
from app.config.db_settings import DbSettings

MYSQL_ENV_CLEAR = {k: v for k, v in os.environ.items() if not k.startswith('MYSQL_') and k != 'DATABASE_ENGINE'}

class TestDbSettings:
    @patch.dict(os.environ, {}, clear=True)
    def test_database_url_sqlite(self):
        settings = DbSettings(database_engine="sqlite", database_name="test.db")
        assert settings.database_url == "sqlite:///test.db"

    @patch.dict(os.environ, {}, clear=True)
    def test_database_url_postgresql(self):
        settings = DbSettings(
            database_engine="postgresql",
            database_host="localhost",
            database_port=5432,
            database_name="testdb",
            database_username="user",
            database_password="pass"
        )
        expected = "postgresql://user:pass@localhost:5432/testdb"
        assert settings.database_url == expected

    @patch.dict(os.environ, {}, clear=True)
    def test_default_values(self):
        settings = DbSettings()
        assert settings.database_engine == "mysql"
        assert settings.database_name == ""
        assert settings.database_port == 3306

    @patch.dict(os.environ, {}, clear=True)
    def test_hash(self):
        settings1 = DbSettings(database_host="host1", database_port=5432)
        settings2 = DbSettings(database_host="host1", database_port=5432)
        settings3 = DbSettings(database_host="host2", database_port=5432)
        assert hash(settings1) == hash(settings2)
        assert hash(settings1) != hash(settings3)