from .database import Base
from ..models.dto import User, TimeEntry

def get_all_entities():
    return Base.metadata
