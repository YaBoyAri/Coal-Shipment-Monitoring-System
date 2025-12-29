import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

async function main() {
  const host = requireEnv('DB_HOST');
  const user = requireEnv('DB_USER');
  const database = requireEnv('DB_DATABASE');
  const password = process.env.DB_PASSWORD || '';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  const adminName = process.env.ADMIN_NAME || 'Admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@local.test';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminRole = process.env.ADMIN_ROLE || 'admin';

  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    port
  });

  try {
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', [adminEmail]);
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`Admin already exists for email: ${adminEmail}`);
      return;
    }

    const uuid = crypto.randomUUID();
    const hashed = await bcrypt.hash(adminPassword, 10);

    await connection.query(
      'INSERT INTO users (uuid, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [uuid, adminName, adminEmail, hashed, adminRole]
    );

    console.log('Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Seed admin failed:', err.message);
  process.exitCode = 1;
});
