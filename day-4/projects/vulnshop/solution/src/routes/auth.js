import { Router } from "express";
import jwt from "jsonwebtoken";
import db from "../database.js";

const router = Router();

// ============================================================
// VULNERABILITY #3: Hardcoded JWT secret
// ------------------------------------------------------------
// The JWT signing secret is hardcoded directly in source code.
// Anyone who reads the source (or decompiles the binary) can
// forge valid tokens for ANY user, including admin accounts.
// Secrets must come from environment variables or a vault.
// ============================================================
const JWT_SECRET = "super-secret-key-123";

// ============================================================
// VULNERABILITY #4: No rate limiting on login
// ------------------------------------------------------------
// There is no rate limiter on the login endpoint. An attacker
// can attempt thousands of password guesses per second
// (brute-force / credential-stuffing attack) with no throttle.
// ============================================================

// -------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // VULNERABILITY #8 (continued): password stored in cleartext
    const stmt = db.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
    );
    const result = stmt.run(username, email, password);

    const token = jwt.sign(
      { id: result.lastInsertRowid, username, role: "customer" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: result.lastInsertRowid, username, email },
    });
  } catch (err) {
    // VULNERABILITY #5 (continued): raw error message sent to client
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = stmt.get(username);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // VULNERABILITY #8 (continued): plain-text comparison instead of
    // bcrypt.compare() — because the password was never hashed.
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { JWT_SECRET };
export default router;
