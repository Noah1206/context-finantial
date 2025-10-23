# API Reference

Complete API endpoint documentation for the Stock News SaaS platform.

**Base URL**: `http://localhost:8000/api` (development)
**Production URL**: `https://api.stockalerts.com/api`

---

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created)
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "plan": "free",
  "created_at": "2025-10-18T12:00:00Z",
  "access_token": "jwt-token-string"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK)
```json
{
  "access_token": "jwt-token-string",
  "token_type": "bearer",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "plan": "free"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {access_token}
```

**Response** (200 OK)
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "telegram_id": "telegram-user-id",
  "plan": "starter",
  "created_at": "2025-10-18T12:00:00Z"
}
```

---

## Users

### Get User Profile
```http
GET /api/users/{user_id}
Authorization: Bearer {access_token}
```

**Response** (200 OK)
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "telegram_id": "telegram-user-id",
  "plan": "pro",
  "created_at": "2025-10-18T12:00:00Z",
  "updated_at": "2025-10-18T14:30:00Z"
}
```

### Update User Profile
```http
PUT /api/users/{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "telegram_id": "new-telegram-id",
  "plan": "pro"
}
```

**Response** (200 OK)
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "telegram_id": "new-telegram-id",
  "plan": "pro",
  "updated_at": "2025-10-18T15:00:00Z"
}
```

---

## Watchlist (User Stocks)

### Get User Watchlist
```http
GET /api/users/{user_id}/stocks
Authorization: Bearer {access_token}
```

**Query Parameters**
- `limit` (optional): Number of stocks to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200 OK)
```json
{
  "stocks": [
    {
      "id": "uuid-string",
      "ticker": "AAPL",
      "company_name": "Apple Inc.",
      "sector": "Technology",
      "alert_threshold": 3,
      "added_at": "2025-10-18T12:00:00Z"
    },
    {
      "id": "uuid-string",
      "ticker": "TSLA",
      "company_name": "Tesla, Inc.",
      "sector": "Automotive",
      "alert_threshold": 4,
      "added_at": "2025-10-17T09:30:00Z"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

### Add Stock to Watchlist
```http
POST /api/users/{user_id}/stocks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "ticker": "NVDA",
  "alert_threshold": 3
}
```

**Response** (201 Created)
```json
{
  "id": "uuid-string",
  "ticker": "NVDA",
  "company_name": "NVIDIA Corporation",
  "sector": "Technology",
  "alert_threshold": 3,
  "added_at": "2025-10-18T15:00:00Z"
}
```

**Error Response** (400 Bad Request)
```json
{
  "error": "Stock already in watchlist"
}
```

**Error Response** (403 Forbidden - Free plan limit)
```json
{
  "error": "Watchlist limit reached. Upgrade to add more stocks.",
  "limit": 5,
  "current_plan": "free"
}
```

### Remove Stock from Watchlist
```http
DELETE /api/users/{user_id}/stocks/{stock_id}
Authorization: Bearer {access_token}
```

**Response** (204 No Content)

---

## News

### Get News Feed
```http
GET /api/news
Authorization: Bearer {access_token}
```

**Query Parameters**
- `ticker` (optional): Filter by stock ticker (e.g., "AAPL")
- `source` (optional): Filter by source ("sec", "yahoo", "reddit", "twitter")
- `min_score` (optional): Minimum impact score (1-5)
- `from_date` (optional): Start date (ISO 8601)
- `to_date` (optional): End date (ISO 8601)
- `limit` (optional): Number of items (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200 OK)
```json
{
  "news": [
    {
      "id": "uuid-string",
      "source": "sec",
      "stock": {
        "ticker": "AAPL",
        "company_name": "Apple Inc."
      },
      "title": "Apple Inc. Files 10-Q Quarterly Report",
      "summary": "Apple reported Q3 revenue of $81.8B, up 5% YoY. iPhone sales strong in China market. Services revenue grew 8%.",
      "impact_score": 4,
      "url": "https://www.sec.gov/...",
      "published_at": "2025-10-18T14:00:00Z",
      "processed_at": "2025-10-18T14:05:00Z"
    },
    {
      "id": "uuid-string",
      "source": "yahoo",
      "stock": {
        "ticker": "TSLA",
        "company_name": "Tesla, Inc."
      },
      "title": "Tesla Announces New Gigafactory Location",
      "summary": "Tesla confirmed plans for new factory in Mexico. Expected to produce 2M vehicles annually by 2027.",
      "impact_score": 5,
      "url": "https://finance.yahoo.com/...",
      "published_at": "2025-10-18T13:30:00Z",
      "processed_at": "2025-10-18T13:35:00Z"
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

### Get Single News Item
```http
GET /api/news/{news_id}
Authorization: Bearer {access_token}
```

**Response** (200 OK)
```json
{
  "id": "uuid-string",
  "source": "sec",
  "stock": {
    "ticker": "AAPL",
    "company_name": "Apple Inc.",
    "sector": "Technology"
  },
  "title": "Apple Inc. Files 10-Q Quarterly Report",
  "content": "Full text of the news article or filing...",
  "summary": "AI-generated summary...",
  "impact_score": 4,
  "url": "https://www.sec.gov/...",
  "published_at": "2025-10-18T14:00:00Z",
  "processed_at": "2025-10-18T14:05:00Z"
}
```

### Get News for Specific Stock
```http
GET /api/stocks/{ticker}/news
Authorization: Bearer {access_token}
```

**Query Parameters**
- `source` (optional): Filter by source
- `min_score` (optional): Minimum impact score
- `days` (optional): Number of days back (default: 7)
- `limit` (optional): Number of items (default: 20)

**Response** (200 OK)
```json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "news": [
    {
      "id": "uuid-string",
      "source": "sec",
      "title": "Apple Inc. Files 10-Q Quarterly Report",
      "summary": "AI-generated summary...",
      "impact_score": 4,
      "published_at": "2025-10-18T14:00:00Z"
    }
  ],
  "total": 12
}
```

### Trigger News Collection (Admin Only)
```http
POST /api/news/fetch
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "sources": ["sec", "yahoo"],
  "tickers": ["AAPL", "TSLA"]  // optional, all stocks if omitted
}
```

**Response** (202 Accepted)
```json
{
  "status": "started",
  "task_id": "task-uuid",
  "message": "News collection started for 2 sources"
}
```

---

## Alerts

### Get Alert History
```http
GET /api/users/{user_id}/alerts
Authorization: Bearer {access_token}
```

**Query Parameters**
- `read` (optional): Filter by read status (true/false)
- `alert_type` (optional): Filter by type ("telegram", "email", "push")
- `days` (optional): Number of days back (default: 30)
- `limit` (optional): Number of items (default: 50)
- `offset` (optional): Pagination offset

**Response** (200 OK)
```json
{
  "alerts": [
    {
      "id": "uuid-string",
      "news": {
        "id": "news-uuid",
        "title": "Tesla Announces New Gigafactory",
        "summary": "Short summary...",
        "impact_score": 5,
        "stock": {
          "ticker": "TSLA",
          "company_name": "Tesla, Inc."
        }
      },
      "alert_type": "telegram",
      "sent_at": "2025-10-18T13:35:00Z",
      "read_at": "2025-10-18T14:00:00Z"
    },
    {
      "id": "uuid-string",
      "news": {
        "id": "news-uuid",
        "title": "Apple Q3 Earnings Beat",
        "summary": "Short summary...",
        "impact_score": 4,
        "stock": {
          "ticker": "AAPL",
          "company_name": "Apple Inc."
        }
      },
      "alert_type": "email",
      "sent_at": "2025-10-18T09:00:00Z",
      "read_at": null
    }
  ],
  "total": 47,
  "unread_count": 12
}
```

### Mark Alert as Read
```http
PUT /api/alerts/{alert_id}/read
Authorization: Bearer {access_token}
```

**Response** (200 OK)
```json
{
  "id": "uuid-string",
  "read_at": "2025-10-18T15:30:00Z"
}
```

### Get Alert Settings
```http
GET /api/users/{user_id}/alert-settings
Authorization: Bearer {access_token}
```

**Response** (200 OK)
```json
{
  "telegram_enabled": true,
  "telegram_id": "telegram-user-id",
  "email_enabled": true,
  "push_enabled": false,
  "min_impact_score": 3,
  "alert_frequency": "realtime",  // "realtime", "hourly", "daily"
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00",
    "timezone": "America/New_York"
  }
}
```

### Update Alert Settings
```http
PUT /api/users/{user_id}/alert-settings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "telegram_enabled": true,
  "telegram_id": "new-telegram-id",
  "email_enabled": true,
  "min_impact_score": 4,
  "alert_frequency": "hourly"
}
```

**Response** (200 OK)
```json
{
  "telegram_enabled": true,
  "telegram_id": "new-telegram-id",
  "email_enabled": true,
  "push_enabled": false,
  "min_impact_score": 4,
  "alert_frequency": "hourly",
  "updated_at": "2025-10-18T15:45:00Z"
}
```

---

## Stocks (Reference Data)

### Search Stocks
```http
GET /api/stocks/search
Authorization: Bearer {access_token}
```

**Query Parameters**
- `q`: Search query (ticker or company name)
- `limit` (optional): Number of results (default: 10, max: 50)

**Response** (200 OK)
```json
{
  "results": [
    {
      "ticker": "AAPL",
      "company_name": "Apple Inc.",
      "sector": "Technology"
    },
    {
      "ticker": "AABA",
      "company_name": "Altaba Inc.",
      "sector": "Technology"
    }
  ]
}
```

### Get Stock Info
```http
GET /api/stocks/{ticker}
Authorization: Bearer {access_token}
```

**Response** (200 OK)
```json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "latest_price": 178.45,
  "change_percent": 1.23,
  "news_count_24h": 12,
  "last_updated": "2025-10-18T15:59:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": {
    "ticker": "Invalid ticker format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Plan upgrade required",
  "message": "This feature requires Pro plan",
  "upgrade_url": "https://stockalerts.com/upgrade"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60,
  "limit": 100,
  "reset_at": "2025-10-18T16:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "error_id": "error-uuid",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limits

| Plan | Requests/Minute | Requests/Hour | Requests/Day |
|------|-----------------|---------------|--------------|
| Free | 10 | 100 | 1000 |
| Starter | 30 | 500 | 5000 |
| Pro | 100 | 2000 | 20000 |

**Rate Limit Headers**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1634567890
```

---

## Webhooks (Pro Plan)

### Register Webhook
```http
POST /api/webhooks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["news.created", "alert.sent"],
  "secret": "webhook-signing-secret"
}
```

### Webhook Payload Example
```json
{
  "event": "news.created",
  "timestamp": "2025-10-18T14:05:00Z",
  "data": {
    "news_id": "uuid-string",
    "ticker": "AAPL",
    "title": "Apple Inc. Files 10-Q",
    "impact_score": 4
  }
}
```

---

**Last Updated**: 2025-10-18
**API Version**: v1
