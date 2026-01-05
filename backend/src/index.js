import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create MySQL pool if config provided
let pool = null;
async function createPool() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;
  if (!DB_HOST || !DB_USER || !DB_DATABASE) return null;
  try {
    const p = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD || '',
      database: DB_DATABASE,
      port: DB_PORT ? Number(DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    // test connection
    await p.query('SELECT 1');
    return p;
  } catch (err) {
    console.error('MySQL pool creation failed:', err.message);
    return null;
  }
}

async function ensurePool() {
  if (!pool) {
    pool = await createPool();
  }
  return pool;
}

function getSessionId(req) {
  const header = req.headers.authorization;
  if (header && typeof header === 'string' && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  const sid = req.headers['x-session-id'];
  if (typeof sid === 'string' && sid.trim()) return sid.trim();
  return null;
}

async function getSession(req) {
  const sid = getSessionId(req);
  if (!sid) return null;

  const p = await ensurePool();
  if (!p) return null;

  const [rows] = await p.query('SELECT sid, expires, data FROM sessions WHERE sid = ? LIMIT 1', [sid]);
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const row = rows[0];
  if (row.expires && new Date(row.expires).getTime() <= Date.now()) return null;

  let data = null;
  try {
    data = row.data ? JSON.parse(row.data) : null;
  } catch {
    data = null;
  }

  return { sid: row.sid, expires: row.expires, data };
}

async function requireAuth(req, res, next) {
  try {
    const session = await getSession(req);
    if (!session || !session.data || !session.data.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = session.data.user;
    req.sessionId = session.sid;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Auth check failed' });
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend PTBA is running!' });
});

// AUTH: Login with email or name ("username" field)
app.post('/api/auth/login', async (req, res) => {
  try {
    const p = await ensurePool();
    if (!p) return res.status(500).json({ error: 'Database not configured or unreachable' });

    const username = (req.body?.username ?? req.body?.email ?? '').toString().trim();
    const password = (req.body?.password ?? '').toString();
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const [rows] = await p.query(
      'SELECT id, uuid, name, email, password, role FROM users WHERE email = ? OR name = ? LIMIT 1',
      [username, username]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const sid = crypto.randomUUID();
    const ttlDays = process.env.SESSION_TTL_DAYS ? Number(process.env.SESSION_TTL_DAYS) : 7;
    const expires = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    const safeUser = { id: user.id, uuid: user.uuid, name: user.name, email: user.email, role: user.role };
    const data = JSON.stringify({ user: safeUser });

    await p.query('INSERT INTO sessions (sid, expires, data) VALUES (?, ?, ?)', [sid, expires, data]);

    res.json({ sid, expires, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// AUTH: Current user (requires Authorization: Bearer <sid>)
app.get('/api/auth/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

// GET shipping data
app.get('/api/shipping', requireAuth, async (req, res) => {
  try {
    const p = await ensurePool();
    if (!p) return res.status(500).json({ error: 'Database not configured or unreachable' });
    const [rows] = await p.query('SELECT * FROM shipping_data ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed', details: err.message });
  }
});

// CREATE shipping data
app.post('/api/shipping', requireAuth, async (req, res) => {
  try {
    const p = await ensurePool();
    if (!p) return res.status(500).json({ error: 'Database not configured or unreachable' });

    const {
      tug_barge_name,
      brand,
      tonnage,
      buyer,
      pod,
      jetty,
      status,
      est_commenced_loading,
      est_completed_loading,
      rata_rata_muat,
      si_spk
    } = req.body;

    // Validate required fields
    if (!tug_barge_name || !brand || !tonnage || !buyer || !pod || !jetty || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await p.query(
      `INSERT INTO shipping_data 
       (tug_barge_name, brand, tonnage, buyer, pod, jetty, status, est_commenced_loading, est_completed_loading, rata_rata_muat, si_spk) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tug_barge_name,
        brand,
        tonnage,
        buyer,
        pod,
        jetty,
        status,
        est_commenced_loading || null,
        est_completed_loading || null,
        rata_rata_muat || null,
        si_spk || null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Shipping data created successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
});

// GET single shipping item
app.get('/api/shipping/:id', requireAuth, async (req, res) => {
  try {
    const p = await ensurePool();
    if (!p) return res.status(500).json({ error: 'Database not configured or unreachable' });

    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const [rows] = await p.query('SELECT * FROM shipping_data WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: 'Data not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed', details: err.message });
  }
});

// UPDATE shipping data
app.put('/api/shipping/:id', requireAuth, async (req, res) => {
  try {
    const p = await ensurePool();
    if (!p) return res.status(500).json({ error: 'Database not configured or unreachable' });

    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    // Allow partial updates: build SET clause from provided fields
    const allowed = [
      'tug_barge_name',
      'brand',
      'tonnage',
      'buyer',
      'pod',
      'jetty',
      'status',
      'est_commenced_loading',
      'est_completed_loading',
      'rata_rata_muat',
      'si_spk'
    ];

    const updates = [];
    const params = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates.push(`${key} = ?`);
        // allow explicit null
        params.push(req.body[key] == null ? null : req.body[key]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    const sql = `UPDATE shipping_data SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await p.query(sql, params);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Data not found' });

    res.json({ message: 'Shipping data updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// DELETE shipping data
app.delete('/api/shipping/:id', requireAuth, async (req, res) => {
  try {
    const p = await ensurePool();
    if (!p) return res.status(500).json({ error: 'Database not configured or unreachable' });

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const [result] = await p.query('DELETE FROM shipping_data WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json({ message: 'Shipping data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
