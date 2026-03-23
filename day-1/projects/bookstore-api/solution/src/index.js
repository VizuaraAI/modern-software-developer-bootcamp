import express from 'express';
import cors from 'cors';
import bookRoutes from './routes/books.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api', bookRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │                                         │
  │   Bookstore API Server                  │
  │                                         │
  │   URL:   http://localhost:${PORT}         │
  │   Docs:  http://localhost:${PORT}/api     │
  │   Health: http://localhost:${PORT}/health  │
  │                                         │
  │   Press Ctrl+C to stop                  │
  │                                         │
  └─────────────────────────────────────────┘
  `);
});

export default app;
