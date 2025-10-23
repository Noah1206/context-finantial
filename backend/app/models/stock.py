from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StockBase(BaseModel):
    ticker: str
    company_name: str
    sector: Optional[str] = None

class StockCreate(StockBase):
    pass

class StockResponse(StockBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserStockCreate(BaseModel):
    ticker: str
    alert_threshold: int = 3

class UserStockResponse(BaseModel):
    id: str
    stock: StockResponse
    alert_threshold: int
    created_at: datetime
    
    class Config:
        from_attributes = True
