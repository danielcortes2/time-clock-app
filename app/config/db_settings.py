from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class DbSettings(BaseSettings):
    model_config = SettingsConfigDict(populate_by_name=True, extra='forbid')
    
    # MySQL configuration (matching .env variables)
    mysql_host: str = Field(default="", alias='MYSQL_HOST')
    mysql_port: int = Field(default=3306, alias='MYSQL_PORT')
    mysql_db_name: str = Field(default="", alias='MYSQL_DB_NAME')
    mysql_user: str = Field(default="", alias='MYSQL_USER')
    mysql_password: str = Field(default="", alias='MYSQL_PASSWORD')
    
    # Legacy fields for backward compatibility
    database_engine: str = Field(default="mysql", alias='DATABASE_ENGINE')
    database_host: str = Field(default="", alias='DATABASE_HOST')
    database_port: int = Field(default=3306, alias='DATABASE_PORT')
    database_name: str = Field(default="", alias='DATABASE_NAME')
    database_username: str = Field(default="", alias='DATABASE_USERNAME')
    database_password: str = Field(default="", alias='DATABASE_PASSWORD')

    @property
    def database_url(self) -> str:
        # Use MySQL configuration if available, otherwise fall back to legacy fields
        host = self.mysql_host or self.database_host
        port = self.mysql_port or self.database_port
        name = self.mysql_db_name or self.database_name
        user = self.mysql_user or self.database_username
        password = self.mysql_password or self.database_password
        
        if self.database_engine == "sqlite":
            return f"sqlite:///{name}"
        elif self.database_engine == "mysql":
            return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
        else:  # postgresql
            return f"{self.database_engine}://{user}:{password}@{host}:{port}/{name}"
    
    def __hash__(self):
        return hash((self.database_host, self.database_port, self.database_name, self.database_username, self.database_password))