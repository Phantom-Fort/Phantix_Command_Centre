// src/lib/authMiddleware.js
'use strict';

const { auth, db } = require('./firebase');   // ← fixed: was '../../public/js/firebase'

async function requireAuth(req, res, next) {
  try {
    const authHeader  = req.headers.authorization || '';
    const cookieToken = req.cookies?.phantix_token;
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cookieToken;

    if (!token) return res.status(401).json({ error: 'Unauthorized — no token provided' });

    const decoded = await auth.verifyIdToken(token);
    const snap    = await db.collection('users').doc(decoded.uid).get();
    const profile = snap.exists ? snap.data() : {};

    req.user = {
      uid:   decoded.uid,
      email: decoded.email,
      name:  profile.name || decoded.email,
      role:  profile.role || 'contributor',
    };
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.code || err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
