import { ensurePool } from '../db/pool.js';

export async function findUserByUsername(username) {
  const p = await ensurePool();
  if (!p) return null;

  const [rows] = await p.query(
    'SELECT id, uuid, name, email, password, role FROM users WHERE email = ? OR name = ? LIMIT 1',
    [username, username]
  );

  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0];
}
