# Testing, CI/CD, and Shipping to Production

The last mile from "works on my machine" to "deployed, tested, and monitored in production" is where most AI-built projects die. This guide covers the testing pyramid, CI/CD pipelines, Docker, and deployment.

---

## The Testing Pyramid

```
                    ┌─────────┐
                    │  E2E    │   ~10% — Few, slow, expensive
                    │ Browser │   But catch REAL user bugs
                    ├─────────┤
                    │  Integ- │   ~20% — Medium count
                    │  ration │   Test component interactions
                    ├─────────┤
                    │         │
                    │  Unit   │   ~70% — Many, fast, cheap
                    │  Tests  │   Test individual functions
                    │         │
                    └─────────┘

   Target:  ~70% unit  |  ~20% integration  |  ~10% E2E
```

| Level | What It Tests | Tool (JS) | Tool (Python) | Speed |
|-------|--------------|-----------|---------------|-------|
| **Unit** | Individual functions, edge cases | Vitest | pytest | < 1 second |
| **Integration** | Full API pipeline, mocked externals | Vitest + supertest | pytest + TestClient | 1-5 seconds |
| **E2E** | Full user flow in a real browser | Playwright | Playwright | 5-30 seconds |

Unit tests check if your **functions** work. Integration tests check if your **endpoints** work. E2E tests check if your **users** can use the app.

---

## Unit Tests

Test each function in isolation. Fast to write, fast to run, easy to debug.

```javascript
// vitest example
import { describe, it, expect } from 'vitest';
import { generateShortCode, isValidUrl } from '../lib/urls.js';

describe('generateShortCode', () => {
  it('generates a 6-character code', () => {
    expect(generateShortCode()).toHaveLength(6);
  });

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 1000 }, generateShortCode));
    expect(codes.size).toBe(1000);
  });
});

describe('isValidUrl', () => {
  it('accepts valid https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('rejects URLs without protocol', () => {
    expect(isValidUrl('example.com')).toBe(false);
  });
});
```

---

## Integration Tests

Test API endpoints end-to-end with a real (test) database. Mock only external services.

```javascript
// vitest + supertest example
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('POST /api/urls', () => {
  it('creates a short URL for a valid URL', async () => {
    const res = await request(app)
      .post('/api/urls')
      .send({ url: 'https://example.com/very/long/path' });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toHaveLength(6);
    expect(res.body.originalUrl).toBe('https://example.com/very/long/path');
  });

  it('returns 400 for an invalid URL', async () => {
    const res = await request(app)
      .post('/api/urls')
      .send({ url: 'not-a-url' });

    expect(res.status).toBe(400);
  });
});
```

---

## E2E Tests with Playwright

Playwright opens a real browser and simulates real user interactions.

```javascript
// playwright example
import { test, expect } from '@playwright/test';

test('user can shorten a URL and copy it', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Fill in the URL form
  await page.fill('[data-testid="url-input"]', 'https://example.com/long/path');
  await page.click('[data-testid="shorten-button"]');

  // Wait for the result
  const shortUrl = page.locator('[data-testid="short-url"]');
  await expect(shortUrl).toBeVisible();

  // Screenshot for debugging
  await page.screenshot({ path: 'tests/screenshots/url-shortened.png' });

  // Click copy
  await page.click('[data-testid="copy-button"]');
});
```

**Add `data-testid` attributes** to every interactive element — this makes selectors stable and independent of CSS changes.

---

## CI/CD with GitHub Actions

A CI/CD pipeline runs your tests automatically on every push and deploys on merge to main.

### Code Review Pipeline (`.github/workflows/code-review.yml`)

Triggers on every pull request:

```yaml
name: Code Review
on:
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - uses: actions/cache@v4
        with:
          path: node_modules
          key: node-modules-${{ hashFiles('package-lock.json') }}
      - run: npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 14

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: semgrep/semgrep-action@v1
        with:
          publishToken: ${{ secrets.SEMGREP_APP_TOKEN }}
```

### Deploy Pipeline (`.github/workflows/deploy.yml`)

Triggers on push to main:

```yaml
name: Deploy
on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g vercel
      - run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Key principle**: The deploy job runs `needs: build-and-test` — deploy is blocked if any test fails.

---

## Docker

Docker packages your app and its dependencies into a portable container that runs identically everywhere.

### Basic Dockerfile (Node.js)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 3000
CMD ["node", "server.js"]
```

### Common Commands

```bash
# Build an image
docker build -t my-app .

# Run a container
docker run -p 3000:3000 --env-file .env my-app

# Docker Compose (for multi-container setups)
docker compose up        # start all services
docker compose down      # stop and remove containers
docker compose logs -f   # follow logs
```

### docker-compose.yml Example

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

volumes:
  postgres_data:
```

---

## Deployment Options

| Platform | Best For | SQLite? | Free Tier? |
|----------|----------|---------|------------|
| **Vercel** | Next.js apps | No (use Neon or Vercel Postgres) | Yes |
| **Railway** | Any Node/Python + PostgreSQL | No (use Railway Postgres) | Yes ($5/month after trial) |
| **Fly.io** | Docker containers, long-running processes | Yes (persistent volumes) | Yes |
| **Render** | Web services + background workers | Yes (disk) | Yes (spins down on free) |

For the capstone (ShipIt), Vercel is recommended for the app + use Neon for a free PostgreSQL database in production.

---

## The v3 Sprint Pattern

```
/prd v3

When it asks what v3 is about:

v3 is the "production-ready" sprint. Three areas:

1. TESTING (testing pyramid)
   - More unit tests for all modules
   - Integration tests for all API endpoints
   - Playwright E2E tests for the main user flows

2. CI/CD
   - GitHub Actions: test + security scan on PRs
   - GitHub Actions: deploy to Vercel on merge to main

3. DOCKER
   - Dockerfile for production build
   - docker-compose.yml for local development
   - Verify the image builds and runs correctly
```
