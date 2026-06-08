const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth');

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, u.full_name as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.event_date ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get event detail (public)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, u.full_name as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create event
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, description, event_date, image_url } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO events (title, description, event_date, image_url, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description || null, event_date || null, image_url || null, req.user.id]
    );

    res.status(201).json({ message: 'Event created', eventId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existing = rows[0];
    const { title, description, event_date, image_url } = req.body;

    await pool.execute(
      'UPDATE events SET title = ?, description = ?, event_date = ?, image_url = ? WHERE id = ?',
      [
        title || existing.title,
        description !== undefined ? description : existing.description,
        event_date || existing.event_date,
        image_url !== undefined ? image_url : existing.image_url,
        req.params.id
      ]
    );

    res.json({ message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
