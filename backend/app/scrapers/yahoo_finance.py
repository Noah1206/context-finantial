import httpx
import feedparser
from typing import List, Dict
from datetime import datetime
from bs4 import BeautifulSoup

async def fetch_article_content(url: str) -> str:
    """
    Yahoo Finance 기사 페이지에서 전문 추출

    Args:
        url: 기사 URL

    Returns:
        str: 기사 전문
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Yahoo Finance 기사 본문 추출 (여러 가능한 클래스 시도)
            article_body = None

            # 방법 1: caas-body 클래스 (일반적인 Yahoo Finance 기사)
            article_body = soup.find('div', class_='caas-body')

            # 방법 2: article-content 클래스
            if not article_body:
                article_body = soup.find('div', class_='article-content')

            # 방법 3: body-content 클래스
            if not article_body:
                article_body = soup.find('div', class_='body-content')

            # 방법 4: 모든 p 태그 수집
            if not article_body:
                paragraphs = soup.find_all('p')
                if paragraphs:
                    return '\n\n'.join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 50])

            if article_body:
                # 본문 내 모든 p 태그 추출
                paragraphs = article_body.find_all('p')
                content = '\n\n'.join([p.get_text(strip=True) for p in paragraphs])
                return content if content else article_body.get_text(strip=True)

            return ""

    except Exception as e:
        print(f"Error fetching article content from {url}: {e}")
        return ""

async def fetch_news_rss(ticker: str = None, full_content: bool = True) -> List[Dict]:
    """
    Yahoo Finance RSS에서 뉴스 가져오기

    Args:
        ticker: 주식 티커 (None이면 전체 뉴스)
        full_content: True면 기사 전문 크롤링, False면 요약만

    Returns:
        List[Dict]: 뉴스 목록
    """
    if ticker:
        url = f"https://finance.yahoo.com/rss/headline?s={ticker}"
    else:
        url = "https://finance.yahoo.com/news/rssindex"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()

            feed = feedparser.parse(response.text)
            news_list = []

            for entry in feed.entries[:20]:  # 최근 20개
                article_url = entry.get('link', '')
                summary = entry.get('summary', '')

                # 기사 전문 크롤링
                content = summary
                if full_content and article_url:
                    full_article = await fetch_article_content(article_url)
                    if full_article and len(full_article) > len(summary):
                        content = full_article

                news_data = {
                    "source": "yahoo",
                    "title": entry.get('title', ''),
                    "content": content,
                    "url": article_url,
                    "published_at": entry.get('published', None)
                }
                news_list.append(news_data)

            return news_list

    except Exception as e:
        print(f"Error fetching Yahoo Finance news: {e}")
        return []

async def fetch_stock_news(ticker: str) -> List[Dict]:
    """특정 주식의 뉴스 가져오기"""
    return await fetch_news_rss(ticker)

async def fetch_market_news() -> List[Dict]:
    """전체 시장 뉴스 가져오기"""
    return await fetch_news_rss(None)
