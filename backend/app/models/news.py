from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class NewsBase(BaseModel):
    source: str
    title: str
    content: Optional[str] = None
    url: Optional[str] = None

class NewsCreate(NewsBase):
    stock_id: Optional[str] = None
    published_at: Optional[datetime] = None

class NewsResponse(NewsBase):
    id: str
    summary: Optional[str] = None
    impact_score: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NewsWithStock(NewsResponse):
    stock: Optional[dict] = None

class NewsSummaryRequest(BaseModel):
    news_id: str

class NewsSummaryResponse(BaseModel):
    summary: str
    impact_score: int

# AI Analysis Models
class MarketSentiment(BaseModel):
    source: str
    score: int
    label: str

class SectorImpact(BaseModel):
    sector: str
    change: str
    description: str

class MarketImpactAnalysis(BaseModel):
    short_term: Dict[str, Any]
    long_term: Dict[str, Any]
    sector_impacts: List[SectorImpact]
    market_sentiments: List[MarketSentiment]

class InvestorInsight(BaseModel):
    investor_type: str
    opportunities: List[str]
    risks: List[str]
    action_items: List[str]

class AIRecommendation(BaseModel):
    recommendation: str  # BUY, SELL, HOLD
    confidence: int
    target_price: Optional[float] = None
    risk_score: float
    hold_period: str
    reasoning: Dict[str, List[str]]

class NewsAnalysis(BaseModel):
    news_id: str
    market_impact: Optional[MarketImpactAnalysis] = None
    investor_insights: Optional[List[InvestorInsight]] = None
    ai_recommendation: Optional[AIRecommendation] = None
