#!/usr/bin/env python3
"""뉴스 수집 스크래퍼 테스트"""
import asyncio
from app.scrapers.yahoo_finance import fetch_news_rss, fetch_stock_news
from app.scrapers.sec_edgar import fetch_recent_filings

async def test_yahoo_finance():
    print("="*60)
    print("📰 Yahoo Finance 뉴스 수집 테스트")
    print("="*60)

    # 1. Apple 뉴스 수집
    print("\n1️⃣  AAPL (Apple) 뉴스 수집 중...")
    try:
        news_list = await fetch_stock_news("AAPL")
        if news_list:
            print(f"   ✅ {len(news_list)}개 뉴스 수집 성공!")
            print(f"\n   📋 최근 뉴스 3개:")
            for i, news in enumerate(news_list[:3], 1):
                print(f"\n   {i}. {news['title'][:60]}...")
                print(f"      URL: {news['url'][:50]}...")
        else:
            print("   ⚠️  뉴스를 찾을 수 없습니다")
    except Exception as e:
        print(f"   ❌ 에러: {e}")

    # 2. 전체 시장 뉴스
    print("\n2️⃣  전체 시장 뉴스 수집 중...")
    try:
        market_news = await fetch_news_rss(None)
        if market_news:
            print(f"   ✅ {len(market_news)}개 뉴스 수집 성공!")
            print(f"\n   📋 헤드라인 3개:")
            for i, news in enumerate(market_news[:3], 1):
                print(f"   {i}. {news['title'][:60]}...")
        else:
            print("   ⚠️  뉴스를 찾을 수 없습니다")
    except Exception as e:
        print(f"   ❌ 에러: {e}")

async def test_sec_edgar():
    print("\n" + "="*60)
    print("📊 SEC Edgar 공시 수집 테스트")
    print("="*60)

    print("\n1️⃣  TSLA (Tesla) 8-K 공시 수집 중...")
    try:
        filings = await fetch_recent_filings("TSLA", "8-K", 3)
        if filings:
            print(f"   ✅ {len(filings)}개 공시 수집 성공!")
            for i, filing in enumerate(filings, 1):
                print(f"\n   {i}. {filing['title']}")
                print(f"      발행일: {filing.get('published_at', 'N/A')}")
                print(f"      URL: {filing['url'][:50]}...")
        else:
            print("   ⚠️  공시를 찾을 수 없습니다")
    except Exception as e:
        print(f"   ❌ 에러: {e}")

async def main():
    # Yahoo Finance 테스트
    await test_yahoo_finance()

    # SEC Edgar 테스트
    await test_sec_edgar()

    print("\n" + "="*60)
    print("✅ 스크래퍼 테스트 완료!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
