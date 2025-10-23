import httpx
from bs4 import BeautifulSoup
from typing import List, Dict
from datetime import datetime
from app.config import settings

async def fetch_recent_filings(ticker: str, filing_type: str = "8-K", count: int = 10) -> List[Dict]:
    """
    SEC Edgar에서 최근 공시 가져오기
    
    Args:
        ticker: 주식 티커
        filing_type: 공시 유형 (10-K, 10-Q, 8-K 등)
        count: 가져올 공시 개수
    
    Returns:
        List[Dict]: 공시 목록
    """
    url = "https://www.sec.gov/cgi-bin/browse-edgar"
    params = {
        "action": "getcompany",
        "CIK": ticker,
        "type": filing_type,
        "dateb": "",
        "owner": "exclude",
        "count": count
    }
    
    headers = {
        "User-Agent": settings.sec_edgar_user_agent
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            filings = []
            
            # SEC Edgar HTML 파싱 (실제 구조에 맞게 조정 필요)
            table = soup.find('table', {'class': 'tableFile2'})
            if not table:
                return []
            
            rows = table.find_all('tr')[1:]  # 헤더 제외
            
            for row in rows[:count]:
                cols = row.find_all('td')
                if len(cols) >= 4:
                    filing_data = {
                        "source": "sec",
                        "title": f"{ticker} files {filing_type}",
                        "content": cols[2].get_text(strip=True) if len(cols) > 2 else "",
                        "url": f"https://www.sec.gov{cols[1].find('a')['href']}" if cols[1].find('a') else "",
                        "published_at": cols[3].get_text(strip=True) if len(cols) > 3 else None
                    }
                    filings.append(filing_data)
            
            return filings
    
    except Exception as e:
        print(f"Error fetching SEC filings: {e}")
        return []

async def get_8k_filings(ticker: str) -> List[Dict]:
    """8-K (중요 사건 보고서) 가져오기"""
    return await fetch_recent_filings(ticker, "8-K", 5)

async def get_10q_filings(ticker: str) -> List[Dict]:
    """10-Q (분기 보고서) 가져오기"""
    return await fetch_recent_filings(ticker, "10-Q", 2)

async def get_10k_filings(ticker: str) -> List[Dict]:
    """10-K (연간 보고서) 가져오기"""
    return await fetch_recent_filings(ticker, "10-K", 1)
