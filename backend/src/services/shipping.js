import { ensurePool } from '../db/pool.js';

export async function listShipping() {
  const p = await ensurePool();
  if (!p) return { ok: false, error: 'Database not configured or unreachable' };

  const [rows] = await p.query('SELECT * FROM shipping_data ORDER BY id ASC');
  return { ok: true, rows };
}

export async function getShippingById(id) {
  const p = await ensurePool();
  if (!p) return { ok: false, error: 'Database not configured or unreachable' };

  const [rows] = await p.query('SELECT * FROM shipping_data WHERE id = ? LIMIT 1', [id]);
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, status: 404, error: 'Data not found' };
  return { ok: true, row: rows[0] };
}

export async function createShipping(body) {
  const p = await ensurePool();
  if (!p) return { ok: false, error: 'Database not configured or unreachable' };

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
  } = body;

  if (!tug_barge_name || !brand || !tonnage || !buyer || !pod || !jetty || !status) {
    return { ok: false, status: 400, error: 'Missing required fields' };
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

  return { ok: true, id: result.insertId };
}

export async function updateShippingPartial(id, body) {
  const p = await ensurePool();
  if (!p) return { ok: false, error: 'Database not configured or unreachable' };

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
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates.push(`${key} = ?`);
      params.push(body[key] == null ? null : body[key]);
    }
  }

  if (updates.length === 0) return { ok: false, status: 400, error: 'No fields to update' };

  params.push(id);

  const sql = `UPDATE shipping_data SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await p.query(sql, params);

  if (result.affectedRows === 0) return { ok: false, status: 404, error: 'Data not found' };
  return { ok: true };
}

export async function deleteShipping(id) {
  const p = await ensurePool();
  if (!p) return { ok: false, error: 'Database not configured or unreachable' };

  const [result] = await p.query('DELETE FROM shipping_data WHERE id = ?', [id]);
  if (result.affectedRows === 0) return { ok: false, status: 404, error: 'Data not found' };
  return { ok: true };
}
