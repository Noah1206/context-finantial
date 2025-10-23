from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.stock_data import (
    get_income_statement,
    get_balance_sheet,
    get_cash_flow,
    get_historical_prices,
    get_key_metrics,
    get_realtime_price,
    get_batch_realtime_prices,
    check_price_alert
)

router = APIRouter()


@router.get("/stocks/{ticker}/income-statement")
async def income_statement(
    ticker: str,
    period: str = Query("annual", regex="^(annual|quarterly)$")
):
    """
    손익계산서 조회

    - **ticker**: 주식 티커 (예: AAPL, TSLA)
    - **period**: annual (연간) 또는 quarterly (분기)
    """
    return await get_income_statement(ticker.upper(), period)


@router.get("/stocks/{ticker}/balance-sheet")
async def balance_sheet(
    ticker: str,
    period: str = Query("annual", regex="^(annual|quarterly)$")
):
    """
    재무상태표 조회

    - **ticker**: 주식 티커
    - **period**: annual (연간) 또는 quarterly (분기)
    """
    return await get_balance_sheet(ticker.upper(), period)


@router.get("/stocks/{ticker}/cash-flow")
async def cash_flow(
    ticker: str,
    period: str = Query("annual", regex="^(annual|quarterly)$")
):
    """
    현금흐름표 조회

    - **ticker**: 주식 티커
    - **period**: annual (연간) 또는 quarterly (분기)
    """
    return await get_cash_flow(ticker.upper(), period)


@router.get("/stocks/{ticker}/historical")
async def historical_prices(
    ticker: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    interval: str = Query("1d", regex="^(1d|1wk|1mo)$")
):
    """
    과거 주가 데이터 조회

    - **ticker**: 주식 티커
    - **start_date**: 시작 날짜 (YYYY-MM-DD), 기본값: 1년 전
    - **end_date**: 종료 날짜 (YYYY-MM-DD), 기본값: 오늘
    - **interval**: 데이터 간격 (1d: 일별, 1wk: 주별, 1mo: 월별)
    """
    return await get_historical_prices(ticker.upper(), start_date, end_date, interval)


@router.get("/stocks/{ticker}/metrics")
async def key_metrics(ticker: str):
    """
    주요 재무 지표 조회

    - **ticker**: 주식 티커
    """
    return await get_key_metrics(ticker.upper())


@router.get("/stocks/{ticker}/financials")
async def all_financials(
    ticker: str,
    period: str = Query("annual", regex="^(annual|quarterly)$")
):
    """
    전체 재무제표 조회 (손익계산서 + 재무상태표 + 현금흐름표)

    - **ticker**: 주식 티커
    - **period**: annual (연간) 또는 quarterly (분기)
    """
    income_stmt = await get_income_statement(ticker.upper(), period)
    balance_sheet_data = await get_balance_sheet(ticker.upper(), period)
    cash_flow_data = await get_cash_flow(ticker.upper(), period)
    metrics = await get_key_metrics(ticker.upper())

    return {
        "ticker": ticker.upper(),
        "period": period,
        "income_statement": income_stmt,
        "balance_sheet": balance_sheet_data,
        "cash_flow": cash_flow_data,
        "key_metrics": metrics
    }


@router.get("/stocks/{ticker}/price")
async def realtime_price(ticker: str):
    """
    실시간 주가 데이터 조회

    - **ticker**: 주식 티커
    """
    return await get_realtime_price(ticker.upper())


@router.post("/stocks/prices/batch")
async def batch_prices(tickers: List[str]):
    """
    여러 티커의 실시간 주가를 병렬로 조회

    - **tickers**: 주식 티커 리스트
    """
    uppercase_tickers = [t.upper() for t in tickers]
    return await get_batch_realtime_prices(uppercase_tickers)


@router.get("/stocks/{ticker}/alert-check")
async def alert_check(ticker: str, threshold: int = Query(3, ge=1, le=5)):
    """
    주가 알림 조건 체크

    - **ticker**: 주식 티커
    - **threshold**: 알림 임계값 (1: Low, 2: Medium-Low, 3: Medium, 4: High, 5: Critical)
    """
    return await check_price_alert(ticker.upper(), threshold)
