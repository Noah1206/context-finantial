from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    alert_type: str

class AlertCreate(AlertBase):
    user_id: str
    news_id: str

class AlertResponse(AlertBase):
    id: str
    news_id: str
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AlertWithNews(AlertResponse):
    news: Optional[dict] = None

class AlertSettings(BaseModel):
    telegram_enabled: bool = False
    telegram_id: Optional[str] = None
    email_enabled: bool = True
    push_enabled: bool = False
    min_impact_score: int = 3
    alert_frequency: str = "realtime"
