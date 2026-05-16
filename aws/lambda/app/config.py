import json
import os
import boto3
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

def get_database_url_from_secrets() -> str | None:
    """
    Obter DATABASE_URL a partir de Secrets Manager em ambiente AWS Lambda.
    Retorna None se não estiver em Lambda ou se o secret não existir.
    """
    if not os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return None
    
    try:
        secret_arn = os.getenv("DB_SECRET_ARN", "seriesapp/db/credentials")
        client = boto3.client("secretsmanager", region_name=os.getenv("AWS_REGION", "us-east-1"))
        response = client.get_secret_value(SecretId=secret_arn)
        
        if "SecretString" in response:
            secret = json.loads(response["SecretString"])
            # Construir DATABASE_URL a partir das credenciais
            return (
                f"postgresql://{secret['username']}:{secret['password']}@"
                f"{secret['host']}:{secret['port']}/{secret['dbname']}"
            )
    except Exception as e:
        print(f"Erro ao obter secret: {str(e)}")
        return None

class Settings(BaseSettings):
    PROJECT_NAME: str = "Series Tracking Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = ""
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:4200"]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("[") and value.endswith("]"):
                return json.loads(value)
            return [value]
        return value
    
    def __init__(self, **data):
        # Se não houver DATABASE_URL, tentar obter do Secrets Manager
        if not data.get("DATABASE_URL"):
            secret_url = get_database_url_from_secrets()
            if secret_url:
                data["DATABASE_URL"] = secret_url
        super().__init__(**data)


settings = Settings()