# Component Reference Guide

Complete reference for all IDs, classes, and component names used in the project.

---

## Frontend Components

### Layout Components

#### Header.tsx
```typescript
// IDs
#main-header
#user-menu-button
#notification-bell

// Classes
.header-container
.header-nav
.header-actions
.user-avatar
.notification-badge
```

#### Sidebar.tsx
```typescript
// IDs
#main-sidebar
#nav-dashboard
#nav-watchlist
#nav-news
#nav-alerts
#nav-settings

// Classes
.sidebar-container
.sidebar-nav
.nav-item
.nav-item-active
.nav-icon
.nav-label
```

#### Footer.tsx
```typescript
// IDs
#main-footer

// Classes
.footer-container
.footer-links
.footer-social
.footer-copyright
```

### News Components

#### NewsFeed.tsx
```typescript
// IDs
#news-feed
#news-filter-controls
#news-load-more

// Classes
.news-feed-container
.news-feed-header
.news-feed-list
.news-feed-empty
.news-feed-loading
```

#### NewsCard.tsx
```typescript
// IDs
#news-card-{newsId}
#news-share-{newsId}

// Classes
.news-card
.news-card-header
.news-card-content
.news-card-footer
.news-title
.news-summary
.news-source
.news-timestamp
.news-score
.news-score-{1-5}        // Impact score styling
.news-stock-tag
.news-actions
```

#### NewsFilter.tsx
```typescript
// IDs
#filter-source
#filter-stock
#filter-score
#filter-date-range
#filter-reset

// Classes
.news-filter-container
.filter-group
.filter-label
.filter-dropdown
.filter-chip
.filter-chip-active
.filter-apply-button
.filter-reset-button
```

### Stock Components

#### StockList.tsx
```typescript
// IDs
#stock-list
#add-stock-button

// Classes
.stock-list-container
.stock-list-header
.stock-list-items
.stock-list-empty
.add-stock-trigger
```

#### StockCard.tsx
```typescript
// IDs
#stock-card-{ticker}
#remove-stock-{ticker}

// Classes
.stock-card
.stock-card-header
.stock-card-body
.stock-ticker
.stock-company-name
.stock-price
.stock-change
.stock-change-positive
.stock-change-negative
.stock-news-count
.stock-alert-settings
.stock-remove-button
```

#### StockSearch.tsx
```typescript
// IDs
#stock-search-input
#stock-search-results
#stock-search-clear

// Classes
.stock-search-container
.stock-search-wrapper
.stock-search-input
.stock-search-icon
.stock-search-results
.stock-search-result-item
.stock-search-result-ticker
.stock-search-result-name
.stock-search-no-results
```

### Alert Components

#### AlertSettings.tsx
```typescript
// IDs
#alert-settings-panel
#alert-telegram-toggle
#alert-email-toggle
#alert-push-toggle
#alert-threshold-slider
#alert-frequency-select

// Classes
.alert-settings-container
.alert-settings-section
.alert-toggle
.alert-toggle-active
.alert-threshold-control
.alert-frequency-select
.alert-save-button
```

#### AlertHistory.tsx
```typescript
// IDs
#alert-history-list
#alert-clear-all

// Classes
.alert-history-container
.alert-history-item
.alert-history-timestamp
.alert-history-content
.alert-history-read
.alert-history-unread
.alert-clear-button
```

---

## Page Components

### app/page.tsx (Homepage)
```typescript
// IDs
#hero-section
#features-section
#pricing-section
#cta-section

// Classes
.home-container
.hero-title
.hero-subtitle
.hero-cta-buttons
.feature-grid
.feature-card
.pricing-grid
.pricing-card
.pricing-card-featured
```

### app/dashboard/page.tsx
```typescript
// IDs
#dashboard-main
#dashboard-stats
#dashboard-news-feed
#dashboard-watchlist

// Classes
.dashboard-container
.dashboard-grid
.dashboard-section
.stat-card
.stat-value
.stat-label
.quick-actions
```

### app/watchlist/page.tsx
```typescript
// IDs
#watchlist-page
#watchlist-header
#watchlist-controls

// Classes
.watchlist-container
.watchlist-grid
.watchlist-actions
.watchlist-sort-controls
```

### app/settings/page.tsx
```typescript
// IDs
#settings-page
#settings-profile
#settings-notifications
#settings-subscription
#settings-security

// Classes
.settings-container
.settings-tabs
.settings-tab
.settings-tab-active
.settings-section
.settings-form
.settings-save-button
```

---

## Utility Classes (Tailwind)

### Buttons
```css
.btn-primary          /* Primary action button */
.btn-secondary        /* Secondary action button */
.btn-danger           /* Delete/destructive action */
.btn-ghost            /* Minimal button */
.btn-sm               /* Small button */
.btn-lg               /* Large button */
.btn-loading          /* Loading state */
.btn-disabled         /* Disabled state */
```

### Cards & Containers
```css
.card                 /* Generic card container */
.card-hover           /* Card with hover effect */
.card-clickable       /* Clickable card */
.section-wrapper      /* Page section wrapper */
.page-container       /* Main page container */
.modal-overlay        /* Modal background */
.modal-content        /* Modal dialog box */
```

### Typography
```css
.text-heading-1       /* h1 style */
.text-heading-2       /* h2 style */
.text-heading-3       /* h3 style */
.text-body            /* Body text */
.text-caption         /* Small caption text */
.text-muted           /* Muted/gray text */
.text-error           /* Error message text */
.text-success         /* Success message text */
```

### Status & State
```css
.is-active            /* Active state */
.is-loading           /* Loading state */
.is-error             /* Error state */
.is-success           /* Success state */
.is-disabled          /* Disabled state */
.is-selected          /* Selected state */
.is-hidden            /* Hidden element */
```

### Layout
```css
.flex-center          /* Flexbox centered */
.flex-between         /* Flexbox space-between */
.grid-2               /* 2-column grid */
.grid-3               /* 3-column grid */
.grid-4               /* 4-column grid */
```

---

## Backend Route IDs

### Authentication Routes
```python
# Route names (used in OpenAPI docs)
"auth:register"         # POST /api/auth/register
"auth:login"            # POST /api/auth/login
"auth:logout"           # POST /api/auth/logout
"auth:me"               # GET /api/auth/me
"auth:refresh"          # POST /api/auth/refresh
```

### User Routes
```python
"users:get"             # GET /api/users/{user_id}
"users:update"          # PUT /api/users/{user_id}
"users:delete"          # DELETE /api/users/{user_id}
"users:stocks:list"     # GET /api/users/{user_id}/stocks
"users:stocks:add"      # POST /api/users/{user_id}/stocks
"users:stocks:remove"   # DELETE /api/users/{user_id}/stocks/{stock_id}
```

### News Routes
```python
"news:list"             # GET /api/news
"news:get"              # GET /api/news/{news_id}
"news:stock"            # GET /api/stocks/{ticker}/news
"news:fetch"            # POST /api/news/fetch (admin)
"news:summarize"        # POST /api/news/summarize (admin)
```

### Alert Routes
```python
"alerts:list"           # GET /api/users/{user_id}/alerts
"alerts:send"           # POST /api/alerts/send (admin)
"alerts:read"           # PUT /api/alerts/{alert_id}/read
"alerts:settings"       # GET/PUT /api/users/{user_id}/alert-settings
```

---

## Database Table & Column IDs

### users
```sql
id                  UUID PRIMARY KEY
email               VARCHAR(255)
password_hash       VARCHAR(255)
telegram_id         VARCHAR(100)
plan                VARCHAR(20)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### stocks
```sql
id                  UUID PRIMARY KEY
ticker              VARCHAR(10)
company_name        VARCHAR(255)
sector              VARCHAR(100)
created_at          TIMESTAMP
```

### user_stocks
```sql
id                  UUID PRIMARY KEY
user_id             UUID (FK → users.id)
stock_id            UUID (FK → stocks.id)
alert_threshold     INTEGER
created_at          TIMESTAMP
```

### news
```sql
id                  UUID PRIMARY KEY
source              VARCHAR(50)
stock_id            UUID (FK → stocks.id)
title               TEXT
content             TEXT
summary             TEXT
impact_score        INTEGER
url                 TEXT
published_at        TIMESTAMP
processed_at        TIMESTAMP
created_at          TIMESTAMP
```

### alerts
```sql
id                  UUID PRIMARY KEY
user_id             UUID (FK → users.id)
news_id             UUID (FK → news.id)
alert_type          VARCHAR(20)
sent_at             TIMESTAMP
read_at             TIMESTAMP
created_at          TIMESTAMP
```

---

## API Response Models

### UserResponse
```typescript
{
  id: string
  email: string
  plan: 'free' | 'starter' | 'pro'
  telegram_id?: string
  created_at: string
}
```

### NewsResponse
```typescript
{
  id: string
  source: string
  stock: {
    ticker: string
    company_name: string
  }
  title: string
  summary: string
  impact_score: 1 | 2 | 3 | 4 | 5
  url: string
  published_at: string
}
```

### AlertResponse
```typescript
{
  id: string
  news: NewsResponse
  alert_type: 'telegram' | 'email' | 'push'
  sent_at: string
  read_at?: string
}
```

---

## Form IDs

### Registration Form
```typescript
#register-form
#register-email
#register-password
#register-password-confirm
#register-submit
```

### Login Form
```typescript
#login-form
#login-email
#login-password
#login-submit
#login-forgot-password
```

### Stock Add Form
```typescript
#add-stock-form
#add-stock-ticker
#add-stock-threshold
#add-stock-submit
```

### Alert Settings Form
```typescript
#alert-settings-form
#alert-telegram-id
#alert-email-enabled
#alert-push-enabled
#alert-threshold
#alert-frequency
#alert-settings-submit
```

---

## Icon Classes

```css
.icon                 /* Base icon class */
.icon-sm              /* Small icon */
.icon-md              /* Medium icon */
.icon-lg              /* Large icon */

/* Specific icons */
.icon-bell            /* Notification bell */
.icon-stock           /* Stock/chart icon */
.icon-news            /* News/article icon */
.icon-settings        /* Settings gear icon */
.icon-user            /* User profile icon */
.icon-search          /* Search magnifier */
.icon-close           /* Close/X icon */
.icon-menu            /* Hamburger menu */
.icon-chevron-down    /* Down arrow */
.icon-chevron-up      /* Up arrow */
.icon-check           /* Checkmark */
.icon-alert           /* Alert/warning icon */
```

---

## Animation Classes

```css
.fade-in              /* Fade in animation */
.fade-out             /* Fade out animation */
.slide-in-right       /* Slide from right */
.slide-in-left        /* Slide from left */
.slide-up             /* Slide up */
.slide-down           /* Slide down */
.pulse                /* Pulsing animation */
.spin                 /* Spinning animation (loading) */
```

---

**Last Updated**: 2025-10-18
**Version**: 0.1.0
