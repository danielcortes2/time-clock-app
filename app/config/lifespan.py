import logging
import os, sys
from loguru import logger
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting the application...")
    yield
    logger.info("Shutting down the application...")
