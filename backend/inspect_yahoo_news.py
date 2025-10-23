"""
Yahoo Finance 뉴스 데이터 구조 확인
"""
import yfinance as yf
import json

ticker = "AAPL"
print(f"🔍 Inspecting Yahoo Finance news structure for {ticker}...")

stock = yf.Ticker(ticker)
if hasattr(stock, 'news') and stock.news:
    news_items = stock.news
    print(f"\n📰 Found {len(news_items)} news items")

    # 첫 번째 뉴스 아이템의 전체 구조 출력
    print("\n=== First News Item Structure ===")
    print(json.dumps(news_items[0], indent=2, default=str))
else:
    print("\n❌ No news found")
