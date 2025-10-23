"""
디버깅을 위한 뉴스 가져오기 스크립트
"""
import asyncio
import logging
from app.services.news_scraper import fetch_all_news

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def main():
    print("🔄 Starting manual news fetch with logging...")
    await fetch_all_news()
    print("✅ Manual news fetch completed!")

if __name__ == "__main__":
    asyncio.run(main())
