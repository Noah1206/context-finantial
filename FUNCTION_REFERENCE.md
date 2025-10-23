# 기능-함수 참조 문서 (Function Reference)

이 문서는 프로젝트의 모든 주요 기능과 함수를 정리한 참조 가이드입니다.
비슷한 기능을 구현할 때 이 문서를 참고하세요.

**생성일**: 2025-10-18
**프로젝트**: Stock News Alert API

---

## 📚 목차

1. [인증 (Authentication)](#인증-authentication)
2. [사용자 관리 (User Management)](#사용자-관리-user-management)
3. [데이터베이스 CRUD](#데이터베이스-crud)
4. [뉴스 수집 (News Scraping)](#뉴스-수집-news-scraping)
5. [AI 요약 (AI Summarization)](#ai-요약-ai-summarization)
6. [알림 발송 (Alert Sending)](#알림-발송-alert-sending)
7. [API 라우터](#api-라우터)
8. [Pydantic 모델](#pydantic-모델)

---

## 인증 (Authentication)

### 비밀번호 해싱
**파일**: `backend/app/routers/auth.py`
**함수**: `hash_password(password: str) -> str`

```python
def hash_password(password: str) -> str:
    """SHA256으로 비밀번호 해싱"""
    return hashlib.sha256(password.encode()).hexdigest()
```

**사용 예시**:
```python
hashed = hash_password("my_password123")
```

---

### 비밀번호 검증
**파일**: `backend/app/routers/auth.py`
**함수**: `verify_password(plain_password: str, hashed_password: str) -> bool`

```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호와 해시 비교"""
    return hash_password(plain_password) == hashed_password
```

**사용 예시**:
```python
is_valid = verify_password("user_input", stored_hash)
```

---

### JWT 토큰 생성
**파일**: `backend/app/routers/auth.py`
**함수**: `create_access_token(user_id: str, email: str) -> str`

```python
def create_access_token(user_id: str, email: str) -> str:
    """JWT 액세스 토큰 생성 (7일 만료)"""
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
```

**사용 예시**:
```python
token = create_access_token("user-uuid", "user@example.com")
```

---

### 회원가입 API
**파일**: `backend/app/routers/auth.py`
**엔드포인트**: `POST /api/auth/register`
**함수**: `register(user_data: UserCreate)`

```python
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    # 1. 이메일 중복 체크
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. 비밀번호 해싱
    hashed_pw = hash_password(user_data.password)

    # 3. 사용자 생성
    user = await create_user(email=user_data.email, password_hash=hashed_pw, plan="free")

    # 4. JWT 토큰 발급
    access_token = create_access_token(user["id"], user["email"])

    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse(**user)}
```

---

### 로그인 API
**파일**: `backend/app/routers/auth.py`
**엔드포인트**: `POST /api/auth/login`
**함수**: `login(credentials: UserLogin)`

```python
@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    # 1. 사용자 조회
    user = await get_user_by_email(credentials.email)

    # 2. 비밀번호 검증
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 3. JWT 토큰 발급
    access_token = create_access_token(user["id"], user["email"])

    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse(**user)}
```

---

## 사용자 관리 (User Management)

### 사용자 프로필 조회
**파일**: `backend/app/routers/users.py`
**엔드포인트**: `GET /api/users/{user_id}`
**함수**: `get_user(user_id: str)`

```python
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)
```

---

### 관심 종목 추가
**파일**: `backend/app/routers/users.py`
**엔드포인트**: `POST /api/users/{user_id}/stocks`
**함수**: `add_stock_to_watchlist(user_id: str, stock_data: UserStockCreate)`

```python
@router.post("/{user_id}/stocks")
async def add_stock_to_watchlist(user_id: str, stock_data: UserStockCreate):
    result = await add_to_watchlist(user_id, stock_data.ticker, stock_data.alert_threshold)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to add stock")
    return result
```

---

### 관심 종목 조회
**파일**: `backend/app/routers/users.py`
**엔드포인트**: `GET /api/users/{user_id}/stocks`
**함수**: `get_user_watchlist(user_id: str)`

```python
@router.get("/{user_id}/stocks", response_model=List[dict])
async def get_user_watchlist(user_id: str):
    return await get_watchlist(user_id)
```

---

## 데이터베이스 CRUD

### 사용자 생성
**파일**: `backend/app/database.py`
**함수**: `create_user(email: str, password_hash: str, **kwargs) -> dict`

```python
async def create_user(email: str, password_hash: str, **kwargs) -> dict:
    """
    Supabase users 테이블에 사용자 생성

    Args:
        email: 이메일
        password_hash: 해시된 비밀번호
        **kwargs: plan, telegram_id 등 추가 필드

    Returns:
        dict: 생성된 사용자 정보
    """
    user_data = {"email": email, "password_hash": password_hash, **kwargs}
    response = db.client.table("users").insert(user_data).execute()
    return response.data[0] if response.data else None
```

**사용 예시**:
```python
user = await create_user("test@example.com", "hashed_password", plan="free")
```

---

### 이메일로 사용자 조회
**파일**: `backend/app/database.py`
**함수**: `get_user_by_email(email: str) -> Optional[dict]`

```python
async def get_user_by_email(email: str) -> Optional[dict]:
    """이메일로 사용자 조회"""
    try:
        response = db.client.table("users").select("*").eq("email", email).execute()
        return response.data[0] if response.data else None
    except:
        return None
```

---

### 관심 종목 추가
**파일**: `backend/app/database.py`
**함수**: `add_to_watchlist(user_id: str, ticker: str, alert_threshold: int = 3) -> dict`

```python
async def add_to_watchlist(user_id: str, ticker: str, alert_threshold: int = 3) -> dict:
    """
    사용자 관심 종목에 주식 추가

    Args:
        user_id: 사용자 UUID
        ticker: 주식 티커 (예: AAPL)
        alert_threshold: 알림 임계값 (1-5)

    Returns:
        dict: 추가된 관심 종목 정보
    """
    # 1. ticker로 stock_id 찾기
    stock = await get_stock_by_ticker(ticker)
    if not stock:
        return None

    # 2. user_stocks 테이블에 추가
    data = {"user_id": user_id, "stock_id": stock["id"], "alert_threshold": alert_threshold}
    response = db.client.table("user_stocks").insert(data).execute()
    return response.data[0] if response.data else None
```

---

### 뉴스 목록 조회
**파일**: `backend/app/database.py`
**함수**: `get_news_list(limit: int = 20, offset: int = 0, min_score: int = None) -> List[dict]`

```python
async def get_news_list(limit: int = 20, offset: int = 0, min_score: int = None) -> List[dict]:
    """
    뉴스 목록 조회 (페이지네이션 지원)

    Args:
        limit: 한 페이지당 개수
        offset: 페이지 시작 위치
        min_score: 최소 영향도 점수 필터

    Returns:
        List[dict]: 뉴스 목록
    """
    try:
        query = db.client.table("news").select("*, stocks(*)")

        if min_score:
            query = query.gte("impact_score", min_score)

        response = query.order("published_at", desc=True).range(offset, offset + limit - 1).execute()
        return response.data if response.data else []
    except:
        return []
```

**사용 예시**:
```python
# 최근 20개 뉴스
news = await get_news_list(limit=20, offset=0)

# 영향도 4 이상 뉴스만
important_news = await get_news_list(limit=10, min_score=4)
```

---

## 뉴스 수집 (News Scraping)

### SEC Edgar 공시 수집
**파일**: `backend/app/scrapers/sec_edgar.py`
**함수**: `fetch_recent_filings(ticker: str, filing_type: str = "8-K", count: int = 10) -> List[Dict]`

```python
async def fetch_recent_filings(ticker: str, filing_type: str = "8-K", count: int = 10) -> List[Dict]:
    """
    SEC Edgar에서 최근 공시 가져오기

    Args:
        ticker: 주식 티커
        filing_type: 공시 유형 (10-K, 10-Q, 8-K)
        count: 가져올 개수

    Returns:
        List[Dict]: 공시 목록
            - source: "sec"
            - title: 제목
            - content: 내용
            - url: SEC Edgar 링크
            - published_at: 발행일
    """
    url = "https://www.sec.gov/cgi-bin/browse-edgar"
    params = {
        "action": "getcompany",
        "CIK": ticker,
        "type": filing_type,
        "count": count
    }

    headers = {"User-Agent": settings.sec_edgar_user_agent}

    # httpx로 요청 → BeautifulSoup로 파싱
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        # ... 파싱 로직
```

**사용 예시**:
```python
# Apple의 최근 8-K 공시 5개
filings = await fetch_recent_filings("AAPL", "8-K", 5)

# Tesla의 10-Q (분기 보고서)
quarterly = await fetch_recent_filings("TSLA", "10-Q", 2)
```

---

### Yahoo Finance 뉴스 수집
**파일**: `backend/app/scrapers/yahoo_finance.py`
**함수**: `fetch_news_rss(ticker: str = None) -> List[Dict]`

```python
async def fetch_news_rss(ticker: str = None) -> List[Dict]:
    """
    Yahoo Finance RSS에서 뉴스 가져오기

    Args:
        ticker: 주식 티커 (None이면 전체 시장 뉴스)

    Returns:
        List[Dict]: 뉴스 목록
            - source: "yahoo"
            - title: 제목
            - content: 요약
            - url: 기사 링크
            - published_at: 발행일
    """
    if ticker:
        url = f"https://finance.yahoo.com/rss/headline?s={ticker}"
    else:
        url = "https://finance.yahoo.com/news/rssindex"

    # httpx로 요청 → feedparser로 RSS 파싱
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        feed = feedparser.parse(response.text)
        # ... 파싱 로직
```

**사용 예시**:
```python
# NVIDIA 관련 뉴스
nvda_news = await fetch_news_rss("NVDA")

# 전체 시장 뉴스
market_news = await fetch_news_rss(None)
```

---

## AI 요약 (AI Summarization)

### 뉴스 요약 및 점수화
**파일**: `backend/app/services/ai_summarizer.py`
**함수**: `summarize_news(title: str, content: str) -> dict`

```python
async def summarize_news(title: str, content: str) -> dict:
    """
    Perplexity Pro API로 뉴스 요약 및 영향도 점수 생성

    Args:
        title: 뉴스 제목
        content: 뉴스 내용

    Returns:
        dict: {
            "summary": "2문장 요약",
            "impact_score": 1-5 사이 점수
        }
    """
    prompt = f"""Analyze this financial news...
    Title: {title}
    Content: {content[:1000]}

    Respond in JSON: {{"summary": "...", "impact_score": 3}}"""

    response = client.chat.completions.create(
        model=settings.get_ai_model_name(),
        messages=[{"role": "user", "content": prompt}]
    )

    result = json.loads(response.choices[0].message.content)
    return result
```

**사용 예시**:
```python
summary = await summarize_news(
    "Apple announces new MacBook Pro",
    "Apple today unveiled its latest MacBook Pro..."
)
# → {"summary": "...", "impact_score": 4}
```

---

### 배치 요약
**파일**: `backend/app/services/ai_summarizer.py`
**함수**: `batch_summarize(news_list: list) -> list`

```python
async def batch_summarize(news_list: list) -> list:
    """
    여러 뉴스를 한번에 요약

    Args:
        news_list: 뉴스 목록

    Returns:
        list: summary와 impact_score가 추가된 뉴스 목록
    """
    results = []
    for news in news_list:
        summary_data = await summarize_news(news["title"], news["content"])
        news["summary"] = summary_data["summary"]
        news["impact_score"] = summary_data["impact_score"]
        results.append(news)
    return results
```

**사용 예시**:
```python
news_list = await fetch_news_rss("AAPL")
summarized_news = await batch_summarize(news_list)
```

---

## 알림 발송 (Alert Sending)

### Telegram 알림
**파일**: `backend/app/services/alert_sender.py`
**함수**: `send_telegram_alert(telegram_id: str, message: str, bot_token: str) -> bool`

```python
async def send_telegram_alert(telegram_id: str, message: str, bot_token: str) -> bool:
    """
    Telegram Bot으로 알림 전송

    Args:
        telegram_id: 사용자 Telegram Chat ID
        message: 전송할 메시지 (Markdown 지원)
        bot_token: Telegram Bot Token

    Returns:
        bool: 전송 성공 여부
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": telegram_id,
        "text": message,
        "parse_mode": "Markdown"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        return response.status_code == 200
```

**사용 예시**:
```python
success = await send_telegram_alert(
    "123456789",
    "*Breaking News*\nApple releases new product!",
    "your-bot-token"
)
```

---

### 이메일 알림
**파일**: `backend/app/services/alert_sender.py`
**함수**: `send_email_alert(email: str, subject: str, body: str, sendgrid_key: str) -> bool`

```python
async def send_email_alert(email: str, subject: str, body: str, sendgrid_key: str) -> bool:
    """
    SendGrid로 이메일 알림 전송

    Args:
        email: 수신자 이메일
        subject: 제목
        body: 내용
        sendgrid_key: SendGrid API Key

    Returns:
        bool: 전송 성공 여부
    """
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {"Authorization": f"Bearer {sendgrid_key}"}
    payload = {
        "personalizations": [{"to": [{"email": email}]}],
        "from": {"email": "noreply@stockalerts.com"},
        "subject": subject,
        "content": [{"type": "text/plain", "value": body}]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        return response.status_code == 202
```

---

## API 라우터

### 뉴스 API
**파일**: `backend/app/routers/news.py`
**엔드포인트**: `GET /api/news`
**함수**: `get_news(limit, offset, min_score, ticker)`

```python
@router.get("/", response_model=List[NewsWithStock])
async def get_news(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    min_score: Optional[int] = Query(None, ge=1, le=5),
    ticker: Optional[str] = None
):
    """
    뉴스 목록 조회

    Query Parameters:
        - limit: 한 페이지당 개수 (최대 100)
        - offset: 페이지 시작 위치
        - min_score: 최소 영향도 점수 (1-5)
        - ticker: 특정 종목 필터

    Returns:
        List[NewsWithStock]: 뉴스 목록
    """
    if ticker:
        return await get_news_by_ticker(ticker, limit)
    return await get_news_list(limit, offset, min_score)
```

**사용 예시**:
```bash
# 기본 조회
GET /api/news?limit=20&offset=0

# 중요 뉴스만
GET /api/news?min_score=4

# Apple 뉴스만
GET /api/news?ticker=AAPL
```

---

### 알림 API
**파일**: `backend/app/routers/alerts.py`
**엔드포인트**: `GET /api/alerts/users/{user_id}/alerts`
**함수**: `get_alerts(user_id, limit)`

```python
@router.get("/users/{user_id}/alerts", response_model=List[AlertWithNews])
async def get_alerts(user_id: str, limit: int = Query(50, le=100)):
    """
    사용자 알림 히스토리 조회

    Path Parameters:
        - user_id: 사용자 UUID

    Query Parameters:
        - limit: 조회할 알림 개수

    Returns:
        List[AlertWithNews]: 알림 목록 (뉴스 정보 포함)
    """
    return await get_user_alerts(user_id, limit)
```

---

## Pydantic 모델

### UserCreate (회원가입)
**파일**: `backend/app/models/user.py`

```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str
```

**사용 예시**:
```python
user_data = UserCreate(email="test@example.com", password="password123")
```

---

### NewsResponse (뉴스 응답)
**파일**: `backend/app/models/news.py`

```python
class NewsResponse(BaseModel):
    id: str
    source: str
    title: str
    summary: Optional[str] = None
    impact_score: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: datetime
```

---

### Token (JWT 토큰)
**파일**: `backend/app/models/user.py`

```python
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
```

---

## 환경변수 설정

### AI API 키 가져오기
**파일**: `backend/app/config.py`
**함수**: `settings.get_ai_api_key()`

```python
def get_ai_api_key(self) -> str:
    """Perplexity 우선, 없으면 OpenAI 반환"""
    if self.perplexity_api_key:
        return self.perplexity_api_key
    if self.openai_api_key:
        return self.openai_api_key
    return "demo-key"
```

**사용 예시**:
```python
from app.config import settings

api_key = settings.get_ai_api_key()
base_url = settings.get_ai_base_url()
model_name = settings.get_ai_model_name()
```

---

## 일반적인 사용 패턴

### 뉴스 수집 → AI 요약 → DB 저장
```python
# 1. 뉴스 수집
news_list = await fetch_news_rss("AAPL")

# 2. AI 요약
for news in news_list:
    summary_data = await summarize_news(news["title"], news["content"])
    news["summary"] = summary_data["summary"]
    news["impact_score"] = summary_data["impact_score"]

    # 3. DB 저장
    await create_news(news)
```

---

### 사용자 알림 트리거
```python
# 1. 사용자 관심 종목 조회
watchlist = await get_watchlist(user_id)

# 2. 각 종목의 최신 뉴스 확인
for item in watchlist:
    ticker = item["stocks"]["ticker"]
    news_list = await get_news_by_ticker(ticker, limit=5)

    # 3. 임계값 이상 뉴스만 알림
    for news in news_list:
        if news["impact_score"] >= item["alert_threshold"]:
            await send_telegram_alert(
                user["telegram_id"],
                f"🚨 {ticker}: {news['title']}",
                settings.telegram_bot_token
            )
```

---

## 참고 사항

### Supabase 쿼리 패턴
```python
# SELECT with JOIN
db.client.table("news").select("*, stocks(*)").execute()

# WHERE 조건
db.client.table("users").select("*").eq("email", "test@example.com").execute()

# ORDER BY
db.client.table("news").select("*").order("published_at", desc=True).execute()

# LIMIT & OFFSET (페이지네이션)
db.client.table("news").select("*").range(0, 19).execute()  # 0-19 (20개)

# INSERT
db.client.table("users").insert({"email": "...", "password_hash": "..."}).execute()

# UPDATE
db.client.table("users").update({"plan": "pro"}).eq("id", user_id).execute()

# DELETE
db.client.table("user_stocks").delete().eq("user_id", user_id).execute()
```

---

## 에러 처리 패턴

### HTTPException 사용
```python
from fastapi import HTTPException

# 404 Not Found
if not user:
    raise HTTPException(status_code=404, detail="User not found")

# 401 Unauthorized
if not verify_password(password, user["password_hash"]):
    raise HTTPException(status_code=401, detail="Invalid credentials")

# 400 Bad Request
if existing_user:
    raise HTTPException(status_code=400, detail="Email already registered")
```

---

**마지막 업데이트**: 2025-10-18
**버전**: 1.0.0
