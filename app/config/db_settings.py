from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class DbSettings(BaseSettings):
    model_config = SettingsConfigDict(populate_by_name=True, extra='forbid')
    
    database_engine: str = Field(default="sqlite",alias='DATABASE_ENGINE')
    database_host: str = Field(default="", alias='DATABASE_HOST')
    database_port: int = Field(default=0, alias='DATABASE_PORT')
    database_name: str = Field(default="time_clock.db", alias='DATABASE_NAME')
    database_username: str = Field(default="", alias='DATABASE_USERNAME')
    database_password: str = Field(default="", alias='DATABASE_PASSWORD')

    @property
    def database_url(self) -> str:
        if self.database_engine == "sqlite":
            return f"sqlite:///{self.database_name}"
        return f"{self.database_engine}://{self.database_username}:{self.database_password}@{self.database_host}:{self.database_port}/{self.database_name}"
    
    def __hash__(self):
        return hash((self.database_host, self.database_port, self.database_name, self.database_username, self.database_password))