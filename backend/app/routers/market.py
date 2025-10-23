from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.market_data import (
    get_market_overview,
    get_trending_stocks,
    get_stock_quote
)

router = APIRouter()


@router.get("/overview")
async def market_overview():
    """
    주요 시장 지수 실시간 데이터 조회 (S&P 500, NASDAQ, DOW JONES, VIX)

    Returns:
        list: 시장 지수 데이터
    """
    try:
        data = await get_market_overview()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market overview: {str(e)}")


@router.get("/trending")
async def trending_stocks(
    tickers: Optional[str] = Query(None, description="쉼표로 구분된 티커 리스트 (예: NVDA,TSLA,AAPL)")
):
    """
    인기 종목 실시간 데이터 조회

    Args:
        tickers: 선택적 티커 리스트 (기본값: NVDA, TSLA, AAPL, MSFT, META, GOOGL)

    Returns:
        list: 종목 데이터
    """
    try:
        ticker_list = None
        if tickers:
            ticker_list = [t.strip().upper() for t in tickers.split(",")]

        data = await get_trending_stocks(ticker_list)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending stocks: {str(e)}")


@router.get("/quote/{ticker}")
async def stock_quote(ticker: str):
    """
    개별 종목 실시간 시세 조회

    Args:
        ticker: 종목 티커 심볼

    Returns:
        dict: 종목 상세 데이터
    """
    try:
        ticker = ticker.upper()
        data = await get_stock_quote(ticker)

        if data is None:
            raise HTTPException(status_code=404, detail=f"Stock {ticker} not found or data unavailable")

        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock quote: {str(e)}")
