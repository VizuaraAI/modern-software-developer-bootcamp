import { Router } from "express";
import db from "../database.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// -------------------------------------------------------
// GET /api/products — List all products
// -------------------------------------------------------
router.get("/", (_req, res) => {
  try {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------
// GET /api/products/search?q= — Search products
// -------------------------------------------------------
// ============================================================
// VULNERABILITY #1: SQL Injection
// ------------------------------------------------------------
// The search query is concatenated directly into the SQL string
// instead of using a parameterized placeholder (?).
// An attacker can inject arbitrary SQL:
//   GET /api/products/search?q=' OR 1=1 --
//   GET /api/products/search?q=' UNION SELECT * FROM users --
// This can leak the entire database, including user passwords.
// ============================================================
router.get("/search", (req, res) => {
  const query = req.query.q || "";

  try {
    // BAD: string concatenation — vulnerable to SQL injection
    const sql = `SELECT * FROM products WHERE name LIKE '%${query}%' OR description LIKE '%${query}%'`;
    const products = db.prepare(sql).all();
    res.json(products);
  } catch (err) {
    // VULNERABILITY #5 (continued): raw SQL error returned to client,
    // which helps attackers craft injection payloads.
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------
// GET /api/products/:id — Get single product with reviews
// -------------------------------------------------------
router.get("/:id", (req, res) => {
  try {
    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const reviews = db
      .prepare(
        `SELECT r.*, u.username
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ?
         ORDER BY r.created_at DESC`
      )
      .all(req.params.id);

    res.json({ ...product, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------
// POST /api/products/:id/reviews — Add a review
// -------------------------------------------------------
// ============================================================
// VULNERABILITY #2: Cross-Site Scripting (XSS)
// ------------------------------------------------------------
// The review comment is stored EXACTLY as the user submitted it,
// with no sanitization or encoding. If the comment contains
//   <script>alert('XSS')</script>
// it will be stored in the database and returned in API
// responses verbatim. Any frontend that renders this HTML
// without escaping will execute the attacker's script.
// ============================================================
// Also: VULNERABILITY — No input validation
// There is no check on rating range, comment length, or
// whether the product exists before inserting.
// ============================================================
router.post("/:id/reviews", authenticate, (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  try {
    // No validation: rating could be 999 or -5, comment could be
    // a megabyte of text, productId might not exist.
    const stmt = db.prepare(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(productId, userId, rating, comment);

    // Return the unsanitized comment directly — XSS payload intact
    res.status(201).json({
      id: result.lastInsertRowid,
      product_id: productId,
      user_id: userId,
      rating,
      comment, // <-- raw user input, no escaping
      message: "Review added successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
