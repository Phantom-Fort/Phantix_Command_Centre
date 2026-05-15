// server.js — Phantix Command Centre (Vercel + Firebase)
require('dotenv').config();
const express    = require('express');
const cookieParser = require('cookie-parser');
const cors       = require('cors');
const path       = require('path');
const routes     = require('./src/lib/routes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use(routes);

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Phantix running on http://localhost:${PORT}`));
}

module.exports = app;