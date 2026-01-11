import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

import { requireAuth } from '../middleware/auth.js';
import { findUserByUsername } from '../services/users.js';
import { createSession } from '../services/sessions.js';

const router = express.Router();

// AUTH: Login with email or name ("username" field)
router.post('/login', async (req, res) => {
  try {
    const username = (req.body?.username ?? req.body?.email ?? '').toString().trim();
    const password = (req.body?.password ?? '').toString();
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const sid = crypto.randomUUID();
    const safeUser = { id: user.id, uuid: user.uuid, name: user.name, email: user.email, role: user.role };

    const session = await createSession({ sid, user: safeUser });
    if (!session) return res.status(500).json({ error: 'Database not configured or unreachable' });

    res.json({ sid: session.sid, expires: session.expires, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// AUTH: Current user (requires Authorization: Bearer <sid>)
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
