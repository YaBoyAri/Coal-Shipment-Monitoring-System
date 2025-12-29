import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend PTBA is running!' });
});

// GET shipping data
app.get('/api/shipping', async (req, res) => {
  try {
    if (!pool) {
      pool = await createPool();
      if (!pool) return res.status(500).json({ error: 'Database not configured or unreachable' });
    }
    const [rows] = await pool.query('SELECT * FROM shipping_data ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed', details: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
