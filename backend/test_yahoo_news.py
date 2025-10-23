"""
Yahoo Finance 뉴스 API 테스트
"""
import yfinance as yf

ticker = "AAPL"
print(f"🔍 Testing Yahoo Finance news for {ticker}...")

stock = yf.Ticker(ticker)
print(f"\n📊 Stock object created: {stock}")
print(f"Has 'news' attribute: {hasattr(stock, 'news')}")

if hasattr(stock, 'news'):
    news_items = stock.news
    print(f"\n📰 Found {len(news_items)} news items")

    for i, item in enumerate(news_items[:3]):
        print(f"\n--- News {i+1} ---")
        print(f"Title: {item.get('title', 'N/A')}")
        print(f"Link: {item.get('link', 'N/A')[:80]}...")
        print(f"Publisher: {item.get('publisher', 'N/A')}")
else:
    print("\n❌ No 'news' attribute found")
    print("\nAvailable attributes:")
    print([attr for attr in dir(stock) if not attr.startswith('_')])
