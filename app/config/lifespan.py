import logging
import os, sys
from loguru import logger
from alembic.config import Config
from alembic import command
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.services.base_service import BaseService
from app.db.database import SessionLocal, Base, engine

# logging.basicConfig(level=logging.INFO)
# log = logging.getLogger(__name__)

def run_alembic_migrations():
    try:
        
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        alembic_cfg_path = os.path.join(project_root, "alembic.ini")

        if not os.path.exists(alembic_cfg_path):
            logger.error(f"alembic.ini not found at: {alembic_cfg_path}")
            raise FileNotFoundError(f"alembic.ini not found at {alembic_cfg_path}")        
        
        alembic_cfg = Config(alembic_cfg_path)
        # alembic_cfg = Config("alembic.ini")
        
        if project_root not in sys.path:
            sys.path.insert(0, project_root)

        # Direct Alembic output to stdout to see the logs
        #alembic_cfg.print_stdout = True

        logger.info("Starting Alembic migrations...")

        # Execute migration to 'head' (latest revision)
        command.upgrade(alembic_cfg, "head")
        logger.info("Alembic migrations completed.")
    except Exception as e:
        logger.error(f"Error during Alembic migrations: {e}")
        raise e

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting the application...")

    run_alembic_migrations()

    Base.metadata.create_all(bind=engine)

    yield

    logger.info("Shutting down the application...")
