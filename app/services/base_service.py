from sqlalchemy.orm import Session
from contextlib import contextmanager
from typing import Generator

from app.utils.log_utils import method_logger

@method_logger
class BaseService:
    def __init__(self, db: Session):
        self._db = db

    @contextmanager
    def get_session(self) -> Generator[Session, None, None]:
        try:
            yield self._db
        except Exception:
            raise