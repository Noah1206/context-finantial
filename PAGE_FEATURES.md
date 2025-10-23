# 📊 Stock News Alert - 페이지별 기능 설명

**프로젝트**: 미국 주식 뉴스 AI 요약 + 알림 SaaS
**접속 URL**: http://localhost:3000

---

## 🏠 1. 랜딩 페이지 (`/`)

**URL**: http://localhost:3000

### 주요 섹션

#### 1) Hero 섹션
- **제목**: "Stock News Alert"
- **설명**: "AI-powered stock news aggregation with intelligent alerts"
- **CTA 버튼**:
  - "Get Started" → 대시보드로 이동
  - "Learn More" → 기능 섹션으로 스크롤

#### 2) Features 섹션 (3개 카드)
**📰 Multi-Source News**
- SEC Edgar (공식 공시)
- Yahoo Finance (뉴스)
- 소셜 미디어 집계

**🤖 AI Summarization**
- 2문장 요약
- 영향도 점수 (1-5점)
- Perplexity/OpenAI 지원

**🔔 Smart Alerts**
- 텔레그램 알림
- 이메일 알림
- 웹 푸시 (예정)

#### 3) Pricing 섹션 (3개 플랜)

**Free Plan - $0/월**
- 5개 종목 관심 목록
- 일일 이메일 다이제스트
- 기본 뉴스 피드

**Starter Plan - $9/월** ⭐ POPULAR
- 20개 종목 관심 목록
- 실시간 텔레그램 알림
- 모든 뉴스 소스 접근

**Pro Plan - $29/월**
- 무제한 종목
- 모든 알림 타입
- API 접근 권한

### 기능
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ 그라디언트 배경
- ✅ 검은색 border 스타일
- ✅ Hover 효과
- ❌ 실제 결제 연동 (미구현)

---

## 📈 2. 대시보드 (`/dashboard`)

**URL**: http://localhost:3000/dashboard

### 핵심 기능

#### 1) 헤더
- **타이틀**: "Stock News Dashboard"
- **네비게이션**:
  - Watchlist 버튼 → 관심 종목 페이지
  - Settings 버튼 → 설정 페이지

#### 2) 뉴스 피드
**데이터 표시**:
- 제목 (title)
- 요약 (summary) - AI 생성
- 출처 (source) - SEC Edgar, Yahoo Finance 등
- 날짜 (published_at)
- 영향도 점수 배지 (impact_score)

**점수 색상 코딩**:
- 🔴 **4-5점**: 빨간색 배경 (높은 영향도)
- 🟡 **3점**: 노란색 배경 (중간 영향도)
- 🟢 **1-2점**: 초록색 배경 (낮은 영향도)

**상태 처리**:
- ⏳ **로딩 중**: "Loading news..." 메시지
- 📭 **데이터 없음**:
  - 빈 상태 화면
  - "No news yet" 메시지
  - "Fetch News Now" 버튼 (아직 작동 안 함)
- ✅ **데이터 있음**: 뉴스 카드 리스트

**인터랙션**:
- 카드 hover 시 border가 2배로 두꺼워짐
- 20개 뉴스 표시 (기본값)

### API 연동
```typescript
// 백엔드 API 호출
GET /api/news?limit=20
```

### 현재 상태
- ✅ UI 완성
- ✅ API 연동 준비 완료
- ❌ 실제 데이터 없음 (DB에 뉴스 없음)
- ❌ "Fetch News Now" 버튼 미구현

---

## 📋 3. 관심 종목 (`/watchlist`)

**URL**: http://localhost:3000/watchlist

### 핵심 기능

#### 1) 헤더
- **타이틀**: "My Watchlist"
- **네비게이션**:
  - Dashboard 버튼 → 대시보드
  - Settings 버튼 → 설정

#### 2) 종목 추가 폼
**입력 필드**:
- **Stock Ticker** (필수)
  - 예시: AAPL, TSLA, NVDA
  - 대문자로 자동 변환
  - 플레이스홀더: "AAPL, TSLA, NVDA..."

- **Alert Threshold** (알림 임계값)
  - 1 - Low (낮은 중요도)
  - 2 - Medium-Low
  - 3 - Medium (기본값)
  - 4 - High (높은 중요도)
  - 5 - Critical (매우 중요)

**버튼**:
- "Add Stock" - 종목 추가
- "Adding..." (추가 중 로딩 상태)

**설명 텍스트**:
"You'll receive alerts when news for this stock has an impact score equal to or above your threshold."

#### 3) 관심 종목 목록
**표시 정보**:
- **티커 심볼** (대문자, 큰 글씨)
- **회사명** (stocks.company_name)
- **알림 임계값** (색상 코딩)
  - 🔴 4-5: 빨간색
  - 🟡 3: 노란색
  - 🟢 1-2: 초록색
- **추가 날짜** (created_at)
- **Remove 버튼** (빨간색)

**상태 처리**:
- ⏳ **로딩 중**: "Loading watchlist..." 메시지
- 📭 **데이터 없음**:
  - 빈 상태 화면
  - 📊 이모지
  - "No stocks in watchlist" 메시지
  - 안내 문구
- ✅ **데이터 있음**: 종목 카드 리스트

**인터랙션**:
- 카드 hover 시 border 두꺼워짐
- Remove 버튼 클릭 시 확인 대화상자
- 추가 성공 시 자동 리로드

### API 연동
```typescript
// 관심 목록 조회
GET /api/users/{userId}/stocks

// 종목 추가
POST /api/users/{userId}/stocks
Body: { stock_id, alert_threshold }

// 종목 삭제
DELETE /api/users/{userId}/stocks/{stockId}
```

### Mock 데이터
- 현재 userId: `00000000-0000-0000-0000-000000000001` (하드코딩)
- 실제 인증 시스템 미구현

### 현재 상태
- ✅ UI 완성
- ✅ API 연동 준비 완료
- ✅ CRUD 기능 구현 (Create, Read, Delete)
- ❌ 실제 데이터 없음 (DB에 종목 없음)
- ❌ 인증 시스템 없음

---

## ⚙️ 4. 설정 (`/settings`)

**URL**: http://localhost:3000/settings

### 핵심 기능

#### 1) 헤더
- **타이틀**: "Settings"
- **네비게이션**:
  - Dashboard 버튼
  - Watchlist 버튼

#### 2) Account Information (계정 정보)
**필드**:
- **Email Address** (이메일 입력)
  - 타입: email
  - 플레이스홀더: "your@email.com"

- **Current Plan** (현재 플랜)
  - 표시: "Free Plan"
  - 읽기 전용 (회색 배경)

#### 3) Notification Settings (알림 설정)

**이메일 알림**
- 토글 스위치 (ON/OFF)
- 기본값: ON
- 설명: "Receive alerts via email"

**텔레그램 알림**
- 토글 스위치 (ON/OFF)
- 기본값: OFF
- 설명: "Receive instant alerts on Telegram"

**텔레그램 Chat ID** (텔레그램 활성화 시만 표시)
- 입력 필드
- 플레이스홀더: "Your Telegram chat ID"
- 안내 문구: "To get your Chat ID, message our bot @StockNewsAlertBot and type /start"

#### 4) Alert Preferences (알림 선호도)

**최소 영향도 점수 선택**
- 드롭다운 선택
- 옵션:
  - 1 - All news (모든 뉴스)
  - 2 - Low importance and above
  - 3 - Medium importance and above
  - 4 - High importance and above
  - 5 - Critical only (매우 중요한 것만)
- 설명: "You can set individual thresholds for each stock in your watchlist"

**조용한 시간 (Quiet Hours)**
- 체크박스
- 설명: "Enable quiet hours (9 PM - 7 AM)"
- 기능: 밤 9시~아침 7시 알림 차단

#### 5) Danger Zone (위험 구역)
**빨간색 경고 영역**:
- **Clear All Watchlist Items**
  - 모든 관심 종목 삭제
  - 테두리 버튼

- **Delete Account**
  - 계정 삭제
  - 빨간색 버튼

#### 6) Save Button
- **"Save Settings"** 버튼
- 전체 폭
- 파란색 배경
- "Saving..." 로딩 상태

### API 연동
```typescript
// 사용자 설정 업데이트
PUT /api/users/{userId}
Body: {
  email: string,
  telegram_id: string | null,
  enable_email_alerts: boolean,
  enable_telegram_alerts: boolean
}
```

### 토글 스위치 디자인
- 커스텀 CSS 구현
- 회색(OFF) ↔ 파란색(ON)
- 애니메이션 효과
- 접근성 지원 (sr-only 라벨)

### 현재 상태
- ✅ UI 완성
- ✅ API 연동 준비 완료
- ✅ 폼 검증
- ✅ 로딩 상태
- ❌ 실제 데이터 저장 안 됨 (테스트 필요)
- ❌ Danger Zone 버튼 미구현

---

## 🔄 페이지 간 네비게이션

### 네비게이션 흐름
```
랜딩 페이지 (/)
    ↓ "Get Started"
대시보드 (/dashboard)
    ↔ Watchlist (/watchlist)
    ↔ Settings (/settings)
```

### 헤더 네비게이션
- **대시보드**: Watchlist, Settings
- **Watchlist**: Dashboard, Settings
- **Settings**: Dashboard, Watchlist

---

## 🎨 공통 디자인 시스템

### 색상
- **Primary**: Blue-600 (#2563eb)
- **Success**: Green-600/700
- **Warning**: Yellow-600/700
- **Danger**: Red-600/700
- **Background**: Slate-50
- **Border**: Black (검은색)

### 타이포그래피
- **Page Title**: text-2xl, font-bold
- **Section Title**: text-xl, font-semibold
- **Body**: text-base, text-slate-600
- **Small**: text-sm, text-slate-500

### 컴포넌트
- **카드**: bg-white, rounded-lg, border border-black
- **Hover**: border-2 (두꺼워짐)
- **버튼**: rounded-lg, px-6 py-3
- **입력**: border border-slate-300, focus:ring-2

### 레이아웃
- **Container**: max-w-6xl (랜딩), max-w-2xl (설정)
- **Spacing**: px-4 py-8
- **Grid**: md:grid-cols-3 (Features, Pricing)

---

## 🔌 API 엔드포인트 매핑

### 뉴스 관련
- `GET /api/news?limit=20&min_score=3` → 대시보드
- `GET /api/news/{id}` → 뉴스 상세 (미구현)
- `GET /api/news/stocks/{ticker}` → 종목별 뉴스 (미구현)

### 관심 종목 관련
- `GET /api/users/{userId}/stocks` → Watchlist 조회
- `POST /api/users/{userId}/stocks` → 종목 추가
- `DELETE /api/users/{userId}/stocks/{stockId}` → 종목 삭제

### 사용자 관련
- `PUT /api/users/{userId}` → 설정 저장
- `POST /api/auth/register` → 회원가입 (미구현)
- `POST /api/auth/login` → 로그인 (미구현)

### 알림 관련
- `GET /api/alerts` → 알림 목록 (미구현)
- `PUT /api/alerts/{alertId}/read` → 알림 읽음 처리 (미구현)

---

## ✅ 구현 완료 항목

### Frontend
- ✅ 랜딩 페이지 (Hero, Features, Pricing)
- ✅ 대시보드 (뉴스 피드)
- ✅ 관심 종목 관리 (CRUD)
- ✅ 설정 페이지 (알림 설정)
- ✅ 반응형 디자인
- ✅ 로딩/에러 상태
- ✅ API 클라이언트
- ✅ 검은색 border 스타일

### Backend
- ✅ FastAPI 서버
- ✅ Supabase 연동
- ✅ 13개 API 엔드포인트
- ✅ JWT 인증
- ✅ 뉴스 스크래퍼 (SEC Edgar, Yahoo Finance)
- ✅ AI 요약 (Perplexity/OpenAI)
- ✅ 알림 서비스 (Telegram, Email)

---

## 🚧 미구현 항목

### Frontend
- ❌ 로그인/회원가입 UI
- ❌ 인증 컨텍스트 (AuthContext)
- ❌ Protected Routes
- ❌ 뉴스 상세 페이지
- ❌ 실시간 알림 표시
- ❌ "Fetch News Now" 버튼 기능
- ❌ Danger Zone 버튼 기능

### Backend
- ❌ 스케줄러 (자동 뉴스 수집)
- ❌ 실제 AI API 키 설정
- ❌ 실시간 알림 발송
- ❌ 웹소켓 (실시간 업데이트)

### Database
- ❌ 샘플 뉴스 데이터
- ❌ 샘플 주식 데이터 (AAPL, TSLA 등)
- ❌ 샘플 사용자 데이터

---

## 🧪 테스트 방법

### 1. 서버 실행 확인
```bash
# 백엔드 확인
curl http://localhost:8000/health
# 응답: {"status":"healthy"}

# 프론트엔드 확인
# 브라우저에서 http://localhost:3000 접속
```

### 2. 각 페이지 테스트
1. **랜딩 페이지**: http://localhost:3000
   - Features 카드 3개 표시 확인
   - Pricing 플랜 3개 표시 확인
   - "Get Started" 버튼 클릭 → 대시보드 이동

2. **대시보드**: http://localhost:3000/dashboard
   - "No news yet" 빈 상태 확인
   - Watchlist, Settings 버튼 작동 확인

3. **Watchlist**: http://localhost:3000/watchlist
   - 종목 추가 폼 표시 확인
   - "No stocks in watchlist" 빈 상태 확인
   - (데이터 있을 시) 종목 카드 표시 확인

4. **Settings**: http://localhost:3000/settings
   - 계정 정보 폼 표시 확인
   - 토글 스위치 작동 확인
   - Save 버튼 클릭 확인

### 3. API 테스트
```bash
# 뉴스 조회 (빈 배열 반환 예상)
curl http://localhost:8000/api/news

# 관심 목록 조회
curl http://localhost:8000/api/users/00000000-0000-0000-0000-000000000001/stocks

# API 문서 확인
# 브라우저에서 http://localhost:8000/docs 접속
```

---

## 📞 다음 단계

### Phase 4: 데이터 입력
1. Supabase에 샘플 주식 추가
   - AAPL, TSLA, NVDA, MSFT, GOOGL
2. 스크래퍼 실행으로 뉴스 수집
3. AI 요약 실행 (API 키 필요)

### Phase 5: 스케줄러
1. APScheduler 설정
2. 30분마다 뉴스 수집
3. 자동 AI 요약
4. 자동 알림 발송

### Phase 6: 인증
1. 로그인/회원가입 UI
2. JWT 토큰 관리
3. Protected Routes
4. 사용자별 데이터 분리

### Phase 7: 배포
1. Vercel (프론트엔드)
2. Railway/AWS (백엔드)
3. 도메인 연결
4. HTTPS 설정

---

**작성일**: 2025-10-18
**서버 상태**: ✅ Running (Backend: :8000, Frontend: :3000)
**파비콘**: 📈 (주식 차트)
