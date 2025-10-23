# US Stock Market News Aggregator & Alert System

Real-time stock market news aggregation with AI-powered summarization and intelligent alerting.

## Overview

This SaaS platform collects news and filings from multiple sources (SEC Edgar, Yahoo Finance, Reddit, Twitter), uses AI to summarize and score their market impact, and sends targeted alerts to users based on their watchlists.

## Features

- 📰 **Multi-Source News Aggregation**: SEC filings, financial news, social media
- 🤖 **AI-Powered Summarization**: Perplexity Pro API for concise summaries
- 📊 **Impact Scoring**: 1-5 scale rating for news significance
- 🔔 **Multi-Channel Alerts**: Telegram, Email, Web Push notifications
- 📈 **Stock Watchlist**: Track unlimited stocks (Pro plan)
- ⚡ **Real-time Updates**: Instant notifications for breaking news
- 🎯 **Smart Filtering**: Customize alert thresholds and preferences

## Tech Stack

**Backend**
- FastAPI (Python)
- Supabase (PostgreSQL)
- Perplexity Pro API
- APScheduler

**Frontend**
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Supabase Auth

**Infrastructure**
- Vercel (Frontend)
- AWS Lambda/EC2 (Backend)
- Firebase (Push Notifications)
- Telegram Bot API
- SendGrid (Email)

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account
- Perplexity Pro API key

### Installation

```bash
# Clone repository
git clone <repository-url>
cd "context finalial"

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your API keys

# Frontend setup
cd ../frontend
npm install
cp .env.local.example .env.local  # Configure environment

# Run development servers
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
context-finalial/
├── backend/          # FastAPI backend server
├── frontend/         # Next.js frontend application
├── database/         # Database schemas & migrations
├── scripts/          # Utility scripts
└── docs/            # Additional documentation
```

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for detailed architecture.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### News
- `GET /api/news` - Get news feed with filters
- `GET /api/stocks/{ticker}/news` - Get news for specific stock

### Watchlist
- `GET /api/users/{user_id}/stocks` - Get user's watchlist
- `POST /api/users/{user_id}/stocks` - Add stock to watchlist
- `DELETE /api/users/{user_id}/stocks/{stock_id}` - Remove stock

### Alerts
- `GET /api/users/{user_id}/alerts` - Get alert history
- `PUT /api/alerts/{alert_id}/read` - Mark alert as read

## Environment Variables

### Backend
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PERPLEXITY_API_KEY=your_perplexity_key
TELEGRAM_BOT_TOKEN=your_telegram_token
SENDGRID_API_KEY=your_sendgrid_key
```

### Frontend
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Subscription Plans

| Feature | Free | Starter ($9/mo) | Pro ($29/mo) |
|---------|------|-----------------|--------------|
| Stocks | 5 | 20 | Unlimited |
| Alerts | Daily Email | Real-time Telegram | All Channels |
| News Sources | Yahoo Finance | All Sources | All + Premium |
| API Access | ❌ | ❌ | ✅ |

## Development Roadmap

- [x] Project structure and documentation
- [ ] Database schema implementation
- [ ] News collectors (SEC, Yahoo, Reddit)
- [ ] AI summarization integration
- [ ] Alert system (Telegram, Email)
- [ ] Frontend dashboard
- [ ] User authentication
- [ ] Subscription management
- [ ] Beta launch

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- Documentation: [docs/](./docs/)
- Issues: GitHub Issues
- Email: support@stockalerts.com

---

**Status**: 🚧 In Development
**Version**: 0.1.0
**Last Updated**: 2025-10-18
# context-finantial
# context-finantial
