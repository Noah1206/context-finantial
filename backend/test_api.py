#!/usr/bin/env python3
"""API 기능 테스트 스크립트"""
import asyncio
from app.database import db, create_user, get_user_by_email, get_news_list
from app.scrapers.yahoo_finance import fetch_news_rss
from app.services.ai_summarizer import summarize_news

async def main():
    print("="*60)
    print("🧪 API 기능 테스트 시작")
    print("="*60)

    # 1. 데이터베이스 연결 테스트
    print("\n1️⃣  데이터베이스 연결 테스트...")
    try:
        client = db.get_client()
        print("   ✅ Supabase 연결 성공!")
    except Exception as e:
        print(f"   ❌ 데이터베이스 연결 실패: {e}")
        return

    # 2. 사용자 조회 테스트
    print("\n2️⃣  사용자 테이블 조회...")
    try:
        response = client.table("users").select("id, email, plan").limit(3).execute()
        if response.data:
            print(f"   ✅ 사용자 {len(response.data)}명 조회됨")
            for user in response.data:
                print(f"      - {user['email']} ({user['plan']})")
        else:
            print("   ℹ️  등록된 사용자 없음")
    except Exception as e:
        print(f"   ⚠️  사용자 조회 실패: {e}")

    # 3. 주식 데이터 확인
    print("\n3️⃣  주식 테이블 조회...")
    try:
        response = client.table("stocks").select("ticker, company_name").limit(5).execute()
        if response.data:
            print(f"   ✅ 주식 {len(response.data)}개 등록됨")
            for stock in response.data:
                print(f"      - {stock['ticker']}: {stock['company_name']}")
        else:
            print("   ℹ️  등록된 주식 없음")
    except Exception as e:
        print(f"   ⚠️  주식 조회 실패: {e}")

    print("\n" + "="*60)
    print("✅ 데이터베이스 테스트 완료!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
