"""
전문 추출 테스트 스크립트
"""
import asyncio
from app.services.news_scraper import fetch_all_news
from app.database import db

async def main():
    # 기존 뉴스 삭제 (테스트를 위해)
    print("🗑️  Deleting existing news...")
    result = db.client.table("news").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print(f"✅ Deleted {len(result.data) if result.data else 0} news items")
    
    # 새로운 뉴스 수집 (전문 포함)
    print("\n📰 Fetching news with full articles...")
    await fetch_all_news()
    
    # 결과 확인
    print("\n📊 Checking results...")
    news_result = db.client.table("news").select("title, content").limit(3).execute()
    
    if news_result.data:
        for i, news in enumerate(news_result.data, 1):
            print(f"\n{i}. {news['title'][:60]}...")
            content_length = len(news['content'])
            print(f"   Content length: {content_length} characters")
            if content_length > 500:
                print(f"   Preview: {news['content'][:200]}...")
    else:
        print("❌ No news found")

if __name__ == "__main__":
    asyncio.run(main())
