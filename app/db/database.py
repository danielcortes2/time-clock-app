import logging
from functools import lru_cache
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.db_settings import DbSettings

logger = logging.getLogger(__name__)

@lru_cache
def get_db_settings() -> DbSettings:
    return DbSettings()

db_settings = get_db_settings()

engine = create_engine(db_settings.database_url, echo=False) # Deja echo=False en producción

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.exception("Error during the database transaction, performing rollback.")
        raise
    finally:
        db.close()        
        