# ShipIt — URL Shortener Service
## Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** 2026-03-11
**Status:** Ready for Development

---

## 1. Overview

ShipIt is a full-stack URL shortening service with user authentication and click analytics. Users can sign up, shorten URLs, share them, and track how many clicks their links receive over time. The application supports both anonymous usage (basic shortening) and authenticated usage (dashboard, analytics, link management).

This is the capstone project for the Modern Software Developer bootcamp. It integrates everything learned across all five days: Git workflows, testing, CI/CD, security scanning, Docker deployment, and AI-assisted development with Claude Code.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | JavaScript (ES2024) |
| **Database (dev)** | SQLite via better-sqlite3 |
| **Database (prod)** | PostgreSQL (optional upgrade path) |
| **Styling** | Tailwind CSS |
| **Authentication** | NextAuth.js v4 (GitHub OAuth + Credentials) |
| **Password Hashing** | bcryptjs |
| **ID Generation** | nanoid |
| **Testing** | Vitest with v8 coverage |
| **Security** | Semgrep static analysis |
| **Deployment** | Vercel / Railway / Docker |
| **CI/CD** | GitHub Actions |

---

## 3. Features

### 3.1 User Authentication
- **Sign up** with email and password (credentials provider)
- **Sign in** with email/password or GitHub OAuth
- **Session management** via NextAuth.js (JWT strategy)
- **Password requirements**: minimum 8 characters
- Passwords stored as bcrypt hashes (never plain text)
- Protected routes redirect unauthenticated users to sign-in

### 3.2 URL Shortening
- Paste a long URL and receive a short URL (e.g., `http://localhost:3000/abc123`)
- **Auto-generated short codes**: 6-character alphanumeric string via nanoid
- **Custom aliases**: Users may optionally provide a custom alias (e.g., `my-link`)
- Custom aliases must be 3-50 characters, alphanumeric plus hyphens only
- **URL validation**: Input must be a valid URL (starts with http:// or https://)
- **Duplicate detection**: If the same user shortens the same URL, return the existing short code
- **Anonymous shortening**: The landing page allows shortening without sign-in (user_id is null)

### 3.3 Dashboard
- Lists all shortened URLs created by the authenticated user
- Shows for each URL: original URL (truncated), short code, click count, creation date
- **Copy-to-clipboard** button next to each short URL
- **Delete** button to remove a URL
- Sorted by creation date (newest first)
- Paginated (20 URLs per page)

### 3.4 Click Analytics
- Every visit to a short URL is logged as a click event
- **Total clicks** displayed on the dashboard
- **Detailed analytics page** for each URL showing:
  - Total click count
  - Clicks over time (last 7 days, last 30 days)
  - Top referrer sources
  - Click timeline (clicks per day as a simple table or list)
- Click data captured: timestamp, referrer header, user-agent, IP-based country (optional)

### 3.5 Rate Limiting
- Maximum **100 URL creations per day** per user (authenticated)
- Maximum **10 URL creations per day** for anonymous users (by IP)
- Returns HTTP 429 with a clear error message when limit is exceeded

### 3.6 URL Redirection
- Visiting `/:shortCode` performs a 302 redirect to the original URL
- Before redirecting, a click event is recorded asynchronously
- Invalid short codes return a 404 page with a friendly message

---

## 4. Pages

### 4.1 Landing Page — `/`
- **Hero section** with tagline: "Ship links faster with ShipIt"
- **URL shortening form** (works without authentication)
  - Input field for the long URL
  - Optional input for custom alias
  - "Shorten" button
- After shortening, display the short URL with a **copy button**
- Call-to-action: "Sign up to track your clicks and manage your links"
- Navigation bar with Sign In / Sign Up links (or Dashboard link if authenticated)

### 4.2 Dashboard — `/dashboard`
- **Requires authentication** (redirect to `/auth/signin` if not logged in)
- Header: "Your Links" with a count of total URLs
- **Create new URL form** at the top (same as landing page but integrated)
- **URL list** as a table or card layout:
  - Short URL (clickable, opens in new tab)
  - Original URL (truncated to 50 chars with tooltip for full URL)
  - Click count
  - Created date (relative time, e.g., "2 hours ago")
  - Actions: Copy, View Analytics, Delete
- **Pagination** controls at the bottom

### 4.3 URL Analytics — `/dashboard/[id]`
- **Requires authentication** and ownership of the URL
- Shows the full original URL and short URL
- **Stats cards**: Total Clicks, Clicks Today, Clicks This Week
- **Clicks over time**: A simple table showing clicks per day for the last 30 days
- **Top Referrers**: List of top 10 referrer domains with click counts
- **Recent Clicks**: Table of the last 20 clicks with timestamp, referrer, and user-agent
- Back button to return to dashboard

### 4.4 Sign In — `/auth/signin`
- Email and password form
- "Sign in with GitHub" button
- Link to sign-up page
- Error messages for invalid credentials

### 4.5 Sign Up — `/auth/signup`
- Name, email, and password form
- Password confirmation field
- Client-side validation (email format, password length, passwords match)
- After successful signup, auto-sign-in and redirect to dashboard
- Link to sign-in page

### 4.6 Redirect Handler — `/[shortCode]`
- Not a visible page — performs server-side redirect
- Looks up the short code in the database
- If found: log click, return 302 redirect to original URL
- If not found: render a 404 page with "Link not found" message and link back to home

---

## 5. API Endpoints

### 5.1 POST `/api/urls`
**Create a shortened URL**

- **Auth**: Optional (anonymous users get limited features)
- **Request body**:
  ```json
  {
    "url": "https://example.com/very/long/path",
    "customAlias": "my-link"  // optional
  }
  ```
- **Validation**:
  - `url` is required and must be a valid HTTP/HTTPS URL
  - `customAlias` (if provided) must be 3-50 chars, alphanumeric + hyphens, and unique
- **Response (201)**:
  ```json
  {
    "id": 1,
    "originalUrl": "https://example.com/very/long/path",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:3000/abc123",
    "createdAt": "2026-03-11T10:00:00Z"
  }
  ```
- **Errors**: 400 (invalid URL), 409 (alias taken), 429 (rate limited)

### 5.2 GET `/api/urls`
**List the authenticated user's URLs**

- **Auth**: Required
- **Query params**: `page` (default 1), `limit` (default 20)
- **Response (200)**:
  ```json
  {
    "urls": [
      {
        "id": 1,
        "originalUrl": "https://example.com",
        "shortCode": "abc123",
        "shortUrl": "http://localhost:3000/abc123",
        "clicks": 42,
        "createdAt": "2026-03-11T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
  }
  ```

### 5.3 GET `/api/urls/:id`
**Get URL details with summary analytics**

- **Auth**: Required (must own the URL)
- **Response (200)**:
  ```json
  {
    "id": 1,
    "originalUrl": "https://example.com",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:3000/abc123",
    "clicks": 42,
    "createdAt": "2026-03-11T10:00:00Z"
  }
  ```
- **Errors**: 401 (not authenticated), 403 (not owner), 404 (not found)

### 5.4 DELETE `/api/urls/:id`
**Delete a URL**

- **Auth**: Required (must own the URL)
- **Response (200)**:
  ```json
  { "message": "URL deleted successfully" }
  ```
- **Errors**: 401, 403, 404

### 5.5 GET `/api/urls/:id/analytics`
**Get detailed click analytics for a URL**

- **Auth**: Required (must own the URL)
- **Response (200)**:
  ```json
  {
    "totalClicks": 42,
    "clicksToday": 5,
    "clicksThisWeek": 20,
    "clicksByDay": [
      { "date": "2026-03-11", "count": 5 },
      { "date": "2026-03-10", "count": 8 }
    ],
    "topReferrers": [
      { "referrer": "twitter.com", "count": 15 },
      { "referrer": "direct", "count": 12 }
    ],
    "recentClicks": [
      {
        "clickedAt": "2026-03-11T10:30:00Z",
        "referrer": "twitter.com",
        "userAgent": "Mozilla/5.0...",
        "country": "US"
      }
    ]
  }
  ```

---

## 6. Data Model

### 6.1 `users` Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| email | TEXT | UNIQUE, NOT NULL |
| password_hash | TEXT | NULLABLE (null for OAuth-only users) |
| name | TEXT | NOT NULL |
| github_id | TEXT | UNIQUE, NULLABLE |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 6.2 `urls` Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| user_id | INTEGER | NULLABLE, FOREIGN KEY -> users(id) |
| original_url | TEXT | NOT NULL |
| short_code | TEXT | UNIQUE, NOT NULL |
| custom_alias | TEXT | UNIQUE, NULLABLE |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Indexes**:
- `idx_urls_short_code` on `short_code` (for fast redirect lookups)
- `idx_urls_user_id` on `user_id` (for dashboard queries)
- `idx_urls_custom_alias` on `custom_alias` (for alias uniqueness)

### 6.3 `clicks` Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| url_id | INTEGER | NOT NULL, FOREIGN KEY -> urls(id) ON DELETE CASCADE |
| clicked_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| referrer | TEXT | NULLABLE |
| user_agent | TEXT | NULLABLE |
| ip_country | TEXT | NULLABLE |

**Indexes**:
- `idx_clicks_url_id` on `url_id` (for analytics queries)
- `idx_clicks_clicked_at` on `clicked_at` (for time-based queries)

### 6.4 `rate_limits` Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| identifier | TEXT | NOT NULL (user_id or IP address) |
| date | TEXT | NOT NULL (YYYY-MM-DD format) |
| count | INTEGER | DEFAULT 0 |

**Indexes**:
- `idx_rate_limits_lookup` on `(identifier, date)` UNIQUE

---

## 7. Database Initialization

The application should auto-initialize the database on first run. Create a `lib/db.js` file that:
1. Opens (or creates) the SQLite database at the path specified by `DATABASE_URL`
2. Runs the CREATE TABLE IF NOT EXISTS statements for all tables
3. Creates the necessary indexes
4. Exports the database instance for use throughout the app

---

## 8. Authentication Flow

### 8.1 Credentials Provider (Email/Password)
1. User submits sign-up form -> POST to `/api/auth/signup`
2. Server validates input, hashes password with bcrypt (salt rounds: 12)
3. Creates user record in database
4. Auto-signs in the user via NextAuth
5. Redirect to `/dashboard`

### 8.2 GitHub OAuth Provider
1. User clicks "Sign in with GitHub"
2. NextAuth redirects to GitHub authorization page
3. GitHub redirects back with authorization code
4. NextAuth exchanges code for user profile
5. Server creates or updates user record (matched by `github_id`)
6. Redirect to `/dashboard`

### 8.3 NextAuth Configuration
- **Strategy**: JWT (no database sessions needed)
- **Pages**: Custom sign-in page at `/auth/signin`
- **Callbacks**:
  - `jwt` callback: Include `user.id` in the token
  - `session` callback: Include `token.id` in the session
- **Secret**: From `NEXTAUTH_SECRET` environment variable

---

## 9. Security Requirements

- **No SQL injection**: Use parameterized queries with better-sqlite3 (it uses prepared statements by default)
- **Password hashing**: bcrypt with 12 salt rounds, never store plain text
- **CSRF protection**: Handled by NextAuth automatically
- **Input validation**: Validate all user inputs on the server side
- **Rate limiting**: Enforce on URL creation endpoints
- **No secrets in code**: All sensitive values via environment variables
- **Authorization**: Verify URL ownership before allowing view/edit/delete
- **XSS prevention**: React handles output encoding by default; do not use `dangerouslySetInnerHTML`
- **Semgrep clean**: Code must pass `semgrep scan --config auto` with no high-severity findings

---

## 10. Testing Requirements

Minimum **10 unit tests** using Vitest. Suggested test coverage:

1. **URL validation** — valid URLs are accepted
2. **URL validation** — invalid URLs are rejected
3. **Short code generation** — generates 6-character codes
4. **Short code generation** — codes are unique
5. **Custom alias validation** — valid aliases accepted
6. **Custom alias validation** — invalid aliases rejected (special chars, too short, too long)
7. **Password hashing** — passwords are hashed and verified correctly
8. **Rate limiting** — allows requests under the limit
9. **Rate limiting** — blocks requests over the limit
10. **API: Create URL** — returns correct response structure
11. **API: Create URL** — returns 400 for invalid URL
12. **API: List URLs** — returns only the authenticated user's URLs
13. **Redirect** — returns 302 for valid short code
14. **Redirect** — returns 404 for invalid short code
15. **Analytics** — correctly counts clicks

Place tests in a `__tests__/` directory at the project root.

---

## 11. UI/UX Guidelines

### 11.1 Design System
- **Font**: System font stack (no external font loading)
- **Colors**:
  - Primary: Blue (`#2563EB` / Tailwind `blue-600`)
  - Background: White (`#FFFFFF`) with light gray sections (`#F9FAFB` / `gray-50`)
  - Text: Dark gray (`#111827` / `gray-900`)
  - Accent: Green for success, Red for errors
- **Border radius**: Rounded (`rounded-lg` for cards, `rounded-md` for inputs)
- **Shadows**: Subtle (`shadow-sm` for cards)

### 11.2 Responsive Design
- Mobile-first approach
- Dashboard table switches to card layout on mobile
- Forms are full-width on mobile, constrained on desktop (`max-w-md`)

### 11.3 Loading and Error States
- Show loading spinner or skeleton while data loads
- Display clear error messages for form validation failures
- Toast notifications for actions (URL created, URL deleted, copied to clipboard)

---

## 12. File Structure

```
shipit-capstone/
├── app/
│   ├── layout.js              # Root layout with Tailwind, session provider
│   ├── page.js                # Landing page
│   ├── globals.css            # Tailwind imports and global styles
│   ├── [shortCode]/
│   │   └── route.js           # Redirect handler
│   ├── dashboard/
│   │   ├── page.js            # Dashboard page
│   │   └── [id]/
│   │       └── page.js        # Analytics page
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.js        # Sign in page
│   │   └── signup/
│   │       └── page.js        # Sign up page
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   │   └── route.js   # NextAuth handler
│       │   └── signup/
│       │       └── route.js   # Sign up endpoint
│       └── urls/
│           ├── route.js       # POST (create) and GET (list) URLs
│           └── [id]/
│               ├── route.js   # GET (details) and DELETE URL
│               └── analytics/
│                   └── route.js  # GET analytics
├── lib/
│   ├── db.js                  # Database initialization and connection
│   ├── auth.js                # NextAuth configuration
│   ├── urls.js                # URL-related utility functions
│   └── rate-limit.js          # Rate limiting logic
├── components/
│   ├── Navbar.js              # Navigation bar
│   ├── UrlForm.js             # URL shortening form
│   ├── UrlList.js             # URL list for dashboard
│   ├── UrlCard.js             # Individual URL card
│   ├── AnalyticsChart.js      # Simple analytics display
│   ├── CopyButton.js          # Copy-to-clipboard button
│   └── AuthForm.js            # Shared auth form component
├── __tests__/
│   ├── url-validation.test.js
│   ├── short-code.test.js
│   ├── rate-limit.test.js
│   └── api.test.js
├── public/
│   └── favicon.ico
├── data/                      # SQLite database directory (gitignored)
├── .env.example
├── .env.local                 # Local environment (gitignored)
├── .gitignore
├── .semgrepignore
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── vitest.config.js
├── Dockerfile
├── docker-compose.yml
├── PRD.md
└── README.md
```

---

## 13. Development Workflow

1. **Initialize**: `npm install` to install dependencies
2. **Configure**: Copy `.env.example` to `.env.local` and fill in values
3. **Develop**: `npm run dev` starts the Next.js dev server on port 3000
4. **Test**: `npm test` runs the test suite; `npm run test:coverage` for coverage report
5. **Lint**: `npm run lint` runs ESLint
6. **Security**: `npm run security:scan` runs Semgrep
7. **Build**: `npm run build` creates a production build
8. **Deploy**: Push to GitHub; CI/CD pipeline handles testing and deployment

---

## 14. Deployment Options

### 14.1 Vercel (Recommended for demo)
- Connect GitHub repository to Vercel
- Set environment variables in Vercel dashboard
- Note: SQLite will not persist on Vercel; use PostgreSQL for production via Vercel Postgres or an external provider

### 14.2 Railway
- Connect GitHub repository to Railway
- Add a PostgreSQL plugin for production database
- Set environment variables in Railway dashboard

### 14.3 Docker
- Build: `docker build -t shipit .`
- Run: `docker run -p 3000:3000 --env-file .env shipit`
- Or use Docker Compose: `docker compose up`

---

## 15. Success Criteria

The project is considered complete when:

- [ ] App runs locally with `npm run dev` without errors
- [ ] Users can sign up with email and password
- [ ] Users can sign in with credentials
- [ ] GitHub OAuth sign-in works (when configured)
- [ ] Users can create short URLs from the landing page (anonymous)
- [ ] Users can create short URLs from the dashboard (authenticated)
- [ ] Short URL redirects work correctly (302 redirect)
- [ ] Click tracking records each visit with metadata
- [ ] Dashboard shows all user's URLs with accurate click counts
- [ ] Analytics page shows clicks over time and referrer data
- [ ] Copy-to-clipboard works on short URLs
- [ ] URL validation rejects invalid URLs
- [ ] Custom aliases work and enforce uniqueness
- [ ] Rate limiting prevents abuse
- [ ] Code passes Semgrep security scan with no high-severity findings
- [ ] At least 10 unit tests pass
- [ ] App can be built for production (`npm run build`)
- [ ] Docker image builds successfully

---

## 16. Stretch Goals (Optional)

If time permits, students may add:

- **QR code generation** for each short URL
- **Link expiration** — URLs that auto-expire after a set date
- **Password-protected links** — require a password before redirecting
- **Bulk URL import** — upload a CSV of URLs to shorten
- **API key authentication** — for programmatic access
- **Custom domains** — allow users to use their own domain for short links
- **Link preview** — show Open Graph metadata before redirecting
- **Dark mode** — toggle between light and dark themes
