from pydantic import Field
from pydantic_settings import BaseSettings

class DbSettings(BaseSettings):
    database_engine: str = Field(default="postgresql",alias='DATABASE_ENGINE')
    database_host: str = Field(default="localhost", alias='DATABASE_HOST')
    database_port: int = Field(default=5432, alias='DATABASE_PORT')
    database_name: str = Field(default="postgres", alias='DATABASE_NAME')
    database_username: str = Field(default="postgres", alias='DATABASE_USERNAME')
    database_password: str = Field(default="password", alias='DATABASE_PASSWORD')

    @property
    def database_url(self) -> str:
        return f"{self.database_engine}://{self.database_username}:{self.database_password}@{self.database_host}:{self.database_port}/{self.database_name}"
    
    def __hash__(self):
        return hash((self.database_host, self.database_port, self.database_name, self.database_username, self.database_password))