import json
import os

import boto3
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URI: str
    MONGODB_DATABASE: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


def load_lambda_secrets():
    client = boto3.client(
        "secretsmanager",
        region_name="us-east-2",
    )

    response = client.get_secret_value(
        SecretId="citi-workshop/backend",
    )

    return json.loads(response["SecretString"])


if os.getenv("AWS_LAMBDA_FUNCTION_NAME") and not os.getenv("LOCAL_DEV"):
    settings = Settings(**load_lambda_secrets())
else:
    settings = Settings()
