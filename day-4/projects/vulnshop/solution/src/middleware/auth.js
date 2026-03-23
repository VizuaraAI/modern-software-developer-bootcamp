import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../routes/auth.js";

/**
 * Express middleware that verifies a JWT bearer token.
 *
 * Expected header:  Authorization: Bearer <token>
 *
 * On success, attaches the decoded payload to `req.user` and
 * calls `next()`.  On failure, returns 401 or 403.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header provided" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: "Authorization header must be: Bearer <token>" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
}
