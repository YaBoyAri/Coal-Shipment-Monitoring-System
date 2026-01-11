import mysql from 'mysql2/promise';

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

export async function ensurePool() {
  if (!pool) {
    pool = await createPool();
  }
  return pool;
}
