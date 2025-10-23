# Quick Start Guide

빠른 개발 시작을 위한 가이드입니다.

---

## 📚 문서 구조

프로젝트를 시작하기 전에 다음 문서들을 확인하세요:

1. **[README.md](./README.md)** - 프로젝트 개요 및 기본 설정
2. **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - 전체 아키텍처 및 상세 설계
3. **[COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md)** - 모든 컴포넌트, ID, 클래스 레퍼런스
4. **[API_REFERENCE.md](./API_REFERENCE.md)** - API 엔드포인트 완전 문서화
5. **[QUICK_START.md](./QUICK_START.md)** - 이 문서 (빠른 시작 가이드)

---

## 🎯 MVP 개발 단계

### Phase 1: 프로젝트 초기화 (현재 단계)
✅ 문서화 완료
- [x] 프로젝트 구조 설계
- [x] 데이터베이스 스키마 설계
- [x] API 엔드포인트 설계
- [x] 컴포넌트 구조 설계

**다음 단계**: 디렉토리 구조 생성 및 기본 설정

---

### Phase 2: 백엔드 기반 구축
**목표**: FastAPI 서버 + Supabase 연결 + 기본 인증

#### 작업 목록
```bash
# 1. 백엔드 디렉토리 구조 생성
mkdir -p backend/app/{models,routers,services,scrapers,utils}
cd backend

# 2. Python 가상환경 설정
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 필수 패키지 설치
pip install fastapi uvicorn supabase httpx python-dotenv pydantic pydantic-settings

# 4. requirements.txt 생성
pip freeze > requirements.txt

# 5. 기본 파일 생성
touch app/{__init__,main,config,database}.py
touch app/models/{__init__,user,news,alert,stock}.py
touch app/routers/{__init__,auth,users,news,alerts}.py
```

#### 핵심 코드 작성
1. `app/main.py` - FastAPI 앱 진입점
2. `app/config.py` - 환경변수 관리
3. `app/database.py` - Supabase 클라이언트
4. `app/routers/auth.py` - 회원가입/로그인

**완료 기준**:
- FastAPI 서버 실행 성공
- Supabase 연결 확인
- 회원가입/로그인 API 동작

---

### Phase 3: 데이터베이스 구축
**목표**: Supabase에서 테이블 생성 및 관계 설정

#### Supabase 설정
1. [Supabase](https://supabase.com) 계정 생성
2. 새 프로젝트 생성
3. SQL Editor에서 스키마 실행

#### 스키마 생성
```sql
-- users 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_id VARCHAR(100),
    plan VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- stocks 테이블
CREATE TABLE stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker VARCHAR(10) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- user_stocks 테이블
CREATE TABLE user_stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
    alert_threshold INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, stock_id)
);

-- news 테이블
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL,
    stock_id UUID REFERENCES stocks(id),
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    impact_score INTEGER,
    url TEXT,
    published_at TIMESTAMP,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- alerts 테이블
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    news_id UUID REFERENCES news(id) ON DELETE CASCADE,
    alert_type VARCHAR(20),
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_stock_id ON news(stock_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_user_stocks_user_id ON user_stocks(user_id);
```

**완료 기준**:
- 모든 테이블 생성 완료
- 외래키 제약조건 설정 완료
- 인덱스 생성 완료

---

### Phase 4: 뉴스 수집 (Data Scraping)
**목표**: SEC Edgar, Yahoo Finance에서 뉴스 수집

#### 작업 목록
```bash
# 패키지 설치
pip install beautifulsoup4 feedparser yfinance requests-html

# 스크래퍼 파일 생성
touch app/scrapers/{sec_edgar,yahoo_finance}.py
```

#### SEC Edgar 스크래퍼 (예시)
```python
# app/scrapers/sec_edgar.py
import httpx
from bs4 import BeautifulSoup

async def fetch_recent_filings(ticker: str, filing_type: str = "8-K"):
    """
    SEC Edgar에서 최근 공시 가져오기
    filing_type: 10-K, 10-Q, 8-K
    """
    url = f"https://www.sec.gov/cgi-bin/browse-edgar"
    params = {
        "action": "getcompany",
        "CIK": ticker,
        "type": filing_type,
        "dateb": "",
        "owner": "exclude",
        "count": 10
    }

    headers = {
        "User-Agent": "your-email@example.com"  # SEC 요구사항
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
        # 파싱 로직 구현
        return response.text
```

**완료 기준**:
- SEC Edgar에서 10-K, 10-Q, 8-K 수집 가능
- Yahoo Finance 뉴스 RSS 파싱 성공
- 수집된 데이터 DB 저장 확인

---

### Phase 5: AI 요약 통합
**목표**: Perplexity Pro API로 뉴스 요약 및 점수화

#### 작업 목록
```bash
# Perplexity API 클라이언트 설치
pip install openai  # Perplexity는 OpenAI 호환 API 사용

# 서비스 파일 생성
touch app/services/ai_summarizer.py
```

#### AI Summarizer (예시)
```python
# app/services/ai_summarizer.py
from openai import OpenAI

client = OpenAI(
    api_key="your-perplexity-api-key",
    base_url="https://api.perplexity.ai"
)

async def summarize_news(title: str, content: str) -> dict:
    """
    뉴스 요약 및 영향도 점수 생성
    Returns: {"summary": str, "impact_score": int}
    """
    prompt = f"""
    Analyze this financial news and provide:
    1. A 2-sentence summary
    2. An impact score (1-5) where:
       1 = Minor news, no market impact
       2 = Low impact, sector-specific
       3 = Moderate impact, could affect stock price
       4 = High impact, significant market news
       5 = Critical impact, major market-moving event

    Title: {title}
    Content: {content[:1000]}  # 토큰 절약

    Respond in JSON format:
    {{"summary": "...", "impact_score": 3}}
    """

    response = client.chat.completions.create(
        model="llama-3.1-sonar-large-128k-online",
        messages=[{"role": "user", "content": prompt}]
    )

    # JSON 파싱 및 반환
    return response.choices[0].message.content
```

**완료 기준**:
- Perplexity API 연결 성공
- 뉴스 요약 생성 확인
- 영향도 점수(1-5) 자동 생성

---

### Phase 6: 알림 시스템
**목표**: Telegram Bot + Email 알림 구현

#### Telegram Bot 설정
```bash
# 1. @BotFather에게 /newbot 명령으로 봇 생성
# 2. Bot Token 획득
# 3. 패키지 설치
pip install python-telegram-bot

# 4. 서비스 파일 생성
touch app/services/alert_sender.py
```

#### Email (SendGrid) 설정
```bash
pip install sendgrid
```

**완료 기준**:
- Telegram 봇 생성 및 메시지 전송 성공
- SendGrid 이메일 전송 성공
- 관심 종목 + 임계값 기반 알림 트리거 동작

---

### Phase 7: 프론트엔드 개발
**목표**: Next.js 대시보드 구현

#### 프로젝트 초기화
```bash
# 프론트엔드 디렉토리 생성
npx create-next-app@latest frontend --typescript --tailwind --app

cd frontend

# Supabase 클라이언트 설치
npm install @supabase/supabase-js

# UI 라이브러리 (선택사항)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react  # 아이콘
```

#### 주요 페이지 생성
```
src/app/
├── page.tsx              # 홈페이지
├── dashboard/page.tsx    # 대시보드
├── watchlist/page.tsx    # 관심 종목
└── settings/page.tsx     # 설정
```

**완료 기준**:
- Next.js 서버 실행 성공
- Supabase Auth 로그인 동작
- 관심 종목 추가/삭제 기능
- 뉴스 피드 표시

---

### Phase 8: 배포
**목표**: Vercel (프론트엔드) + AWS/Railway (백엔드)

#### Vercel 배포 (프론트엔드)
```bash
cd frontend
npm install -g vercel
vercel login
vercel  # 배포 시작
```

#### Railway 배포 (백엔드) - 추천
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인 및 배포
railway login
railway init
railway up
```

**완료 기준**:
- 프론트엔드 Vercel 배포 성공
- 백엔드 Railway/AWS 배포 성공
- HTTPS 도메인 연결
- 환경변수 설정 완료

---

## 🔧 개발 도구 설정

### VS Code Extensions (권장)
- Python (Microsoft)
- Pylance
- ESLint
- Tailwind CSS IntelliSense
- Prisma (선택사항)

### 환경변수 템플릿

#### backend/.env
```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# AI API
PERPLEXITY_API_KEY=your_perplexity_key

# External APIs
SEC_EDGAR_USER_AGENT=your-email@example.com
YAHOO_FINANCE_API_KEY=optional

# Notifications
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
SENDGRID_API_KEY=your_sendgrid_key

# App
ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-here
```

#### frontend/.env.local
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 실행 명령어

### 백엔드
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### 프론트엔드
```bash
cd frontend
npm run dev  # http://localhost:3000
```

### 동시 실행 (선택사항)
```bash
# concurrently 설치
npm install -g concurrently

# package.json에 스크립트 추가
concurrently "cd backend && uvicorn app.main:app --reload" "cd frontend && npm run dev"
```

---

## 📝 다음 단계

1. ✅ 문서 검토 완료
2. [ ] Supabase 프로젝트 생성
3. [ ] 백엔드 디렉토리 구조 생성
4. [ ] 데이터베이스 스키마 실행
5. [ ] FastAPI 기본 서버 구축
6. [ ] 뉴스 수집 스크래퍼 구현
7. [ ] AI 요약 통합
8. [ ] 알림 시스템 구현
9. [ ] 프론트엔드 개발
10. [ ] 테스트 및 배포

---

## 💡 개발 팁

### 효율적인 개발 순서
1. **백엔드 우선**: API를 먼저 완성하면 프론트엔드 개발이 수월
2. **데이터 수집 자동화**: cron job보다 APScheduler 권장 (Python 환경)
3. **AI API 비용**: Batch 처리로 호출 최소화
4. **Supabase Realtime**: 실시간 알림에 활용 가능
5. **테스트**: Postman으로 API 테스트 먼저, 프론트 나중에

### 비용 최적화
- **AI API**: 중요 뉴스만 요약 (source filtering)
- **DB**: Supabase Free Tier (500MB, 충분)
- **호스팅**: Railway/Render Free Tier 활용
- **Email**: SendGrid Free Tier (100 emails/day)

---

**준비 완료!** 이제 Phase 2부터 시작하세요! 🚀
