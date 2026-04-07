import logging
from functools import lru_cache
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.db_settings import DbSettings

logger = logging.getLogger(__name__)

@lru_cache
def get_db_settings() -> DbSettings:
    return DbSettings()

Base = declarative_base()

_engine = None
_SessionLocal = None

def get_engine():
    global _engine
    if _engine is None:
        db_settings = get_db_settings()
        _engine = create_engine(db_settings.database_url, echo=False)
    return _engine

def get_session_local():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

def get_db():
    db = get_session_local()()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.exception("Error during the database transaction, performing rollback.")
        raise
    finally:
        db.close()
        db.close()        
        