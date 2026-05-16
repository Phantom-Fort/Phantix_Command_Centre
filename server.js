// server.js
// Entry point for both local dev (node server.js) and Vercel (serverless function).
// Vercel routes all traffic here via vercel.json. Express handles:
//   - Static files from /public (HTML, CSS, JS, logo)
//   - API routes from src/lib/routes.js
//   - SPA fallback (index.html for any non-API path)

require('dotenv').config();

const express      = require('express');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const path         = require('path');
const routes       = require('./src/lib/routes');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow requests from the same origin in production (Vercel URL).
// In local dev, allow all origins.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : true;  // true = allow all (used locally)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// ── Static files ───────────────────────────────────────────────────────────────
// Serves everything in /public: index.html, CSS, JS modules, logo.png
// Vercel routes all traffic to this handler, so express.static handles the rest.
app.use(express.static(path.join(__dirname, 'public'), {
  // Send index.html for / but let JS files be served with correct MIME type
  index: 'index.html',
}));

// ── API routes ─────────────────────────────────────────────────────────────────
app.use(routes);

// ── SPA fallback ───────────────────────────────────────────────────────────────
// Any non-API, non-static path serves index.html (lets the frontend handle routing)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `API route not found: ${req.path}` });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Local dev server ───────────────────────────────────────────────────────────
// On Vercel, module.exports = app is used instead of app.listen().
// NODE_ENV is set to 'production' by Vercel automatically.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n  Phantix running → http://localhost:${PORT}`);
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

// ── Vercel serverless export ───────────────────────────────────────────────────
module.exports = app;