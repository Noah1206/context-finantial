import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime
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

async def get_market_overview() -> List[Dict]:
    """
    실시간 주요 지수 데이터 조회 (S&P 500, NASDAQ, DOW JONES, VIX)

    Returns:
        list: 시장 지수 데이터 목록
    """
    try:
        # 주요 지수 티커
        indices = {
            "^GSPC": "S&P 500",      # S&P 500
            "^IXIC": "NASDAQ",       # NASDAQ Composite
            "^DJI": "DOW JONES",     # Dow Jones Industrial Average
            "^VIX": "VIX"            # VIX Volatility Index
        }

        result = []

        for ticker, label in indices.items():
            try:
                # 실시간 데이터 조회
                stock = yf.Ticker(ticker)
                info = stock.info

                # 현재가 및 전일 종가 (NaN 처리)
                current_price = clean_float(info.get('currentPrice') or info.get('regularMarketPrice'))
                previous_close = clean_float(info.get('previousClose') or info.get('regularMarketPreviousClose'))

                if current_price and previous_close:
                    # 변화율 계산
                    change_percent = ((current_price - previous_close) / previous_close) * 100
                    change_percent = clean_float(change_percent)

                    if change_percent is not None:
                        result.append({
                            "label": label,
                            "value": f"{current_price:,.2f}",
                            "change": f"{change_percent:+.2f}%",
                            "isPositive": change_percent >= 0
                        })
                    else:
                        # 변화율이 NaN인 경우 기본값
                        result.append({
                            "label": label,
                            "value": f"{current_price:,.2f}",
                            "change": "0.00%",
                            "isPositive": True
                        })
                else:
                    # 데이터 없을 경우 기본값
                    result.append({
                        "label": label,
                        "value": "N/A",
                        "change": "0.00%",
                        "isPositive": True
                    })

            except Exception as e:
                print(f"Error fetching {label}: {e}")
                # 개별 지수 에러 시 기본값
                result.append({
                    "label": label,
                    "value": "N/A",
                    "change": "0.00%",
                    "isPositive": True
                })

        return result

    except Exception as e:
        print(f"Error in get_market_overview: {e}")
        # 전체 에러 시 빈 리스트 반환
        return []


async def get_trending_stocks(tickers: Optional[List[str]] = None) -> List[Dict]:
    """
    인기 종목 실시간 데이터 조회

    Args:
        tickers: 조회할 티커 리스트 (기본값: NVDA, TSLA, AAPL, MSFT, META, GOOGL)

    Returns:
        list: 종목 데이터 목록
    """
    try:
        # 기본 인기 종목 티커
        if tickers is None:
            tickers = ["NVDA", "TSLA", "AAPL", "MSFT", "META", "GOOGL"]

        result = []

        for ticker in tickers:
            try:
                # 실시간 데이터 조회
                stock = yf.Ticker(ticker)
                info = stock.info

                # 필요한 데이터 추출 (NaN 처리)
                current_price = clean_float(info.get('currentPrice') or info.get('regularMarketPrice'))
                previous_close = clean_float(info.get('previousClose') or info.get('regularMarketPreviousClose'))
                company_name = info.get('shortName') or info.get('longName') or ticker

                if current_price and previous_close:
                    # 변화율 계산
                    change_percent = ((current_price - previous_close) / previous_close) * 100
                    change_percent = clean_float(change_percent)

                    if change_percent is not None:
                        result.append({
                            "ticker": ticker,
                            "name": company_name,
                            "price": f"${current_price:.2f}",
                            "change": f"{change_percent:+.2f}%",
                            "isPositive": change_percent >= 0
                        })
                    else:
                        # 변화율이 NaN인 경우 기본값
                        result.append({
                            "ticker": ticker,
                            "name": company_name,
                            "price": f"${current_price:.2f}",
                            "change": "0.00%",
                            "isPositive": True
                        })
                else:
                    # 데이터 없을 경우 기본값
                    result.append({
                        "ticker": ticker,
                        "name": company_name,
                        "price": "N/A",
                        "change": "0.00%",
                        "isPositive": True
                    })

            except Exception as e:
                print(f"Error fetching {ticker}: {e}")
                # 개별 종목 에러 시 기본값
                result.append({
                    "ticker": ticker,
                    "name": ticker,
                    "price": "N/A",
                    "change": "0.00%",
                    "isPositive": True
                })

        return result

    except Exception as e:
        print(f"Error in get_trending_stocks: {e}")
        # 전체 에러 시 빈 리스트 반환
        return []


async def get_stock_quote(ticker: str) -> Optional[Dict]:
    """
    개별 종목 실시간 시세 조회

    Args:
        ticker: 종목 티커 심볼

    Returns:
        dict: 종목 데이터 또는 None
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        current_price = clean_float(info.get('currentPrice') or info.get('regularMarketPrice'))
        previous_close = clean_float(info.get('previousClose') or info.get('regularMarketPreviousClose'))

        if not current_price or not previous_close:
            return None

        change_percent = ((current_price - previous_close) / previous_close) * 100
        change_percent = clean_float(change_percent)

        if change_percent is None:
            return None

        return {
            "ticker": ticker,
            "name": info.get('shortName') or info.get('longName') or ticker,
            "price": current_price,
            "change": change_percent,
            "volume": clean_float(info.get('volume')),
            "marketCap": clean_float(info.get('marketCap')),
            "previousClose": previous_close,
            "isPositive": change_percent >= 0
        }

    except Exception as e:
        print(f"Error fetching quote for {ticker}: {e}")
        return None
