# ShipIt Capstone — Build Prompts

Build a full-stack URL shortener that combines everything from the bootcamp: REST API, authentication, database, testing, security scanning, CI/CD, and Docker.

This is a PRD-driven project. The `solution/PRD.md` is the complete specification.

## Setup

1. Create a new folder called `shipit-capstone`
2. Copy all files from `solution/` into it (package.json, PRD.md, Dockerfile, docker-compose.yml, .env.example, .gitignore, vitest.config.js, .github/)
3. Run `npm install`
4. Set up your environment:
   ```
   cp .env.example .env.local
   openssl rand -base64 32   # copy the output as NEXTAUTH_SECRET in .env.local
   ```
5. Open Claude Code: `claude`

---

## The main prompt

```
Read PRD.md from top to bottom before writing any code.

Build the complete ShipIt application in this order:
1. lib/db.js — initialize all 4 database tables (users, urls, clicks, rate_limits) and indexes
2. lib/auth.js — NextAuth configuration with credentials provider and JWT strategy
3. lib/urls.js — short code generation (nanoid, 6 chars) and URL validation utilities
4. lib/rate-limit.js — rate limiting logic (100/day per user, 10/day per IP)
5. app/api/auth/signup/route.js — sign up endpoint (hash password with bcrypt, 12 rounds)
6. app/api/urls/route.js — POST (create URL) and GET (list user's URLs with pagination)
7. app/api/urls/[id]/route.js — GET (details) and DELETE (with ownership check)
8. app/api/urls/[id]/analytics/route.js — click analytics
9. app/[shortCode]/route.js — redirect handler: log click, return 302
10. Components: Navbar, UrlForm, UrlList, UrlCard, CopyButton, AuthForm
11. Pages: landing (/), dashboard (/dashboard), analytics (/dashboard/[id]),
    sign in (/auth/signin), sign up (/auth/signup)
12. Tests in __tests__/ — at least 10 tests covering url validation, rate limiting,
    short code generation, and API responses

Follow the file structure in Section 12 of the PRD exactly.
The app must start with `npm run dev` and pass all success criteria in Section 15.
```

---

## Follow-up prompts (use if you get stuck)

**Redirect handler not working:**
```
Fix app/[shortCode]/route.js. It should:
1. Look up the short code in the urls table
2. If not found: render a 404 page with a "Link not found" message and a link back to home
3. If found: insert a click record (url_id, referrer from headers, user-agent from headers)
   then return NextResponse.redirect(originalUrl, { status: 302 })
```

**Auth not working:**
```
Fix lib/auth.js. Set up NextAuth with:
- CredentialsProvider: find user by email in the database, verify password
  with bcrypt.compare, return { id, email, name } or null
- JWT strategy (no database sessions)
- jwt callback: add user.id to the token as token.id = user.id
- session callback: add token.id to session.user.id
- secret from process.env.NEXTAUTH_SECRET
- custom sign-in page at /auth/signin
```

**Rate limiting not working:**
```
Fix lib/rate-limit.js. For a given identifier (user ID or IP address) and today's date:
1. Try to insert { identifier, date, count: 1 } — if it already exists, increment count by 1
   Use SQLite's INSERT OR IGNORE then UPDATE, or INSERT ... ON CONFLICT DO UPDATE
2. Read back the current count
3. Return { allowed: boolean, remaining: number, limit: number }
Use today's date as YYYY-MM-DD format in UTC.
```

**Tests failing:**
```
Run `npm test` and show me the errors. Fix each failing test.
The test files are in __tests__/. Read the source functions in lib/ carefully before changing tests.
Do not modify source files — if a test expectation seems wrong, understand why before changing it.
```

**Docker build failing:**
```
Run `docker build -t shipit .` and show me the error.
Read the Dockerfile and fix the issue. Common causes: missing COPY steps,
wrong working directory, missing build-time environment variables.
After fixing, run `docker compose up` and verify the app starts on http://localhost:3000.
```

---

## Verification checklist

Work through Section 15 (Success Criteria) of the PRD:

- [ ] `npm run dev` starts without errors
- [ ] Sign up with email and password works
- [ ] Sign in with credentials works
- [ ] Landing page URL shortening works (anonymous)
- [ ] Dashboard URL shortening works (authenticated)
- [ ] Visiting a short URL redirects correctly (302)
- [ ] Click count increments on each visit
- [ ] Dashboard shows all user URLs with accurate click counts
- [ ] Analytics page shows clicks by day and top referrers
- [ ] Copy-to-clipboard button works
- [ ] Invalid URLs are rejected with a clear error
- [ ] Custom aliases work and are unique
- [ ] Rate limiting returns 429 when exceeded
- [ ] `npm test` passes with at least 10 tests
- [ ] `npm run build` completes without errors
- [ ] `docker build -t shipit .` succeeds

## Stretch goals (optional)

See Section 16 of the PRD for stretch goals including QR code generation, link expiration, password-protected links, and dark mode.
