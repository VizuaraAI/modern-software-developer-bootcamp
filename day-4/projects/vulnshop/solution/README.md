# VulnShop -- Deliberately Insecure E-Commerce API

> **WARNING**: This application is **intentionally insecure**. It was built
> for the Day 4 workshop on AI Testing, Security, and Secure Vibe Coding.
> **DO NOT deploy this to any public server or use it as a reference for
> production code.**

## Purpose

VulnShop is a small Express.js e-commerce API with **8 planted security
vulnerabilities**. During the workshop you will:

1. Run **Semgrep** against the codebase to see which vulnerabilities an
   automated scanner can detect.
2. Use **Claude Code** to perform an AI-assisted security audit and find
   the vulnerabilities that Semgrep misses.
3. Fix each vulnerability and verify the fix.

## Getting started

```bash
# Install dependencies
npm install

# Create the uploads directory
mkdir -p uploads

# Start the server
npm start
```

The API runs on `http://localhost:3000`.

## API endpoints

| Method | Path                        | Auth? | Description             |
|--------|-----------------------------|-------|-------------------------|
| POST   | /api/auth/register          | No    | Register a new user     |
| POST   | /api/auth/login             | No    | Log in, receive JWT     |
| GET    | /api/products               | No    | List all products       |
| GET    | /api/products/search?q=     | No    | Search products by name |
| GET    | /api/products/:id           | No    | Get product + reviews   |
| POST   | /api/products/:id/reviews   | Yes   | Add a review            |
| POST   | /api/upload                 | Yes   | Upload a product image  |
| GET    | /api/health                 | No    | Health check            |

## Exercise

1. **Scan with Semgrep**
   ```bash
   semgrep scan --config auto .
   ```
2. **Audit with Claude Code**
   ```
   > Review this codebase for security vulnerabilities. List each one
   > with its location, severity, and a recommended fix.
   ```
3. Compare the results. How many of the 8 vulnerabilities did each tool find?

---

<details>
<summary><strong>Spoiler: list of planted vulnerabilities (do NOT open until after the exercise)</strong></summary>

1. SQL Injection in product search
2. Cross-Site Scripting (XSS) in product reviews
3. Hardcoded JWT secret
4. No rate limiting on login endpoint
5. Stack traces exposed in error responses
6. Missing CORS configuration
7. No file type validation on upload
8. Cleartext password storage

See `VULNERABILITIES.md` for the full answer key with locations, severity
ratings, and fixes.

</details>
