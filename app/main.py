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
# from fastapi.middleware.base import BaseHTTPMiddleware

# class StripPrefixMiddleware(BaseHTTPMiddleware):
#     def __init__(self, app, prefix):
#         super().__init__(app)
#         self.prefix = prefix

#     async def dispatch(self, request, call_next):
#         if request.url.path.startswith(self.prefix):
#             request.scope['path'] = request.url.path[len(self.prefix):]
#             request.scope['raw_path'] = request.scope['raw_path'][len(self.prefix):]
#         return await call_next(request)

app = FastAPI()

log_config = LogSettings()
log_config.configure_logging()

app = FastAPI(
    title="Time Clock App",
    version="1.0.0",
    description="Time clock application for employees",
    lifespan=lifespan
)

# app.add_middleware(StripPrefixMiddleware, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://time-clock-app-sqvj.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_controller, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(time_router, prefix="/api")
app.include_router(schedule_router, prefix="/api")