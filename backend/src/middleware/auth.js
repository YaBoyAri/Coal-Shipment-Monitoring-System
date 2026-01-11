import { getSessionById } from '../services/sessions.js';

export function getSessionId(req) {
  const header = req.headers.authorization;
  if (header && typeof header === 'string' && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  const sid = req.headers['x-session-id'];
  if (typeof sid === 'string' && sid.trim()) return sid.trim();
  return null;
}

export async function getSession(req) {
  const sid = getSessionId(req);
  if (!sid) return null;

  return await getSessionById(sid);
}

export async function requireAuth(req, res, next) {
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
