"""
실시간 뉴스 스크래핑 서비스
매 시간마다 자동으로 Yahoo Finance, Google News, SEC 공시에서 뉴스를 가져옴
"""
import yfinance as yf
import feedparser
from datetime import datetime, timezone
from app.database import db
import logging
import time
from newspaper import Article
import asyncio
from urllib.parse import quote

logger = logging.getLogger(__name__)


def parse_rss_date(date_str):
    """RSS 날짜 형식을 파싱"""
    try:
        # RSS 날짜 형식 (예: Wed, 16 Oct 2024 14:30:00 GMT)
        time_struct = time.strptime(date_str, '%a, %d %b %Y %H:%M:%S %Z')
        return datetime(*time_struct[:6], tzinfo=timezone.utc).isoformat()
    except:
        try:
            # ISO 형식
            return datetime.fromisoformat(date_str.replace('Z', '+00:00')).isoformat()
        except:
            # 파싱 실패 시 현재 시간 (UTC)
            return datetime.now(timezone.utc).isoformat()


def extract_full_article(url: str) -> dict:
    """
    URL에서 전문(full article)을 추출
    Returns: {"content": str, "summary": str, "success": bool}
    """
    try:
        article = Article(url)
        article.download()
        article.parse()

        # 전문 추출
        full_text = article.text

        # 요약본 생성 (처음 500자)
        summary = full_text[:500] if len(full_text) > 500 else full_text

        if full_text and len(full_text) > 100:  # 최소 100자 이상이어야 유효한 기사로 간주
            logger.info(f"✅ Successfully extracted article ({len(full_text)} characters)")
            return {
                "content": full_text,
                "summary": summary,
                "success": True
            }
        else:
            logger.warning(f"⚠️ Article too short or empty ({len(full_text)} characters)")
            return {
                "content": "",
                "summary": "",
                "success": False
            }
    except Exception as e:
        logger.error(f"❌ Failed to extract article from {url}: {e}")
        return {
            "content": "",
            "summary": "",
            "success": False
        }


async def scrape_yahoo_finance_news(ticker: str, stock_id: str):
    """Yahoo Finance에서 뉴스 가져오기 (전문 추출)"""
    news_added = 0

    try:
        stock = yf.Ticker(ticker)
        news_items = stock.news if hasattr(stock, 'news') else []

        for item in news_items[:5]:  # 최근 5개만
            try:
                # 새로운 Yahoo Finance API 구조 (content 객체 안에 데이터가 있음)
                content_obj = item.get('content', item)  # 호환성을 위해 fallback

                title = content_obj.get('title', '')
                url_obj = content_obj.get('clickThroughUrl') or content_obj.get('canonicalUrl')
                url = url_obj.get('url', '') if url_obj else content_obj.get('link', '')

                if not title or not url:
                    continue

                # 이미 존재하는지 확인
                existing = db.client.table("news").select("id").eq("url", url).execute()
                if existing.data:
                    continue

                # 날짜 파싱 (새로운 형식: pubDate 또는 displayTime)
                pub_date = content_obj.get('pubDate') or content_obj.get('displayTime')
                if pub_date:
                    published_at = datetime.fromisoformat(pub_date.replace('Z', '+00:00')).isoformat()
                else:
                    published_at = datetime.now(timezone.utc).isoformat()

                # Publisher 정보 추출
                provider = content_obj.get('provider', {})
                publisher = provider.get('displayName', 'Yahoo Finance') if isinstance(provider, dict) else 'Yahoo Finance'

                # 전문 추출
                logger.info(f"📰 Extracting full article from {url[:80]}...")
                article_data = extract_full_article(url)

                # 전문 추출에 실패하면 요약본 사용
                if article_data["success"]:
                    content = article_data["content"]
                    summary = article_data["summary"]
                else:
                    # Fallback: Yahoo Finance API의 summary 사용 (새로운 구조)
                    fallback_summary = content_obj.get('summary', content_obj.get('description', title))
                    content = fallback_summary
                    summary = fallback_summary[:500] if len(fallback_summary) > 500 else fallback_summary
                    logger.warning(f"⚠️ Using fallback summary for {url[:80]}")

                # 영향도 점수 계산
                impact_score = calculate_impact_score(title, content)

                # 데이터베이스에 저장
                news_data = {
                    "stock_id": stock_id,
                    "title": title,
                    "content": content,
                    "summary": summary,
                    "url": url,
                    "source": publisher,
                    "published_at": published_at,
                    "impact_score": impact_score,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }

                result = db.client.table("news").insert(news_data).execute()
                if result.data:
                    logger.info(f"✅ Added Yahoo Finance news for {ticker}: {title[:50]}")
                    news_added += 1

            except Exception as e:
                logger.error(f"Error processing Yahoo Finance news item for {ticker}: {e}")
                continue

    except Exception as e:
        logger.error(f"Error fetching Yahoo Finance news for {ticker}: {e}")

    return news_added


async def scrape_google_news_rss(ticker: str, company_name: str, stock_id: str):
    """Google News RSS에서 뉴스 가져오기 (전문 추출)"""
    news_added = 0

    try:
        # Google News RSS URL
        search_query = f"{ticker} OR {company_name} stock"
        encoded_query = quote(search_query)
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"

        feed = feedparser.parse(rss_url)

        for entry in feed.entries[:5]:  # 최근 5개만
            try:
                title = entry.get('title', '')
                link = entry.get('link', '')

                if not title or not link:
                    continue

                # 이미 존재하는지 확인
                existing = db.client.table("news").select("id").eq("url", link).execute()
                if existing.data:
                    continue

                # 날짜 파싱
                published = entry.get('published', '')
                published_at = parse_rss_date(published) if published else datetime.now(timezone.utc).isoformat()

                source = entry.source.title if hasattr(entry, 'source') and hasattr(entry.source, 'title') else 'Google News'

                # 전문 추출
                logger.info(f"📰 Extracting full article from {link[:80]}...")
                article_data = extract_full_article(link)

                # 전문 추출에 실패하면 요약본 사용
                if article_data["success"]:
                    content = article_data["content"]
                    summary = article_data["summary"]
                else:
                    # Fallback: RSS의 summary 사용
                    fallback_summary = entry.get('summary', title)
                    content = fallback_summary
                    summary = fallback_summary[:500] if len(fallback_summary) > 500 else fallback_summary
                    logger.warning(f"⚠️ Using fallback summary for {link[:80]}")

                # 영향도 점수 계산
                impact_score = calculate_impact_score(title, content)

                # 데이터베이스에 저장
                news_data = {
                    "stock_id": stock_id,
                    "title": title,
                    "content": content,
                    "summary": summary,
                    "url": link,
                    "source": source,
                    "published_at": published_at,
                    "impact_score": impact_score,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }

                result = db.client.table("news").insert(news_data).execute()
                if result.data:
                    logger.info(f"✅ Added Google News for {ticker}: {title[:50]}")
                    news_added += 1

            except Exception as e:
                logger.error(f"Error processing Google News item for {ticker}: {e}")
                continue

    except Exception as e:
        logger.error(f"Error fetching Google News for {ticker}: {e}")

    return news_added


def calculate_impact_score(title: str, content: str) -> int:
    """
    뉴스의 영향도 점수 계산 (1-5)
    높은 점수 = 시장 전체에 영향을 주는 중요 뉴스
    """
    title_lower = title.lower()
    content_lower = content.lower()

    # 높은 영향도 키워드 (점수 5)
    high_impact_keywords = [
        'federal reserve', 'fed', 'interest rate', 'inflation', 'recession',
        'sec', 'regulation', 'policy', 'earnings report', 'market crash',
        'economic', 'gdp', 'unemployment', 'forex', 'exchange rate',
        'trade war', 'tariff', 'geopolitical', 'bank crisis'
    ]

    # 중간 영향도 키워드 (점수 4)
    medium_impact_keywords = [
        'analyst', 'upgrade', 'downgrade', 'price target', 'market outlook',
        'sector', 'industry', 'merger', 'acquisition', 'ipo'
    ]

    # 제목에 높은 영향도 키워드 포함
    for keyword in high_impact_keywords:
        if keyword in title_lower or keyword in content_lower[:500]:
            return 5

    # 제목에 중간 영향도 키워드 포함
    for keyword in medium_impact_keywords:
        if keyword in title_lower:
            return 4

    # 기본 점수
    return 3


async def scrape_hot_market_news():
    """
    핫한 시장 뉴스 수집
    주요 지수(S&P 500, Nasdaq, Dow Jones) 관련 뉴스를 수집하여
    시장 전체에 영향을 주는 중요 뉴스를 제공
    """
    news_added = 0

    try:
        # 첫 번째 종목을 기본 stock_id로 사용
        stocks_result = db.client.table("stocks").select("id").limit(1).execute()
        if not stocks_result.data:
            logger.warning("No stocks in database for hot news")
            return 0

        default_stock_id = stocks_result.data[0]['id']

        # 주요 시장 지수 심볼
        market_indices = ['^GSPC', '^IXIC', '^DJI']  # S&P 500, Nasdaq, Dow Jones

        for index_symbol in market_indices:
            try:
                logger.info(f"📰 Fetching market news from {index_symbol}...")
                stock = yf.Ticker(index_symbol)
                news_items = stock.news if hasattr(stock, 'news') else []

                for item in news_items[:3]:  # 각 지수당 3개
                    try:
                        # Yahoo Finance API 구조
                        content_obj = item.get('content', item)

                        title = content_obj.get('title', '')
                        url_obj = content_obj.get('clickThroughUrl') or content_obj.get('canonicalUrl')
                        url = url_obj.get('url', '') if url_obj else content_obj.get('link', '')

                        if not title or not url:
                            continue

                        # 중복 확인
                        existing = db.client.table("news").select("id").eq("url", url).execute()
                        if existing.data:
                            continue

                        # 날짜 파싱
                        pub_date = content_obj.get('pubDate') or content_obj.get('displayTime')
                        if pub_date:
                            published_at = datetime.fromisoformat(pub_date.replace('Z', '+00:00')).isoformat()
                        else:
                            published_at = datetime.now(timezone.utc).isoformat()

                        # Publisher 정보
                        provider = content_obj.get('provider', {})
                        publisher = provider.get('displayName', 'Market News') if isinstance(provider, dict) else 'Market News'

                        # 전문 추출
                        logger.info(f"📰 Extracting market news from {url[:80]}...")
                        article_data = extract_full_article(url)

                        if article_data["success"]:
                            content = article_data["content"]
                            summary = article_data["summary"]
                        else:
                            fallback_summary = content_obj.get('summary', content_obj.get('description', title))
                            content = fallback_summary
                            summary = fallback_summary[:500] if len(fallback_summary) > 500 else fallback_summary

                        # 영향도 점수 계산
                        impact_score = calculate_impact_score(title, content)

                        news_data = {
                            "stock_id": default_stock_id,
                            "title": title,
                            "content": content,
                            "summary": summary[:500],
                            "url": url,
                            "source": publisher,
                            "published_at": published_at,
                            "impact_score": impact_score,
                            "created_at": datetime.now(timezone.utc).isoformat()
                        }

                        result = db.client.table("news").insert(news_data).execute()
                        if result.data:
                            logger.info(f"✅ Added market news (impact: {impact_score}): {title[:50]}")
                            news_added += 1

                    except Exception as e:
                        logger.error(f"Error processing market news from {index_symbol}: {e}")
                        continue

                await asyncio.sleep(1)  # Rate limiting

            except Exception as e:
                logger.error(f"Error fetching news from {index_symbol}: {e}")

        logger.info(f"🔥 Added {news_added} market news articles")

    except Exception as e:
        logger.error(f"Error in scrape_hot_market_news: {e}")

    return news_added


async def fetch_all_news():
    """모든 종목에 대해 뉴스를 가져오는 메인 함수"""
    logger.info("🔄 Starting news scraping job...")

    try:
        # 데이터베이스에서 모든 종목 가져오기
        stocks_result = db.client.table("stocks").select("*").execute()
        stocks = stocks_result.data if stocks_result.data else []

        if not stocks:
            logger.warning("No stocks found in database")
            return

        total_news_added = 0

        # 핫한 시장 뉴스 먼저 수집
        logger.info("🔥 Fetching hot market news...")
        hot_news_count = await scrape_hot_market_news()
        total_news_added += hot_news_count

        for stock in stocks:
            ticker = stock['ticker']
            stock_id = stock['id']
            company_name = stock.get('company_name', ticker)

            logger.info(f"📰 Fetching news for {ticker} ({company_name})...")

            # Yahoo Finance에서 뉴스 가져오기
            yahoo_count = await scrape_yahoo_finance_news(ticker, stock_id)
            total_news_added += yahoo_count

            # Google News에서 뉴스 가져오기
            google_count = await scrape_google_news_rss(ticker, company_name, stock_id)
            total_news_added += google_count

            # Rate limiting 방지를 위한 딜레이
            await asyncio.sleep(2)

        logger.info(f"✨ News scraping completed! Added {total_news_added} new articles")

    except Exception as e:
        logger.error(f"Error in fetch_all_news: {e}")
