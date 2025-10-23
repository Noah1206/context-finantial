from fastapi import APIRouter, HTTPException, Query
from app.models import NewsResponse, NewsWithStock, NewsAnalysis
from app.database import get_news_list, get_news_by_id, get_news_by_ticker
from app.services.ai_summarizer import analyze_news_detailed
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[NewsWithStock])
async def get_news(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    min_score: Optional[int] = Query(None, ge=1, le=5),
    ticker: Optional[str] = None
):
    if ticker:
        return await get_news_by_ticker(ticker, limit)
    return await get_news_list(limit, offset, min_score)

@router.get("/{news_id}", response_model=NewsWithStock)
async def get_single_news(news_id: str):
    news = await get_news_by_id(news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    return news

@router.get("/{news_id}/analysis")
async def get_news_analysis(news_id: str):
    """
    뉴스에 대한 AI 기반 상세 분석 제공
    """
    news = await get_news_by_id(news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # AI 분석 수행
    ticker = news.get('stock', {}).get('ticker') if news.get('stock') else None
    analysis = await analyze_news_detailed(
        title=news.get('title', ''),
        content=news.get('content', ''),
        ticker=ticker
    )

    if not analysis:
        raise HTTPException(status_code=500, detail="Failed to analyze news")

    return {
        "news_id": news_id,
        **analysis
    }

@router.get("/stocks/{ticker}/news", response_model=List[NewsResponse])
async def get_stock_news(ticker: str, limit: int = Query(20, le=100)):
    return await get_news_by_ticker(ticker, limit)
