import express from "express";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================
// VULNERABILITY #6: Missing CORS configuration
// ------------------------------------------------------------
// The cors package is installed but NEVER used.
// Any origin can make requests to this API, and there is no
// Access-Control-Allow-Origin header management at all.
// In production, this allows malicious sites to make
// authenticated requests on behalf of users.
// ============================================================

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================
// VULNERABILITY #5: Stack traces exposed in error responses
// ------------------------------------------------------------
// There is NO error-handling middleware that sanitizes errors.
// When an unhandled error occurs, Express's default handler
// sends the full stack trace to the client in development mode.
// Attackers can use stack traces to learn about internal paths,
// dependency versions, and application structure.
// ============================================================

app.listen(PORT, () => {
  console.log(`VulnShop API running on http://localhost:${PORT}`);
  console.log("WARNING: This app is deliberately insecure for training!");
});

export default app;
