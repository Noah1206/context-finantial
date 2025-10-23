from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App settings
    debug: bool = True
    environment: str = "development"
    secret_key: str = "dev-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_key: str = ""

    # AI API - Gemini
    gemini_api_key: Optional[str] = None

    # External APIs
    sec_edgar_user_agent: str = "your-email@example.com"

    # Notifications
    telegram_bot_token: Optional[str] = None
    sendgrid_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
