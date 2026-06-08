const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth');

const getTrainerIdByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM trainers WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

const canAccessTrainer = async (req, trainerId) => {
  if (req.user.role === 'ADMIN') {
    return true;
  }

  if (req.user.role === 'TRAINER') {
    const ownTrainerId = await getTrainerIdByUser(req.user.id);
    return Number(ownTrainerId) === Number(trainerId);
  }

  return false;
};

// Public trainer list for member registration
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT t.id, u.full_name, t.specialization
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.full_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all trainers
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT t.id, t.user_id, u.full_name, u.email, u.phone, t.specialization, t.max_daily_hours
      FROM trainers t JOIN users u ON t.user_id = u.id
      ORDER BY u.full_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trainer's clients
router.get('/:id/clients', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessTrainer(req, req.params.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.execute(`
      SELECT m.id, u.full_name, u.email, u.phone, m.join_date, m.current_weight, m.height_cm, m.is_loyal,
             tg.goal_type, tg.target_weight, tg.target_bmi, tg.target_date, tg.notes AS goal_notes
      FROM members m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN training_goals tg ON tg.member_id = m.id
      WHERE m.trainer_id = ?
      ORDER BY u.full_name
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trainer detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT t.id, t.user_id, t.specialization, t.max_daily_hours, u.full_name, u.email, u.phone
      FROM trainers t JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create trainer
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { email, password, full_name, phone, specialization, max_daily_hours } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.execute(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, full_name, phone, 'TRAINER']
    );

    const [trainerResult] = await pool.execute(
      'INSERT INTO trainers (user_id, specialization, max_daily_hours) VALUES (?, ?, ?)',
      [userResult.insertId, specialization || null, max_daily_hours || 8]
    );

    res.status(201).json({ message: 'Trainer created', trainerId: trainerResult.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update trainer
router.put('/:id', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessTrainer(req, req.params.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [existingRows] = await pool.execute(`
      SELECT t.id, t.user_id, t.specialization, t.max_daily_hours, u.full_name, u.email, u.phone
      FROM trainers t JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const existing = existingRows[0];
    const { full_name, email, phone, specialization, max_daily_hours } = req.body;

    await pool.execute(
      'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
      [
        full_name || existing.full_name,
        email || existing.email,
        phone || existing.phone,
        existing.user_id
      ]
    );

    await pool.execute(
      'UPDATE trainers SET specialization = ?, max_daily_hours = ? WHERE id = ?',
      [
        specialization || existing.specialization,
        max_daily_hours || existing.max_daily_hours,
        req.params.id
      ]
    );

    res.json({ message: 'Trainer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete trainer
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT user_id FROM trainers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const userId = rows[0].user_id;

    await pool.execute('UPDATE members SET trainer_id = NULL WHERE trainer_id = ?', [req.params.id]);
    await pool.execute(`
      DELETE sm
      FROM session_members sm
      JOIN training_sessions ts ON sm.session_id = ts.id
      WHERE ts.trainer_id = ?
    `, [req.params.id]);
    await pool.execute('DELETE FROM training_sessions WHERE trainer_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM monthly_evaluations WHERE trainer_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM trainers WHERE id = ?', [req.params.id]);
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Trainer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
