const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth');

const getTrainerIdByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM trainers WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

const getMemberIdByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM members WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

const syncLoyaltyStatus = async (memberId) => {
  const [rows] = await pool.execute('SELECT id, join_date, is_loyal FROM members WHERE id = ?', [memberId]);
  if (rows.length === 0) {
    return null;
  }

  const member = rows[0];
  const now = new Date();
  const loyalCutoff = new Date(now);
  loyalCutoff.setFullYear(loyalCutoff.getFullYear() - 1);
  const shouldBeLoyal = new Date(member.join_date) <= loyalCutoff;

  if (shouldBeLoyal && !member.is_loyal) {
    await pool.execute('UPDATE members SET is_loyal = 1 WHERE id = ?', [memberId]);
    member.is_loyal = 1;
  }

  return member;
};

const canAccessMember = async (req, memberId) => {
  if (req.user.role === 'ADMIN') {
    return true;
  }

  if (req.user.role === 'MEMBER') {
    const ownMemberId = await getMemberIdByUser(req.user.id);
    return Number(ownMemberId) === Number(memberId);
  }

  if (req.user.role === 'TRAINER') {
    const trainerId = await getTrainerIdByUser(req.user.id);
    const [rows] = await pool.execute('SELECT id FROM members WHERE id = ? AND trainer_id = ?', [memberId, trainerId]);
    return rows.length > 0;
  }

  return false;
};

// Get all members (admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT m.id, m.user_id, m.trainer_id, m.join_date, m.is_loyal, m.referred_by,
             u.full_name, u.email, u.phone, t_u.full_name as trainer_name
      FROM members m 
      JOIN users u ON m.user_id = u.id
      LEFT JOIN trainers t ON m.trainer_id = t.id
      LEFT JOIN users t_u ON t.user_id = t_u.id
      ORDER BY u.full_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get member profile
router.get('/:id', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessMember(req, req.params.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.execute(`
      SELECT m.*, u.full_name, u.email, u.phone,
             t_u.full_name as trainer_name, t_u.email as trainer_email, t_u.phone as trainer_phone
      FROM members m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN trainers t ON m.trainer_id = t.id
      LEFT JOIN users t_u ON t.user_id = t_u.id
      WHERE m.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    const syncedMember = await syncLoyaltyStatus(req.params.id);
    res.json({
      ...rows[0],
      is_loyal: Boolean(syncedMember?.is_loyal),
      referral_code: `RUBY-${rows[0].id}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get referral details
router.get('/:id/referrals', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessMember(req, req.params.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [memberRows] = await pool.execute('SELECT id FROM members WHERE id = ?', [req.params.id]);
    if (memberRows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const [referralRows] = await pool.execute(`
      SELECT m.id, u.full_name, u.email, m.join_date
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.referred_by = ?
      ORDER BY m.join_date DESC, u.full_name
    `, [req.params.id]);

    res.json({
      member_id: Number(req.params.id),
      referral_code: `RUBY-${req.params.id}`,
      referral_link: `https://rubygym.vn/invite/RUBY-${req.params.id}`,
      referred_members: referralRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create member
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { email, password, full_name, phone, trainer_id, join_date, is_loyal, referred_by } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.execute(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, full_name, phone, 'MEMBER']
    );

    const [memberResult] = await pool.execute(
      'INSERT INTO members (user_id, trainer_id, join_date, is_loyal, referred_by) VALUES (?, ?, ?, ?, ?)',
      [userResult.insertId, trainer_id || null, join_date, is_loyal ? 1 : 0, referred_by || null]
    );

    res.status(201).json({ message: 'Member created', memberId: memberResult.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update member
router.put('/:id', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessMember(req, req.params.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.execute(`
      SELECT m.id, m.user_id, m.trainer_id, m.join_date, m.is_loyal, m.referred_by,
             u.full_name, u.email, u.phone
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const existing = rows[0];
    const { full_name, email, phone, trainer_id, join_date, is_loyal, referred_by } = req.body;

    await pool.execute(
      'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
      [
        full_name || existing.full_name,
        email || existing.email,
        phone || existing.phone,
        existing.user_id
      ]
    );

    if (req.user.role === 'ADMIN') {
      await pool.execute(
        'UPDATE members SET trainer_id = ?, join_date = ?, is_loyal = ?, referred_by = ? WHERE id = ?',
        [
          trainer_id !== undefined ? trainer_id : existing.trainer_id,
          join_date || existing.join_date,
          is_loyal !== undefined ? (is_loyal ? 1 : 0) : existing.is_loyal,
          referred_by !== undefined ? referred_by : existing.referred_by,
          req.params.id
        ]
      );
    }

    res.json({ message: 'Member updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete member
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT user_id FROM members WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const userId = rows[0].user_id;

    await pool.execute('UPDATE members SET referred_by = NULL WHERE referred_by = ?', [req.params.id]);
    await pool.execute('DELETE FROM session_members WHERE member_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM monthly_evaluations WHERE member_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM subscriptions WHERE member_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM members WHERE id = ?', [req.params.id]);
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
