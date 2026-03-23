# ShipIt -- URL Shortener Service

A full-stack URL shortening service with user authentication and click analytics. Built as the capstone project for the Modern Software Developer bootcamp.

## What Is ShipIt?

ShipIt lets users shorten long URLs, share them, and track how many clicks their links receive. It supports:

- **Anonymous shortening** -- paste a URL and get a short link instantly
- **User accounts** -- sign up with email/password or GitHub OAuth
- **Dashboard** -- manage all your shortened URLs in one place
- **Click analytics** -- see total clicks, clicks over time, and referrer sources
- **Custom aliases** -- choose your own short code (e.g., `/my-link`)

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Framework      | Next.js 14 (App Router)           |
| Database (dev) | SQLite via better-sqlite3         |
| Database (prod)| PostgreSQL                        |
| Styling        | Tailwind CSS                      |
| Auth           | NextAuth.js (GitHub + Credentials)|
| Testing        | Vitest + v8 coverage              |
| Security       | Semgrep static analysis           |
| CI/CD          | GitHub Actions                    |
| Deployment     | Vercel / Railway / Docker         |

## Architecture

```
+--------------------------------------------------+
|                   Browser                        |
+--------------------------------------------------+
         |                            |
         v                            v
+------------------+     +------------------------+
|   Landing Page   |     |      Dashboard         |
|   (anonymous)    |     |   (authenticated)      |
+------------------+     +------------------------+
         |                            |
         v                            v
+--------------------------------------------------+
|              Next.js API Routes                  |
|   POST /api/urls    GET /api/urls                |
|   GET /api/urls/:id DELETE /api/urls/:id         |
|   GET /api/urls/:id/analytics                    |
+--------------------------------------------------+
         |                     |
         v                     v
+------------------+  +-------------------+
|   NextAuth.js    |  |   Rate Limiter    |
| (JWT sessions)   |  | (per-user/per-IP) |
+------------------+  +-------------------+
         |                     |
         v                     v
+--------------------------------------------------+
|              SQLite Database                     |
|   users | urls | clicks | rate_limits            |
+--------------------------------------------------+

Redirect Flow:
  Browser -> GET /:shortCode -> Log Click -> 302 Redirect -> Original URL
```

## How to Build It

This project is designed to be built using Claude Code. Feed the PRD to Claude and build the entire app live:

1. Open a terminal in this directory
2. Launch Claude Code:
   ```bash
   claude
   ```
3. Give Claude the PRD:
   ```
   Read PRD.md and build the entire ShipIt application based on the requirements.
   Start with the database layer, then auth, then the API routes, then the UI.
   ```
4. Claude Code will generate all the files, and you can iterate on the result.

## Running Locally

### Prerequisites
- Node.js 20+
- npm 10+

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Generate a NextAuth secret
openssl rand -base64 32
# Paste the output as the NEXTAUTH_SECRET value in .env.local

# Start the dev server
npm run dev
```

The app will be running at http://localhost:3000.

### GitHub OAuth (Optional)

To enable GitHub sign-in:

1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set the callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret into `.env.local`

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Security Scanning

```bash
# Run Semgrep security scan
npm run security:scan
```

This runs Semgrep with the `auto` config, which includes rules for JavaScript, Next.js, and common security issues.

## Linting

```bash
npm run lint
```

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to a GitHub repository
2. Go to https://vercel.com and import the repository
3. Set the environment variables in the Vercel dashboard:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `GITHUB_CLIENT_ID` (if using GitHub OAuth)
   - `GITHUB_CLIENT_SECRET` (if using GitHub OAuth)
4. Deploy

Note: SQLite does not persist on Vercel's serverless environment. For production, switch to PostgreSQL using Vercel Postgres or an external provider like Neon.

### Option 2: Railway

1. Push your code to GitHub
2. Go to https://railway.app and create a new project from the repo
3. Add a PostgreSQL plugin
4. Set environment variables
5. Deploy

### Option 3: Docker

```bash
# Build the image
docker build -t shipit .

# Run the container
docker run -p 3000:3000 --env-file .env shipit

# Or use Docker Compose
docker compose up
```

## Project Structure

```
shipit-capstone/
├── app/                    # Next.js App Router pages and API routes
│   ├── layout.js           # Root layout
│   ├── page.js             # Landing page
│   ├── [shortCode]/        # Redirect handler
│   ├── dashboard/          # Dashboard and analytics pages
│   ├── auth/               # Sign in and sign up pages
│   └── api/                # API endpoints
├── lib/                    # Shared utilities
│   ├── db.js               # Database connection and init
│   ├── auth.js             # NextAuth configuration
│   ├── urls.js             # URL utility functions
│   └── rate-limit.js       # Rate limiting logic
├── components/             # React components
├── __tests__/              # Test files
├── public/                 # Static assets
├── PRD.md                  # Product Requirements Document
├── package.json            # Dependencies and scripts
├── vitest.config.js        # Test configuration
├── Dockerfile              # Production Docker image
├── docker-compose.yml      # Local Docker setup
└── .github/workflows/      # CI/CD pipeline
```

## Environment Variables

| Variable               | Required | Description                          |
|------------------------|----------|--------------------------------------|
| `DATABASE_URL`         | Yes      | SQLite file path or PostgreSQL URL   |
| `NEXTAUTH_SECRET`      | Yes      | Random secret for JWT signing        |
| `NEXTAUTH_URL`         | Yes      | Base URL of the application          |
| `GITHUB_CLIENT_ID`     | No       | GitHub OAuth app client ID           |
| `GITHUB_CLIENT_SECRET` | No       | GitHub OAuth app client secret       |

## License

This project is part of the Modern Software Developer bootcamp. Built for educational purposes.
