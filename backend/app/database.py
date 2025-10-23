from supabase import create_client, Client
from app.config import settings
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client: Optional[Client] = None
        self._initialize()
    
    def _initialize(self):
        try:
            self.client = create_client(
                supabase_url=settings.supabase_url,
                supabase_key=settings.supabase_key,
            )
            logger.info("Supabase client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase: {e}")
            raise
    
    def get_client(self) -> Client:
        if not self.client:
            self._initialize()
        return self.client

db = Database()

def get_db() -> Client:
    return db.get_client()

# User functions
async def create_user(email: str, password_hash: str, **kwargs) -> dict:
    user_data = {"email": email, "password_hash": password_hash, **kwargs}
    response = db.client.table("users").insert(user_data).execute()
    return response.data[0] if response.data else None

async def get_user_by_email(email: str) -> Optional[dict]:
    try:
        response = db.client.table("users").select("*").eq("email", email).execute()
        return response.data[0] if response.data else None
    except:
        return None

async def get_user_by_id(user_id: str) -> Optional[dict]:
    try:
        response = db.client.table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None
    except:
        return None

async def update_user(user_id: str, data: dict) -> Optional[dict]:
    response = db.client.table("users").update(data).eq("id", user_id).execute()
    return response.data[0] if response.data else None

# Stock functions
async def get_stock_by_ticker(ticker: str) -> Optional[dict]:
    try:
        response = db.client.table("stocks").select("*").eq("ticker", ticker).execute()
        return response.data[0] if response.data else None
    except:
        return None

async def create_stock(ticker: str, company_name: str, sector: str = None) -> dict:
    stock_data = {"ticker": ticker, "company_name": company_name, "sector": sector}
    response = db.client.table("stocks").insert(stock_data).execute()
    return response.data[0] if response.data else None

async def add_to_watchlist(user_id: str, ticker: str, alert_threshold: int = 3) -> dict:
    stock = await get_stock_by_ticker(ticker)
    if not stock:
        return None
    
    data = {"user_id": user_id, "stock_id": stock["id"], "alert_threshold": alert_threshold}
    response = db.client.table("user_stocks").insert(data).execute()
    return response.data[0] if response.data else None

async def get_watchlist(user_id: str) -> List[dict]:
    try:
        response = db.client.table("user_stocks").select("*, stocks(*)").eq("user_id", user_id).execute()
        return response.data if response.data else []
    except:
        return []

async def remove_from_watchlist(user_id: str, stock_id: str) -> bool:
    try:
        db.client.table("user_stocks").delete().eq("user_id", user_id).eq("stock_id", stock_id).execute()
        return True
    except:
        return False

# News functions
async def create_news(news_data: dict) -> dict:
    response = db.client.table("news").insert(news_data).execute()
    return response.data[0] if response.data else None

async def get_news_list(limit: int = 20, offset: int = 0, min_score: int = None) -> List[dict]:
    try:
        query = db.client.table("news").select("*, stocks(*)")
        if min_score:
            query = query.gte("impact_score", min_score)
        response = query.order("published_at", desc=True).range(offset, offset + limit - 1).execute()
        return response.data if response.data else []
    except Exception as e:
        logger.error(f"Error fetching news list: {e}")
        return []

async def get_news_by_id(news_id: str) -> Optional[dict]:
    try:
        response = db.client.table("news").select("*, stocks(*)").eq("id", news_id).execute()
        return response.data[0] if response.data else None
    except:
        return None

async def update_news(news_id: str, data: dict) -> Optional[dict]:
    response = db.client.table("news").update(data).eq("id", news_id).execute()
    return response.data[0] if response.data else None

async def get_news_by_ticker(ticker: str, limit: int = 20) -> List[dict]:
    try:
        stock = await get_stock_by_ticker(ticker)
        if not stock:
            return []
        response = db.client.table("news").select("*").eq("stock_id", stock["id"]).order("published_at", desc=True).limit(limit).execute()
        return response.data if response.data else []
    except:
        return []

# Alert functions
async def create_alert(user_id: str, news_id: str, alert_type: str) -> dict:
    data = {"user_id": user_id, "news_id": news_id, "alert_type": alert_type, "sent_at": "now()"}
    response = db.client.table("alerts").insert(data).execute()
    return response.data[0] if response.data else None

async def get_user_alerts(user_id: str, limit: int = 50) -> List[dict]:
    try:
        response = db.client.table("alerts").select("*, news(*)").eq("user_id", user_id).order("sent_at", desc=True).limit(limit).execute()
        return response.data if response.data else []
    except:
        return []

async def mark_alert_read(alert_id: str) -> bool:
    try:
        db.client.table("alerts").update({"read_at": "now()"}).eq("id", alert_id).execute()
        return True
    except:
        return False
