const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middlewares/auth');

const PLAN_MONTHS = {
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  ANNUAL: 12
};

const addMonths = (dateString, months) => {
  const date = new Date(dateString);
  const day = date.getDate();
  date.setMonth(date.getMonth() + months);

  if (date.getDate() !== day) {
    date.setDate(0);
  }

  return date.toISOString().split('T')[0];
};

const getTrainerIdByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM trainers WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

const getMemberIdByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM members WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

const canAccessSubscription = async (req, subscriptionId) => {
  if (req.user.role === 'ADMIN') {
    return true;
  }

  const [rows] = await pool.execute('SELECT member_id FROM subscriptions WHERE id = ?', [subscriptionId]);
  if (rows.length === 0) {
    return false;
  }

  if (req.user.role === 'MEMBER') {
    const memberId = await getMemberIdByUser(req.user.id);
    return Number(memberId) === Number(rows[0].member_id);
  }

  if (req.user.role === 'TRAINER') {
    const trainerId = await getTrainerIdByUser(req.user.id);
    const [memberRows] = await pool.execute('SELECT id FROM members WHERE id = ? AND trainer_id = ?', [rows[0].member_id, trainerId]);
    return memberRows.length > 0;
  }

  return false;
};

const getSubscriptionMeta = async (memberId, startDate, planType) => {
  const [memberRows] = await pool.execute(
    'SELECT id, join_date, is_loyal FROM members WHERE id = ?',
    [memberId]
  );

  if (memberRows.length === 0) {
    throw new Error('Member not found');
  }

  const member = memberRows[0];
  const today = new Date();
  const loyalCheckDate = new Date(today);
  loyalCheckDate.setFullYear(loyalCheckDate.getFullYear() - 1);

  const isLoyal = Boolean(member.is_loyal) || new Date(member.join_date) <= loyalCheckDate;
  if (isLoyal && !member.is_loyal) {
    await pool.execute('UPDATE members SET is_loyal = 1 WHERE id = ?', [memberId]);
  }

  const [subscriptionRows] = await pool.execute(
    'SELECT id FROM subscriptions WHERE member_id = ?',
    [memberId]
  );

  const isRenewal = subscriptionRows.length > 0;
  const loyalBonusMonths = isLoyal && isRenewal ? 3 : 0;
  const totalMonths = (PLAN_MONTHS[planType] || 0) + loyalBonusMonths;

  if (!totalMonths) {
    throw new Error('Invalid plan type');
  }

  const start = new Date(startDate);
  const todayString = new Date().toISOString().split('T')[0];

  return {
    isLoyal,
    isRenewal,
    loyalBonusMonths,
    endDate: addMonths(startDate, totalMonths),
    status: start >= new Date(todayString) || startDate === todayString ? 'ACTIVE' : 'ACTIVE'
  };
};

// Get subscriptions
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT s.*, u.full_name as member_name, u.email as member_email, m.join_date, m.is_loyal
      FROM subscriptions s
      JOIN members m ON s.member_id = m.id
      JOIN users u ON m.user_id = u.id
    `;
    const params = [];

    if (req.user.role === 'MEMBER') {
      const memberId = await getMemberIdByUser(req.user.id);
      query += ' WHERE s.member_id = ?';
      params.push(memberId);
    } else if (req.user.role === 'TRAINER') {
      const trainerId = await getTrainerIdByUser(req.user.id);
      query += ' WHERE m.trainer_id = ?';
      params.push(trainerId);
    }

    query += ' ORDER BY s.start_date DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows.map((row) => ({ ...row, is_loyal: Boolean(row.is_loyal) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subscription detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessSubscription(req, req.params.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.execute(`
      SELECT s.*, u.full_name as member_name, u.email as member_email, m.join_date, m.is_loyal
      FROM subscriptions s
      JOIN members m ON s.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ ...rows[0], is_loyal: Boolean(rows[0].is_loyal) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create subscription
router.post('/', authenticate, async (req, res) => {
  try {
    const { member_id, plan_type, start_date } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'MEMBER') {
      const ownMemberId = await getMemberIdByUser(req.user.id);
      if (Number(ownMemberId) !== Number(member_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const meta = await getSubscriptionMeta(member_id, start_date, plan_type);

    const [result] = await pool.execute(
      `INSERT INTO subscriptions (member_id, plan_type, start_date, end_date, is_free_extension, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        member_id,
        plan_type,
        start_date,
        meta.endDate,
        meta.loyalBonusMonths + meta.referralMonths > 0 ? 1 : 0,
        'ACTIVE'
      ]
    );

    res.status(201).json({
      message: 'Subscription created',
      subscriptionId: result.insertId,
      is_loyal: meta.isLoyal,
      is_renewal: meta.isRenewal,
      free_extension_months: meta.loyalBonusMonths,
      end_date: meta.endDate
    });
  } catch (err) {
    if (err.message === 'Member not found' || err.message === 'Invalid plan type') {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: err.message });
  }
});

// Update subscription
router.put('/:id', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessSubscription(req, req.params.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.execute('SELECT * FROM subscriptions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const existing = rows[0];
    const memberId = req.body.member_id || existing.member_id;
    const planType = req.body.plan_type || existing.plan_type;
    const startDate = req.body.start_date || existing.start_date;
    const meta = await getSubscriptionMeta(memberId, startDate, planType);

    await pool.execute(
      `UPDATE subscriptions
       SET member_id = ?, plan_type = ?, start_date = ?, end_date = ?, is_free_extension = ?, status = ?
       WHERE id = ?`,
      [
        memberId,
        planType,
        startDate,
        meta.endDate,
        meta.loyalBonusMonths + meta.referralMonths > 0 ? 1 : 0,
        req.body.status || existing.status,
        req.params.id
      ]
    );

    res.json({
      message: 'Subscription updated',
      is_loyal: meta.isLoyal,
      is_renewal: meta.isRenewal,
      free_extension_months: meta.loyalBonusMonths,
      end_date: meta.endDate
    });
  } catch (err) {
    if (err.message === 'Member not found' || err.message === 'Invalid plan type') {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: err.message });
  }
});

// Delete subscription
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessSubscription(req, req.params.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.execute('SELECT id FROM subscriptions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await pool.execute('DELETE FROM subscriptions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subscription deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
