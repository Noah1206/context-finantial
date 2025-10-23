import google.generativeai as genai
from app.config import settings
import json

async def summarize_news(title: str, content: str) -> dict:
    """
    뉴스 요약 및 영향도 점수 생성

    Args:
        title: 뉴스 제목
        content: 뉴스 내용

    Returns:
        dict: {"summary": str, "impact_score": int}
    """
    prompt = f"""Analyze this financial news and provide:
1. A 2-sentence summary in English
2. An impact score (1-5) where:
   1 = Minor news, no market impact
   2 = Low impact, sector-specific
   3 = Moderate impact, could affect stock price
   4 = High impact, significant market news
   5 = Critical impact, major market-moving event

Title: {title}
Content: {content[:1000]}

Respond in JSON format:
{{"summary": "...", "impact_score": 3}}"""

    try:
        # Gemini 설정
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        result_text = response.text

        # JSON 파싱
        try:
            # Remove markdown code blocks if present
            if result_text.startswith('```'):
                result_text = result_text.split('```')[1]
                if result_text.startswith('json'):
                    result_text = result_text[4:]
                result_text = result_text.strip()

            result = json.loads(result_text)
            return {
                "summary": result.get("summary", "Unable to generate summary"),
                "impact_score": min(max(result.get("impact_score", 3), 1), 5)
            }
        except json.JSONDecodeError:
            # JSON 파싱 실패 시 기본값 반환
            return {
                "summary": result_text[:200] if len(result_text) > 0 else "Summary unavailable",
                "impact_score": 3
            }

    except Exception as e:
        print(f"Error summarizing news: {e}")
        return {
            "summary": f"{title[:100]}...",
            "impact_score": 3
        }

async def batch_summarize(news_list: list) -> list:
    """
    여러 뉴스를 일괄 요약

    Args:
        news_list: 뉴스 목록

    Returns:
        list: 요약된 뉴스 목록
    """
    results = []
    for news in news_list:
        summary_data = await summarize_news(news.get("title", ""), news.get("content", ""))
        news["summary"] = summary_data["summary"]
        news["impact_score"] = summary_data["impact_score"]
        results.append(news)
    return results

async def analyze_news_detailed(title: str, content: str, ticker: str = None) -> dict:
    """
    뉴스에 대한 상세한 AI 분석 수행

    Args:
        title: 뉴스 제목
        content: 뉴스 내용
        ticker: 주식 티커 (선택)

    Returns:
        dict: 시장 영향, 투자자 인사이트, AI 추천 포함
    """
    prompt = f"""Analyze this financial news comprehensively:

Title: {title}
Content: {content[:2000]}
Stock Ticker: {ticker if ticker else "General Market"}

Provide detailed analysis in JSON format with:

1. market_impact:
   - short_term: {{"volatility": "High/Medium/Low", "volume_change": "+X%", "sentiment": "Bullish/Neutral/Bearish"}}
   - long_term: {{"growth_potential": "Strong/Moderate/Weak", "sector_influence": "Widespread/Limited", "risk_level": "High/Moderate/Low"}}
   - sector_impacts: [{{"sector": "Technology", "change": "+8.5%", "description": "Direct positive impact..."}}]
   - market_sentiments: [{{"source": "Institutional Investors", "score": 88, "label": "Very Positive"}}]

2. investor_insights:
   - [{{"investor_type": "retail", "opportunities": [...], "risks": [...], "action_items": [...]}}]
   - [{{"investor_type": "institutional", "opportunities": [...], "risks": [...], "action_items": [...]}}]

3. ai_recommendation:
   - recommendation: "BUY/SELL/HOLD"
   - confidence: 92
   - target_price: 625.0 (optional)
   - risk_score: 6.5
   - hold_period: "6-12M"
   - reasoning: {{"bullish": [...], "bearish": [...], "technical": [...], "financial": [...]}}

Return ONLY valid JSON without markdown code blocks."""

    try:
        # Gemini 설정
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        result_text = response.text

        # JSON 파싱
        try:
            # Remove markdown code blocks if present
            if result_text.startswith('```'):
                result_text = result_text.split('```')[1]
                if result_text.startswith('json'):
                    result_text = result_text[4:]
                result_text = result_text.strip()

            result = json.loads(result_text)
            return result
        except json.JSONDecodeError as e:
            # JSON 파싱 실패 시 None 반환
            print(f"Failed to parse AI analysis response: {result_text[:200]}")
            print(f"JSON Error: {e}")
            return None

    except Exception as e:
        print(f"Error analyzing news: {e}")
        return None
