"""
수동으로 뉴스를 가져오는 스크립트
"""
import asyncio
from app.services.news_scraper import fetch_all_news

async def main():
    print("🔄 Starting manual news fetch...")
    await fetch_all_news()
    print("✅ Manual news fetch completed!")

if __name__ == "__main__":
    asyncio.run(main())
