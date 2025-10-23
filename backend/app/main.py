from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, news, alerts, market, market_ws, stocks
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.news_scraper import fetch_all_news
import asyncio
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 스케줄러 초기화
scheduler = AsyncIOScheduler()

app = FastAPI(
    title="Stock News Alert API",
    description="US Stock Market News Aggregator & Alert System",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(news.router, prefix="/api/news", tags=["News"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])
app.include_router(market_ws.router, tags=["Market WebSocket"])
app.include_router(stocks.router, prefix="/api", tags=["Stock Data"])

@app.get("/")
async def root():
    return {"message": "Stock News Alert API", "version": "0.1.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "database": "configured"}

@app.on_event("startup")
async def startup():
    print("🚀 Stock News Alert API started")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🔌 WebSocket: ws://localhost:8000/ws/market")

    # 백그라운드 태스크: 시장 데이터 브로드캐스트
    asyncio.create_task(market_ws.broadcast_market_updates())

    # 뉴스 스크래핑 스케줄러 시작
    # 매 시간 정각에 실행 (예: 1:00, 2:00, 3:00...)
    scheduler.add_job(
        fetch_all_news,
        'cron',
        minute=0,  # 매 시간 0분에 실행
        id='news_scraper',
        name='Hourly News Scraper',
        replace_existing=True
    )

    # 앱 시작 시 바로 한 번 실행
    logger.info("🔄 Running initial news fetch...")
    asyncio.create_task(fetch_all_news())

    scheduler.start()
    logger.info("⏰ News scraper scheduler started (runs every hour at :00)")

@app.on_event("shutdown")
async def shutdown():
    logger.info("👋 Shutting down...")
    scheduler.shutdown()
