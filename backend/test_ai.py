#!/usr/bin/env python3
"""AI 요약 서비스 테스트"""
import asyncio
from app.services.ai_summarizer import summarize_news
from app.config import settings

# 테스트용 뉴스 데이터
TEST_NEWS = {
    "title": "Tesla Reports Record Q3 Deliveries, Stock Surges 15%",
    "content": """
    Tesla Inc. announced record-breaking third-quarter vehicle deliveries on Thursday,
    surpassing analyst expectations and sending shares up 15% in early trading.

    The electric vehicle manufacturer delivered 435,000 vehicles in Q3 2025,
    a 20% increase from the previous quarter and well above the 410,000 consensus estimate.

    CEO Elon Musk attributed the strong performance to improved production efficiency
    at the company's factories in Texas and China, as well as growing demand for
    the new Model 3 and Cybertruck.

    The company also announced plans to expand its Gigafactory in Berlin,
    which is expected to double production capacity by late 2026.

    Analysts are now revising their price targets upward, with several investment banks
    raising their targets to $350-400 per share, citing Tesla's dominance in the EV market
    and its growing energy storage business.
    """
}

async def test_ai_summary():
    print("="*60)
    print("🤖 AI 요약 서비스 테스트")
    print("="*60)

    # AI API 키 확인
    print("\n1️⃣  AI API 설정 확인...")
    if settings.perplexity_api_key:
        print(f"   ✅ Perplexity API 키 설정됨")
        api_configured = True
    elif settings.openai_api_key:
        print(f"   ✅ OpenAI API 키 설정됨")
        api_configured = True
    else:
        print(f"   ⚠️  AI API 키가 설정되지 않았습니다")
        print(f"   💡 .env 파일에 PERPLEXITY_API_KEY 또는 OPENAI_API_KEY를 추가하세요")
        api_configured = False

    if not api_configured:
        print("\n" + "="*60)
        print("⏭️  AI API 키 없이 테스트 스킵 (정상)")
        print("="*60)
        return

    # AI 요약 테스트
    print("\n2️⃣  뉴스 요약 생성 중...")
    print(f"\n   📰 원본 뉴스:")
    print(f"   제목: {TEST_NEWS['title']}")
    print(f"   내용: {TEST_NEWS['content'][:100]}...")

    try:
        print("\n   🤖 AI 요약 생성 중... (10-20초 소요)")
        result = await summarize_news(TEST_NEWS['title'], TEST_NEWS['content'])

        print(f"\n   ✅ 요약 완료!")
        print(f"\n   📝 요약:")
        print(f"   {result['summary']}")
        print(f"\n   🎯 영향도 점수: {result['impact_score']}/5")

        # 점수에 따른 설명
        score_desc = {
            1: "Minor news, no market impact",
            2: "Low impact, sector-specific",
            3: "Moderate impact, could affect stock price",
            4: "High impact, significant market news",
            5: "Critical impact, major market-moving event"
        }
        print(f"   💡 의미: {score_desc.get(result['impact_score'], 'N/A')}")

    except Exception as e:
        print(f"   ❌ 요약 실패: {e}")

    print("\n" + "="*60)
    print("✅ AI 요약 테스트 완료!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_ai_summary())
