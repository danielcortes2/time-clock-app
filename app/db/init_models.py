from .database import Base

def get_all_entities():
    return Base.metadata
