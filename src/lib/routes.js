// src/lib/routes.js
'use strict';

const express              = require('express');
const { db, auth }         = require('./firebase');
const { requireAuth, requireAdmin } = require('./authMiddleware');

const router    = express.Router();
const ADMIN_KEY = process.env.ADMIN_REGISTRATION_KEY;
const LOCK_END  = new Date('2026-11-09');

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG  (public — no auth required)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/api/config/firebase', (req, res) => {
  res.json({
    apiKey:            process.env.FIREBASE_API_KEY,
    authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.FIREBASE_PROJECT_ID,
    storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.FIREBASE_APP_ID,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  USERNAME LOOKUP  (public — needed BEFORE login, no auth token yet)
//  Looks up email by username from the server side using Admin SDK,
//  which bypasses Firestore security rules entirely.
// ─────────────────────────────────────────────────────────────────────────────

router.post('/api/auth/lookup', async (req, res) => {
  try {
    let { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    const input = username.trim().toLowerCase();

    // If input looks like an email, return it directly (no DB query needed)
    if (input.includes('@')) {
      return res.json({ 
        email: input,
        source: 'email' 
      });
    }

    // Otherwise, treat it as username and lookup in Firestore
    const snap = await db.collection('users')
      .where('username', '==', input)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ error: 'Username not found' });
    }

    const profile = snap.docs[0].data();

    res.json({ 
      email: profile.email,
      source: 'username'
    });

  } catch (err) {
    console.error('[/api/auth/lookup]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Called AFTER the client creates a Firebase Auth account.
 * Saves profile to Firestore + username index + sets custom claims for admin.
 */
router.post('/api/auth/register', async (req, res) => {
  try {
    const { uid, name, username, email, role, adminKey } = req.body;

    // ── Required fields ─────────────────────────────
    if (!uid || !name || !username || !email) {
      return res.status(400).json({
        error: 'uid, name, username, email are required'
      });
    }

    // ── Verify Firebase Auth user actually exists ──
    try {
      await auth.getUser(uid);
    } catch (_) {
      return res.status(400).json({
        error: 'Invalid Firebase user'
      });
    }

    // ── Normalize input ─────────────────────────────
    const cleanName     = name.trim();
    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail    = email.toLowerCase().trim();

    // ── Prevent duplicate usernames ─────────────────
    const existing = await db.collection('users')
      .where('username', '==', cleanUsername)
      .limit(1)
      .get();

    if (!existing.empty) {
      try { await auth.deleteUser(uid); } catch (_) {}

      return res.status(409).json({
        error: 'Username already taken'
      });
    }

    // ── Role validation ─────────────────────────────
    let userRole = 'contributor';

    if (role === 'admin') {
      if (!ADMIN_KEY) {
        return res.status(500).json({
          error: 'Admin registration disabled'
        });
      }

      if (adminKey !== ADMIN_KEY) {
        try { await auth.deleteUser(uid); } catch (_) {}

        return res.status(403).json({
          error: 'Invalid admin key'
        });
      }

      userRole = 'admin';

      await auth.setCustomUserClaims(uid, {
        role: 'admin'
      });
    }

    // ── Create Firestore profile ────────────────────
    await db.collection('users').doc(uid).set({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      role: userRole,
      createdAt: new Date().toISOString(),
    });

    // ── Audit log ───────────────────────────────────
    await db.collection('logs').add({
      type: 'milestone',
      text: `New user registered: ${cleanName} (@${cleanUsername}) — ${userRole}`,
      date: new Date().toISOString().split('T')[0],
      author: 'System',
      createdAt: new Date(),
    });

    return res.json({
      ok: true,
      name: cleanName,
      role: userRole,
    });

  } catch (err) {
    console.error('[/api/auth/register]', err);

    return res.status(500).json({
      error: process.env.NODE_ENV === 'development'
        ? err.message
        : 'Registration failed'
    });
  }
});

router.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get('/api/auth/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap  = await db.collection('users').orderBy('createdAt', 'asc').get();
    const users = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    res.json({ users });
  } catch (err) {
    console.error('[/api/auth/users]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/auth/users/:uid', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    if (uid === req.user.uid) return res.status(400).json({ error: 'Cannot delete your own account' });
    await auth.deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/auth/users DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  LOGS
// ─────────────────────────────────────────────────────────────────────────────

router.get('/api/logs', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('logs').orderBy('createdAt', 'desc').limit(200).get();
    res.json({ logs: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    console.error('[/api/logs GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/logs', requireAuth, async (req, res) => {
  try {
    const { type, text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const entry = {
      type:      type || 'update',
      text,
      date:      new Date().toISOString().split('T')[0],
      author:    req.user.name,
      createdAt: new Date(),
    };
    const ref = await db.collection('logs').add(entry);
    res.json({ id: ref.id, ...entry });
  } catch (err) {
    console.error('[/api/logs POST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/logs/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('logs').doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/logs DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  RISKS
// ─────────────────────────────────────────────────────────────────────────────

router.get('/api/risks', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('risks').orderBy('createdAt', 'asc').get();
    res.json({ risks: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    console.error('[/api/risks GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/risks', requireAuth, async (req, res) => {
  try {
    const { title, level, category, mitigation, owner } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const entry = {
      title,
      level:      level      || 'MEDIUM',
      category:   category   || 'General',
      mitigation: mitigation || '—',
      owner:      owner      || '—',
      addedBy:    req.user.name,
      createdAt:  new Date(),
    };
    const ref = await db.collection('risks').add(entry);
    res.json({ id: ref.id, ...entry });
  } catch (err) {
    console.error('[/api/risks POST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/risks/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('risks').doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/risks DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  MILESTONES
// ─────────────────────────────────────────────────────────────────────────────

router.get('/api/milestones', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('milestones').orderBy('date', 'asc').get();
    res.json({ milestones: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    console.error('[/api/milestones GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/milestones', requireAuth, async (req, res) => {
  try {
    const { title, date, desc } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const entry = {
      title,
      date:      date || '2027-01',
      desc:      desc || '',
      status:    'pending',
      addedBy:   req.user.name,
      createdAt: new Date(),
    };
    const ref = await db.collection('milestones').add(entry);
    res.json({ id: ref.id, ...entry });
  } catch (err) {
    console.error('[/api/milestones POST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/api/milestones/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    await db.collection('milestones').doc(req.params.id).update({ status });
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/milestones PATCH]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/milestones/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('milestones').doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/milestones DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  USER STATE  (per-user reading list, arch tasks)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/api/state', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('users')
      .doc(req.user.uid).collection('state').doc('main').get();
    res.json({ state: snap.exists ? snap.data() : {} });
  } catch (err) {
    console.error('[/api/state GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/state', requireAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required' });
    await db.collection('users').doc(req.user.uid)
      .collection('state').doc('main')
      .set({ [key]: value }, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/state PUT]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  INSIGHTS
// ─────────────────────────────────────────────────────────────────────────────

router.get('/api/insights', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('insights').orderBy('createdAt', 'desc').get();
    res.json({ insights: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    console.error('[/api/insights GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/insights', requireAuth, async (req, res) => {
  try {
    if (new Date() > LOCK_END) {
      return res.status(403).json({ error: 'Edit window has closed' });
    }
    const { book, author, phase, chapter, notes, category, suggestions } = req.body;
    if (!book || !chapter || !notes) {
      return res.status(400).json({ error: 'book, chapter, and notes are required' });
    }
    const entry = {
      book, author: author || '', phase: phase || '',
      chapter, notes, category: category || '',
      suggestions:    suggestions || [],
      status:         'pending',
      verdict:        '',
      verdictNotes:   '',
      addedBy:        req.user.name,
      addedByUid:     req.user.uid,
      deliberatedBy:  '',
      deliberatedDate:'',
      date:           new Date().toISOString().split('T')[0],
      createdAt:      new Date(),
    };
    const ref = await db.collection('insights').add(entry);
    await db.collection('logs').add({
      type:      'research',
      text:      `Insight logged: "${chapter}" from "${book}" by ${req.user.name}.`,
      date:      entry.date,
      author:    req.user.name,
      createdAt: new Date(),
    });
    res.json({ id: ref.id, ...entry });
  } catch (err) {
    console.error('[/api/insights POST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/api/insights/:id', requireAuth, async (req, res) => {
  try {
    const allowed = ['status','verdict','verdictNotes','deliberatedBy','deliberatedDate'];
    const update  = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (!Object.keys(update).length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    await db.collection('insights').doc(req.params.id).update(update);
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/insights PATCH]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/insights/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('insights').doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/insights DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  MANIFEST  (admin write, all authenticated read)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/api/manifest', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('manifest').orderBy('createdAt', 'asc').get();
    res.json({ manifest: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    console.error('[/api/manifest GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/manifest', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, body, type, source, priority, category } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
    const entry = {
      title, body,
      type:      type     || 'feature',
      source:    source   || '',
      priority:  priority || 'Phase 2',
      category:  category || '',
      addedBy:   req.user.name,
      date:      new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };
    const ref = await db.collection('manifest').add(entry);
    await db.collection('logs').add({
      type:      'milestone',
      text:      `Manifest entry added: "${title}" by ${req.user.name}.`,
      date:      entry.date,
      author:    req.user.name,
      createdAt: new Date(),
    });
    res.json({ id: ref.id, ...entry });
  } catch (err) {
    console.error('[/api/manifest POST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/manifest/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.collection('manifest').doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/manifest DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  SEED  (admin only — call once after first deploy)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/api/admin/seed', requireAuth, requireAdmin, async (req, res) => {
  try {
    const batch = db.batch();

    const defaultRisks = [
      { title: 'Seed funding not secured before MVP build', category: 'Financial',  level: 'HIGH',   mitigation: 'Pursue cloud credits + accelerators. Bootstrap MVP.',        owner: 'Founder' },
      { title: 'AI API costs scale faster than revenue',    category: 'Technical',  level: 'MEDIUM', mitigation: 'Aggressive caching, prompt compression, cost alerts.',        owner: 'Engineering' },
      { title: 'SME digital literacy lower than modeled',   category: 'Market',     level: 'MEDIUM', mitigation: 'UX research with real users. Guided setup for pilots.',       owner: 'Product' },
      { title: 'NDPA enforcement triggers compliance spike', category: 'Regulatory', level: 'LOW',    mitigation: 'Monitor NDPC. Position compliance as primary GTM hook.',      owner: 'Founder' },
    ];
    for (const r of defaultRisks) {
      batch.set(db.collection('risks').doc(), { ...r, createdAt: new Date() });
    }

    const defaultMilestones = [
      { title: 'Project Initiation',         date: '2026-05', desc: 'Pre-dev manifest and planning docs complete.',       status: 'done' },
      { title: 'Pre-Dev Documents Complete', date: '2026-07', desc: 'All 16 pre-dev documents drafted.',                 status: 'pending' },
      { title: 'Architecture Finalized',     date: '2026-08', desc: 'System architecture, threat model, AI governance.', status: 'pending' },
      { title: 'Engineering Kickoff',        date: '2026-09', desc: 'Repo live, CI/CD running, team onboarded.',          status: 'pending' },
      { title: 'MVP Alpha',                  date: '2026-11', desc: 'Core scanning engine operational.',                  status: 'pending' },
      { title: 'MVP Launch',                 date: '2026-12', desc: '10 pilot SME customers onboarded.',                 status: 'pending' },
      { title: 'First Paying Customer',      date: '2027-01', desc: 'Non-pilot subscription live.',                      status: 'pending' },
      { title: '100 Customers',              date: '2027-04', desc: '₦18M ARR run-rate.',                                status: 'pending' },
      { title: 'Phase 2 Launch',             date: '2027-06', desc: 'Endpoint agent and SIEM-lite live.',                status: 'pending' },
      { title: '500 Customers',              date: '2027-10', desc: '₦100M ARR. Series A prep.',                         status: 'pending' },
      { title: 'Phase 3 Launch',             date: '2028-02', desc: 'AI SOC live. MSSP console operational.',            status: 'pending' },
      { title: '2-Year Delivery Complete',   date: '2028-05', desc: 'Full platform. 2,000+ customers. Series A.',        status: 'pending' },
    ];
    for (const m of defaultMilestones) {
      batch.set(db.collection('milestones').doc(), { ...m, createdAt: new Date() });
    }

    const defaultLogs = [
      { type: 'milestone', text: 'Project initiated. Pre-Development Manifest v0.1 complete.',    date: '2026-05-09', author: 'System' },
      { type: 'doc',       text: '5 core documents completed and branded as Phantix Security.',    date: '2026-05-09', author: 'System' },
      { type: 'update',    text: 'Command Centre deployed with Firebase Admin auth + Firestore.',  date: '2026-05-09', author: 'System' },
    ];
    for (const l of defaultLogs) {
      batch.set(db.collection('logs').doc(), { ...l, createdAt: new Date() });
    }

    await batch.commit();
    res.json({ ok: true, message: 'Default data seeded successfully.' });
  } catch (err) {
    console.error('[/api/admin/seed]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
