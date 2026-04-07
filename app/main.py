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
from app.routes.auth_controller import router as auth_router
from app.routes.time_controller import router as time_router
from app.routes.schedule_controller import router as schedule_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

log_config = LogSettings()
log_config.configure_logging()

app = FastAPI(
    title="Time Clock App",
    version="1.0.0",
    description="Time clock application for employees",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_controller)
app.include_router(auth_router)
app.include_router(time_router)
app.include_router(schedule_router)