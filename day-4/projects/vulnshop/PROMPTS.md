# VulnShop Security Audit — Build Prompts

> **Warning:** VulnShop is intentionally insecure. Do NOT deploy it to any public server.

VulnShop is an e-commerce API with 8 planted security vulnerabilities. Use Claude Code to find them all and fix them.

## Setup

1. Copy the `solution/` folder into a new folder called `vulnshop`
2. Run `npm install && mkdir -p uploads`
3. Open Claude Code: `claude`

---

## Prompt 1 — Initial audit (do not fix yet)

```
Review every file in src/ for security vulnerabilities.
For each vulnerability you find, list:
- Location: file name and line number
- Vulnerability type: (e.g., SQL Injection, XSS, hardcoded secret)
- Severity: Critical / High / Medium / Low
- Attack scenario: what could an attacker do with this?
- Recommended fix: how to resolve it

Do not modify any code yet. Just audit and list.
```

---

## Prompt 2 — Fix the vulnerabilities

```
Fix all the security vulnerabilities you identified. For each fix:
1. Show the vulnerable code (before)
2. Show the fixed code (after)
3. Explain in one sentence why the fix prevents the attack

After fixing everything, start the server with `npm start` and verify it still works.
Test the health endpoint and one of the product endpoints to confirm nothing is broken.
```

---

## Prompt 3 — Run Semgrep (optional, if installed)

```
Run: semgrep scan --config auto src/

Compare Semgrep's findings with the vulnerabilities you found manually:
- How many did Semgrep catch?
- Which ones did Semgrep miss that you found?
- Which ones did Semgrep flag that you had already identified?

What does this tell us about using automated scanners vs manual review?
```

---

## Prompt 4 — Verify the fixes

```
For each of these attack scenarios, confirm the fix is in place and explain how the fixed code prevents it:

1. SQL Injection: Can an attacker use the product search endpoint to dump all users?
2. XSS: Can an attacker store a <script> tag in a product review?
3. Hardcoded secret: What was the JWT secret and why is a hardcoded secret dangerous?
4. Rate limiting: Can an attacker brute-force the login endpoint?
5. Stack traces: Does the error handler now hide internal details from API responses?
6. CORS: Which origins are now allowed?
7. File upload: What file types are now rejected?
8. Password storage: Are passwords now hashed before being stored?
```

---

## Verification checklist

8 vulnerabilities total — confirm all are fixed:

- [ ] SQL Injection — product search uses parameterized queries
- [ ] XSS — review text is sanitized before storage or output
- [ ] Hardcoded JWT secret — moved to environment variable
- [ ] No rate limiting on login — rate limiting added
- [ ] Stack traces in error responses — error handler returns generic messages
- [ ] Missing CORS configuration — CORS headers configured correctly
- [ ] No file type validation on upload — only images allowed
- [ ] Cleartext password storage — passwords hashed with bcrypt

Check `solution/VULNERABILITIES.md` for the full answer key with locations and severity ratings.
