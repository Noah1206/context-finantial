import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
import math


def clean_float(value):
    """Convert value to float, handling NaN and infinity"""
    if value is None:
        return None
    try:
        float_val = float(value)
        if math.isnan(float_val) or math.isinf(float_val):
            return None
        return float_val
    except (ValueError, TypeError):
        return None


async def get_income_statement(ticker: str, period: str = "annual") -> Dict:
    """
    손익계산서 조회

    Args:
        ticker: 주식 티커
        period: "annual" (연간) 또는 "quarterly" (분기)

    Returns:
        Dict: 손익계산서 데이터
    """
    try:
        stock = yf.Ticker(ticker)

        if period == "quarterly":
            income_stmt = stock.quarterly_income_stmt
        else:
            income_stmt = stock.income_stmt

        if income_stmt is None or income_stmt.empty:
            return {"error": "No income statement data available"}

        # DataFrame을 딕셔너리로 변환
        data = income_stmt.to_dict()

        # 날짜를 문자열로 변환
        formatted_data = {}
        for date_key, values in data.items():
            date_str = date_key.strftime('%Y-%m-%d') if isinstance(date_key, datetime) else str(date_key)
            formatted_data[date_str] = {k: clean_float(v) for k, v in values.items()}

        return {
            "ticker": ticker,
            "period": period,
            "data": formatted_data
        }

    except Exception as e:
        print(f"Error fetching income statement for {ticker}: {e}")
        return {"error": str(e)}


async def get_balance_sheet(ticker: str, period: str = "annual") -> Dict:
    """
    재무상태표 조회

    Args:
        ticker: 주식 티커
        period: "annual" (연간) 또는 "quarterly" (분기)

    Returns:
        Dict: 재무상태표 데이터
    """
    try:
        stock = yf.Ticker(ticker)

        if period == "quarterly":
            balance_sheet = stock.quarterly_balance_sheet
        else:
            balance_sheet = stock.balance_sheet

        if balance_sheet is None or balance_sheet.empty:
            return {"error": "No balance sheet data available"}

        # DataFrame을 딕셔너리로 변환
        data = balance_sheet.to_dict()

        # 날짜를 문자열로 변환
        formatted_data = {}
        for date_key, values in data.items():
            date_str = date_key.strftime('%Y-%m-%d') if isinstance(date_key, datetime) else str(date_key)
            formatted_data[date_str] = {k: clean_float(v) for k, v in values.items()}

        return {
            "ticker": ticker,
            "period": period,
            "data": formatted_data
        }

    except Exception as e:
        print(f"Error fetching balance sheet for {ticker}: {e}")
        return {"error": str(e)}


async def get_cash_flow(ticker: str, period: str = "annual") -> Dict:
    """
    현금흐름표 조회

    Args:
        ticker: 주식 티커
        period: "annual" (연간) 또는 "quarterly" (분기)

    Returns:
        Dict: 현금흐름표 데이터
    """
    try:
        stock = yf.Ticker(ticker)

        if period == "quarterly":
            cash_flow = stock.quarterly_cashflow
        else:
            cash_flow = stock.cashflow

        if cash_flow is None or cash_flow.empty:
            return {"error": "No cash flow data available"}

        # DataFrame을 딕셔너리로 변환
        data = cash_flow.to_dict()

        # 날짜를 문자열로 변환
        formatted_data = {}
        for date_key, values in data.items():
            date_str = date_key.strftime('%Y-%m-%d') if isinstance(date_key, datetime) else str(date_key)
            formatted_data[date_str] = {k: clean_float(v) for k, v in values.items()}

        return {
            "ticker": ticker,
            "period": period,
            "data": formatted_data
        }

    except Exception as e:
        print(f"Error fetching cash flow for {ticker}: {e}")
        return {"error": str(e)}


async def get_historical_prices(
    ticker: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    interval: str = "1d"
) -> Dict:
    """
    과거 주가 데이터 조회

    Args:
        ticker: 주식 티커
        start_date: 시작 날짜 (YYYY-MM-DD), 기본값: 1년 전
        end_date: 종료 날짜 (YYYY-MM-DD), 기본값: 오늘
        interval: 데이터 간격 (1d, 1wk, 1mo 등)

    Returns:
        Dict: 과거 주가 데이터
    """
    try:
        # 기본 날짜 설정
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

        stock = yf.Ticker(ticker)
        history = stock.history(start=start_date, end=end_date, interval=interval)

        if history is None or history.empty:
            return {"error": "No historical price data available"}

        # DataFrame을 딕셔너리로 변환
        price_data = []
        for date, row in history.iterrows():
            price_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "open": clean_float(row['Open']),
                "high": clean_float(row['High']),
                "low": clean_float(row['Low']),
                "close": clean_float(row['Close']),
                "volume": int(row['Volume']) if row['Volume'] is not None and not math.isnan(row['Volume']) else None,
            })

        return {
            "ticker": ticker,
            "start_date": start_date,
            "end_date": end_date,
            "interval": interval,
            "data": price_data
        }

    except Exception as e:
        print(f"Error fetching historical prices for {ticker}: {e}")
        return {"error": str(e)}


async def get_key_metrics(ticker: str) -> Dict:
    """
    주요 재무 지표 조회

    Args:
        ticker: 주식 티커

    Returns:
        Dict: 주요 재무 지표
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        metrics = {
            "ticker": ticker,
            "company_name": info.get('longName'),
            "sector": info.get('sector'),
            "industry": info.get('industry'),
            "market_cap": info.get('marketCap'),
            "pe_ratio": info.get('trailingPE'),
            "forward_pe": info.get('forwardPE'),
            "peg_ratio": info.get('pegRatio'),
            "price_to_book": info.get('priceToBook'),
            "dividend_yield": info.get('dividendYield'),
            "profit_margin": info.get('profitMargins'),
            "operating_margin": info.get('operatingMargins'),
            "return_on_equity": info.get('returnOnEquity'),
            "return_on_assets": info.get('returnOnAssets'),
            "revenue": info.get('totalRevenue'),
            "revenue_per_share": info.get('revenuePerShare'),
            "earnings_per_share": info.get('trailingEps'),
            "beta": info.get('beta'),
            "52_week_high": info.get('fiftyTwoWeekHigh'),
            "52_week_low": info.get('fiftyTwoWeekLow'),
            "50_day_average": info.get('fiftyDayAverage'),
            "200_day_average": info.get('twoHundredDayAverage'),
        }

        return metrics

    except Exception as e:
        print(f"Error fetching key metrics for {ticker}: {e}")
        return {"error": str(e)}


async def get_realtime_price(ticker: str) -> Dict:
    """
    실시간 주가 데이터 조회

    Args:
        ticker: 주식 티커

    Returns:
        Dict: 실시간 주가 정보
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        # Get recent history for price change calculation
        hist = stock.history(period="5d", interval="1d")

        current_price = info.get('currentPrice') or info.get('regularMarketPrice')
        previous_close = info.get('previousClose')

        # Calculate change
        price_change = None
        percent_change = None
        if current_price and previous_close:
            price_change = current_price - previous_close
            percent_change = (price_change / previous_close) * 100

        return {
            "ticker": ticker,
            "current_price": current_price,
            "previous_close": previous_close,
            "price_change": price_change,
            "percent_change": percent_change,
            "day_high": info.get('dayHigh'),
            "day_low": info.get('dayLow'),
            "volume": info.get('volume'),
            "avg_volume": info.get('averageVolume'),
            "market_cap": info.get('marketCap'),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"Error fetching realtime price for {ticker}: {e}")
        return {"error": str(e)}


async def get_batch_realtime_prices(tickers: List[str]) -> Dict[str, Dict]:
    """
    여러 티커의 실시간 주가를 병렬로 조회

    Args:
        tickers: 티커 리스트

    Returns:
        Dict: 티커별 실시간 주가 데이터
    """
    tasks = [get_realtime_price(ticker) for ticker in tickers]
    results = await asyncio.gather(*tasks)

    return {ticker: result for ticker, result in zip(tickers, results)}


async def check_price_alert(ticker: str, alert_threshold: int) -> Dict:
    """
    주가 알림 조건 체크

    Args:
        ticker: 주식 티커
        alert_threshold: 알림 임계값 (1-5)

    Returns:
        Dict: 알림 정보
    """
    try:
        price_data = await get_realtime_price(ticker)

        if "error" in price_data:
            return {"should_alert": False, "reason": "Error fetching price"}

        percent_change = price_data.get('percent_change')

        if percent_change is None:
            return {"should_alert": False, "reason": "No percent change data"}

        # Alert threshold mapping
        # 1 (Low): ±5%
        # 2 (Medium-Low): ±3%
        # 3 (Medium): ±2%
        # 4 (High): ±1%
        # 5 (Critical): ±0.5%
        threshold_map = {
            1: 5.0,
            2: 3.0,
            3: 2.0,
            4: 1.0,
            5: 0.5
        }

        threshold_percent = threshold_map.get(alert_threshold, 2.0)
        abs_change = abs(percent_change)

        should_alert = abs_change >= threshold_percent

        alert_type = None
        if should_alert:
            if percent_change > 0:
                alert_type = "surge"  # 급상승
            else:
                alert_type = "drop"   # 급락

        return {
            "should_alert": should_alert,
            "alert_type": alert_type,
            "percent_change": percent_change,
            "current_price": price_data.get('current_price'),
            "threshold": threshold_percent,
            "ticker": ticker,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"Error checking price alert for {ticker}: {e}")
        return {"should_alert": False, "reason": str(e)}
