# 사용자 액션 가이드

**현재 상태**: 백엔드 기본 구조 완성 ✅
**다음 단계**: API 키 발급 및 설정

---

## 🔑 필수 작업: API 키 발급

### 1. Supabase 프로젝트 생성 (5분)

**URL**: https://supabase.com

**단계**:
```
1. Supabase 계정 생성/로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: stock-news-saas
   - Database Password: [안전한 비밀번호 생성 후 저장]
   - Region: Northeast Asia (Seoul) 또는 가까운 지역
4. "Create new project" 클릭 (2-3분 소요)
```

**필요한 정보 복사**:
```
생성 완료 후:
1. Settings → API 메뉴 이동
2. Project URL 복사
   예: https://abcdefghijk.supabase.co
3. API Keys에서:
   - anon public 키 복사
   - service_role 키 복사 (⚠️ 절대 프론트엔드에 노출 금지!)
```

**backend/.env 파일에 입력**:
```bash
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. Perplexity Pro API 키 발급 (10분) - 추천

**URL**: https://www.perplexity.ai/

**단계**:
```
1. Perplexity 계정 생성/로그인
2. Pro 구독 ($20/month)
   - 무제한 Pro 검색
   - API 액세스 포함
3. Settings → API Keys
4. "Create New Key" 클릭
5. API 키 복사
```

**backend/.env 파일에 입력**:
```bash
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**💡 대안: OpenAI API** (Perplexity 없을 경우)
- URL: https://platform.openai.com/api-keys
- 비용: 약 $0.01/1K tokens (GPT-4 기준)
- 더 비싸지만 안정적

```bash
# .env 파일에
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 3. 데이터베이스 스키마 생성 (3분)

**Supabase SQL Editor에서 실행**:

```
1. Supabase 대시보드 → SQL Editor
2. "New query" 클릭
3. 아래 SQL 복사해서 붙여넣기
4. "Run" 버튼 클릭
```

**SQL 코드**:
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

-- user_stocks 테이블 (관심 종목)
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

-- 샘플 주식 데이터 추가
INSERT INTO stocks (ticker, company_name, sector) VALUES
('AAPL', 'Apple Inc.', 'Technology'),
('TSLA', 'Tesla, Inc.', 'Automotive'),
('NVDA', 'NVIDIA Corporation', 'Technology'),
('MSFT', 'Microsoft Corporation', 'Technology'),
('GOOGL', 'Alphabet Inc.', 'Technology');
```

**확인 방법**:
- Table Editor → users, stocks, news 등 테이블이 보이면 성공!

---

## ✅ 체크리스트

작업을 완료하면 체크하세요:

```
[ ] 1. Supabase 프로젝트 생성 완료
[ ] 2. Supabase URL & API Keys 복사 완료
[ ] 3. backend/.env 파일에 Supabase 설정 입력
[ ] 4. Perplexity Pro 가입 (또는 OpenAI)
[ ] 5. AI API 키를 backend/.env에 입력
[ ] 6. Supabase SQL Editor에서 스키마 실행
[ ] 7. Table Editor에서 테이블 생성 확인
```

---

## 🧪 테스트 방법

**모든 설정을 완료한 후**:

### 1. 서버 실행
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

### 2. API 문서 확인
브라우저에서 열기:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

### 3. 헬스체크
```bash
curl http://localhost:8000/health
```

**예상 응답**:
```json
{"status":"healthy"}
```

---

## 🚨 문제 해결

### 에러: "SUPABASE_URL is required"
→ `.env` 파일에 Supabase 설정이 없거나 잘못됨
→ `.env.example` 참고해서 다시 입력

### 에러: "Neither Perplexity nor OpenAI API key"
→ AI API 키가 없음
→ PERPLEXITY_API_KEY 또는 OPENAI_API_KEY 중 하나 입력

### 서버가 안 켜져요
→ 가상환경 활성화 확인: `source venv/bin/activate`
→ 패키지 설치 확인: `pip install -r requirements.txt`

---

## 📞 완료 후

모든 설정이 끝나면 다음과 같이 말씀해주세요:

```
"설정 완료했어요! 다음 단계 진행해주세요"
```

그러면 제가:
1. 데이터베이스 연결 테스트
2. Pydantic 모델 구현
3. 회원가입/로그인 API 구현
4. 뉴스 수집 스크래퍼 구현

을 진행하겠습니다!

---

## 💡 참고 사항

### 비용 예상
- **Supabase**: 무료 플랜 (500MB DB, 충분함)
- **Perplexity Pro**: $20/month
- **또는 OpenAI**: 종량제 (약 $5-10/month 예상)

### 개발 팁
- `.env` 파일은 절대 Git에 올리지 마세요!
- API 키는 절대 프론트엔드 코드에 넣지 마세요!
- 테스트용 계정은 `test@example.com` 같은 걸로 사용

---

**준비되셨나요?** 🚀

설정 중 막히는 부분이 있으면 언제든 물어보세요!
