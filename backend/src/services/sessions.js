import { ensurePool } from '../db/pool.js';

export async function getSessionById(sid) {
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

export async function createSession({ sid, user }) {
  const p = await ensurePool();
  if (!p) return null;

  const ttlDays = process.env.SESSION_TTL_DAYS ? Number(process.env.SESSION_TTL_DAYS) : 7;
  const expires = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  const data = JSON.stringify({ user });
  await p.query('INSERT INTO sessions (sid, expires, data) VALUES (?, ?, ?)', [sid, expires, data]);

  return { sid, expires, data: { user } };
}
