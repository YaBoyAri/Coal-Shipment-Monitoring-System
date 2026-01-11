import express from 'express';

import { requireAuth } from '../middleware/auth.js';
import {
  listShipping,
  getShippingById,
  createShipping,
  updateShippingPartial,
  deleteShipping
} from '../services/shipping.js';

const router = express.Router();

// GET shipping data
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await listShipping();
    if (!result.ok) return res.status(500).json({ error: result.error });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed', details: err.message });
  }
});

// CREATE shipping data
router.post('/', requireAuth, async (req, res) => {
  try {
    const result = await createShipping(req.body);
    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    res.status(201).json({ id: result.id, message: 'Shipping data created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
});

// GET single shipping item
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const result = await getShippingById(id);
    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    res.json(result.row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed', details: err.message });
  }
});

// UPDATE shipping data (partial update; consistent with frontend payloads)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const result = await updateShippingPartial(id, req.body);
    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    res.json({ message: 'Shipping data updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// DELETE shipping data
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const result = await deleteShipping(id);
    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    res.json({ message: 'Shipping data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

export default router;
