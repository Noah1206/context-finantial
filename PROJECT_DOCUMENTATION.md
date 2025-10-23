# Stock News SaaS - Project Documentation

## Project Overview
**Project Name**: US Stock Market News Aggregator & Alert System
**Directory**: `/Users/johyeon-ung/Desktop/context finalial`
**Status**: Initial Setup
**Created**: 2025-10-18

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  Next.js Frontend (React) - Vercel Deployment                   │
│  - User Dashboard                                                │
│  - Stock Watchlist Management                                    │
│  - News Feed & Alerts Configuration                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                      API/BACKEND LAYER                           │
│  FastAPI Python Server - AWS Lambda/EC2                         │
│  - /api/news/fetch - Data collection endpoints                  │
│  - /api/news/summarize - AI processing endpoints                │
│  - /api/alerts/send - Notification endpoints                    │
│  - /api/users/* - User management                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                      DATA PROCESSING LAYER                       │
│  - News Collectors (SEC Edgar, Yahoo Finance, Reddit/X)         │
│  - Perplexity Pro API Integration (AI Summarization)            │
│  - Score Calculator (Impact Analysis 1-5)                        │
│  - Alert Trigger Engine                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
│  Supabase (PostgreSQL) - Managed Database                       │
│  - users, news, user_news, alerts tables                        │
│  - Real-time subscriptions                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION LAYER                            │
│  - Firebase Cloud Messaging (Web Push)                          │
│  - Telegram Bot API                                              │
│  - SendGrid (Email)                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
context-finalial/
├── backend/                    # FastAPI Backend Server
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Configuration management
│   │   ├── database.py        # Supabase connection
│   │   │
│   │   ├── models/            # Pydantic models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── news.py
│   │   │   ├── alert.py
│   │   │   └── stock.py
│   │   │
│   │   ├── routers/           # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── news.py
│   │   │   ├── alerts.py
│   │   │   └── users.py
│   │   │
│   │   ├── services/          # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── news_collector.py
│   │   │   ├── ai_summarizer.py
│   │   │   ├── alert_sender.py
│   │   │   └── stock_analyzer.py
│   │   │
│   │   ├── scrapers/          # Data collection
│   │   │   ├── __init__.py
│   │   │   ├── sec_edgar.py
│   │   │   ├── yahoo_finance.py
│   │   │   ├── reddit_scraper.py
│   │   │   └── twitter_scraper.py
│   │   │
│   │   └── utils/             # Helper functions
│   │       ├── __init__.py
│   │       ├── logger.py
│   │       ├── validators.py
│   │       └── formatters.py
│   │
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── Dockerfile             # Container configuration
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js 14 App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── watchlist/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── components/        # React components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   │
│   │   │   ├── news/
│   │   │   │   ├── NewsFeed.tsx
│   │   │   │   ├── NewsCard.tsx
│   │   │   │   └── NewsFilter.tsx
│   │   │   │
│   │   │   ├── stock/
│   │   │   │   ├── StockList.tsx
│   │   │   │   ├── StockCard.tsx
│   │   │   │   └── StockSearch.tsx
│   │   │   │
│   │   │   └── alerts/
│   │   │       ├── AlertSettings.tsx
│   │   │       └── AlertHistory.tsx
│   │   │
│   │   ├── lib/               # Utilities
│   │   │   ├── supabase.ts
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useNews.ts
│   │   │   └── useAlerts.ts
│   │   │
│   │   └── styles/            # CSS/Tailwind
│   │       └── globals.css
│   │
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── .env.local
│
├── database/                   # Database schemas & migrations
│   ├── schema.sql             # Initial schema
│   ├── migrations/            # Migration files
│   └── seeds/                 # Seed data
│
├── scripts/                    # Utility scripts
│   ├── deploy.sh
│   ├── setup_env.sh
│   └── test_api.py
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── README.md
└── PROJECT_DOCUMENTATION.md   # This file
```

---

## Database Schema

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_id VARCHAR(100),
    plan VARCHAR(20) DEFAULT 'free', -- free, starter, pro
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### stocks
```sql
CREATE TABLE stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker VARCHAR(10) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### user_stocks
```sql
CREATE TABLE user_stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
    alert_threshold INTEGER DEFAULT 3, -- minimum score to alert
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, stock_id)
);
```

### news
```sql
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL, -- sec, yahoo, reddit, twitter
    stock_id UUID REFERENCES stocks(id),
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT, -- AI generated
    impact_score INTEGER, -- 1-5
    url TEXT,
    published_at TIMESTAMP,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### alerts
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    news_id UUID REFERENCES news(id) ON DELETE CASCADE,
    alert_type VARCHAR(20), -- telegram, email, push
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Component IDs & Classes Convention

### Frontend Component Naming

#### IDs (Unique Elements)
```typescript
// Page-level IDs
#dashboard-main
#watchlist-container
#news-feed-container
#alert-settings-panel

// Component-level IDs
#stock-search-input
#news-filter-dropdown
#alert-toggle-switch
#user-profile-menu
```

#### Classes (Reusable Styles)
```typescript
// Layout classes
.page-container
.section-wrapper
.card-container
.modal-overlay

// Component classes
.news-card
.stock-card
.alert-badge
.filter-chip

// State classes
.is-active
.is-loading
.is-error
.is-success

// Utility classes (Tailwind)
.btn-primary
.btn-secondary
.text-heading
.text-body
```

### Backend Route Naming

```python
# Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# Users
GET    /api/users/{user_id}
PUT    /api/users/{user_id}
DELETE /api/users/{user_id}

# Stocks (Watchlist)
GET    /api/users/{user_id}/stocks
POST   /api/users/{user_id}/stocks
DELETE /api/users/{user_id}/stocks/{stock_id}

# News
GET    /api/news                    # Get all news with filters
GET    /api/news/{news_id}
GET    /api/stocks/{ticker}/news    # News for specific stock
POST   /api/news/fetch              # Trigger news collection (admin)

# Alerts
GET    /api/users/{user_id}/alerts
POST   /api/alerts/send             # Manual trigger (admin)
PUT    /api/alerts/{alert_id}/read
```

---

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Database**: Supabase (PostgreSQL 15)
- **AI API**: Perplexity Pro / OpenAI GPT-4
- **Async**: asyncio, httpx
- **Scheduler**: APScheduler
- **Validation**: Pydantic v2

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3+
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4
- **State**: React Query (TanStack Query)
- **Auth**: Supabase Auth
- **Charts**: Recharts / Chart.js

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: AWS Lambda / EC2
- **Database**: Supabase (managed)
- **Notifications**:
  - Firebase Cloud Messaging
  - Telegram Bot API
  - SendGrid
- **Monitoring**: Sentry, LogRocket

---

## Environment Variables

### Backend (.env)
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# AI API
PERPLEXITY_API_KEY=your_perplexity_key
OPENAI_API_KEY=your_openai_key

# External APIs
SEC_EDGAR_USER_AGENT=your_email@example.com
YAHOO_FINANCE_API_KEY=your_key
REDDIT_CLIENT_ID=your_reddit_client
REDDIT_CLIENT_SECRET=your_reddit_secret

# Notifications
TELEGRAM_BOT_TOKEN=your_bot_token
SENDGRID_API_KEY=your_sendgrid_key
FIREBASE_CREDENTIALS=path/to/credentials.json

# App Config
ENV=development
DEBUG=true
LOG_LEVEL=INFO
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_CONFIG=your_firebase_config
```

---

## Development Workflow

### Initial Setup
```bash
# 1. Clone/Initialize
cd "context finalial"

# 2. Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure environment variables

# 3. Setup Frontend
cd ../frontend
npm install
cp .env.local.example .env.local  # Configure environment variables

# 4. Setup Database
# Run migrations in Supabase dashboard or via CLI
```

### Development Commands
```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev  # Runs on port 3000

# Database migrations
supabase db push
```

---

## MVP Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Project structure setup
- ✅ Database schema design
- ✅ Supabase configuration
- ✅ FastAPI basic endpoints
- ✅ Next.js basic pages

### Phase 2: Data Collection (Week 2-3)
- SEC Edgar scraper
- Yahoo Finance integration
- Reddit/Twitter scrapers
- Database storage pipeline
- Scheduler setup

### Phase 3: AI Integration (Week 3-4)
- Perplexity Pro API integration
- News summarization
- Impact score calculation
- Batch processing

### Phase 4: Alert System (Week 4-5)
- Telegram bot setup
- Email integration (SendGrid)
- Web push (Firebase)
- Alert trigger logic

### Phase 5: Frontend (Week 5-6)
- User dashboard
- Watchlist management
- News feed display
- Alert configuration

### Phase 6: Testing & Launch (Week 6-7)
- Integration testing
- User acceptance testing
- Performance optimization
- Initial beta launch

---

## Naming Conventions

### Python (Backend)
- **Files**: snake_case (news_collector.py)
- **Classes**: PascalCase (NewsCollector)
- **Functions**: snake_case (fetch_news_data)
- **Constants**: UPPER_SNAKE_CASE (MAX_NEWS_PER_REQUEST)
- **Private**: _leading_underscore (_internal_method)

### TypeScript (Frontend)
- **Files**: PascalCase for components (NewsCard.tsx), camelCase for utils (formatDate.ts)
- **Components**: PascalCase (NewsFeed, StockCard)
- **Functions**: camelCase (fetchUserData, handleSubmit)
- **Interfaces**: PascalCase with I prefix (IUser, INewsItem)
- **Types**: PascalCase (NewsType, AlertType)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)

### Database
- **Tables**: plural snake_case (users, news, alerts)
- **Columns**: snake_case (created_at, impact_score)
- **Indexes**: idx_tablename_columnname (idx_news_published_at)
- **Foreign Keys**: fk_tablename_columnname (fk_alerts_user_id)

---

## Key Features & Requirements

### User Features
1. **Authentication**: Email/password, social login (Google)
2. **Watchlist**: Add/remove stocks, set alert thresholds
3. **News Feed**: Filter by stock, source, impact score
4. **Alerts**: Real-time notifications via Telegram/Email/Push
5. **Settings**: Notification preferences, alert frequency

### Admin Features
1. **Manual Triggers**: Force news collection, AI processing
2. **Monitoring**: System health, API usage, error logs
3. **User Management**: View users, manage subscriptions

### Subscription Tiers
- **Free**: 5 stocks, daily digest email
- **Starter** ($9/mo): 20 stocks, real-time Telegram alerts
- **Pro** ($29/mo): Unlimited stocks, all alert types, API access

---

## Next Steps

1. ✅ Create project structure
2. Initialize Git repository
3. Setup Supabase project
4. Configure environment variables
5. Implement Phase 1 (Foundation)
6. Begin Phase 2 (Data Collection)

---

**Last Updated**: 2025-10-18
**Version**: 0.1.0
**Status**: Planning Phase
