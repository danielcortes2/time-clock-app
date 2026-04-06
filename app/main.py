from fastapi import FastAPI
from app.routes import *
from dotenv import load_dotenv
load_dotenv()

from app.config.log_settings import LogSettings
from loguru import logger
from app.dto.error_dto import ErrorDetail, UnifiedErrorResponse
from app.config.lifespan import lifespan
from fastapi.responses import JSONResponse
from app.routes import *

app = FastAPI()

log_config = LogSettings()
log_config.configure_logging()

app = FastAPI(
    title="Project Testing Assistant",
    version="1.0.0",
    description="""project-testing description.""",
    lifespan=lifespan
)

app.include_router(health_controller)