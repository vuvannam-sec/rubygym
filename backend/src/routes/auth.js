const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticate } = require('../middlewares/auth');

const addMonths = (dateString, months) => {
  const date = new Date(dateString);
  const day = date.getDate();
  date.setMonth(date.getMonth() + months);

  if (date.getDate() !== day) {
    date.setDate(0);
  }

  return date.toISOString().split('T')[0];
};

const parseReferralCode = (referralCode) => {
  if (!referralCode) {
    return null;
  }

  const matched = String(referralCode).match(/(\d+)$/);
  return matched ? Number(matched[1]) : null;
};

const loadUserContext = async (user) => {
  const contextUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name
  };

  if (user.role === 'TRAINER') {
    const [trainerRows] = await pool.execute('SELECT id FROM trainers WHERE user_id = ?', [user.id]);
    contextUser.trainer_id = trainerRows.length > 0 ? trainerRows[0].id : null;
  }

  if (user.role === 'MEMBER') {
    const [memberRows] = await pool.execute(`
      SELECT m.id, m.trainer_id, m.join_date, m.is_loyal, m.pending_bonus_months,
             u.full_name AS trainer_name, u.email AS trainer_email, u.phone AS trainer_phone
      FROM members m
      LEFT JOIN trainers t ON m.trainer_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE m.user_id = ?
    `, [user.id]);

    if (memberRows.length > 0) {
      contextUser.member_id = memberRows[0].id;
      contextUser.trainer_id = memberRows[0].trainer_id;
      contextUser.join_date = memberRows[0].join_date;
      contextUser.is_loyal = Boolean(memberRows[0].is_loyal);
      contextUser.trainer_name = memberRows[0].trainer_name;
      contextUser.trainer_email = memberRows[0].trainer_email;
      contextUser.trainer_phone = memberRows[0].trainer_phone;
      contextUser.referral_code = `RUBY-${memberRows[0].id}`;
      contextUser.pending_bonus_months = memberRows[0].pending_bonus_months || 0;
    }
  }

  return contextUser;
};

const grantReferralBonus = async (referrerMemberId) => {
  if (!referrerMemberId) {
    return;
  }

  const [subscriptionRows] = await pool.execute(`
    SELECT id, end_date
    FROM subscriptions
    WHERE member_id = ? AND status = 'ACTIVE'
    ORDER BY end_date DESC
    LIMIT 1
  `, [referrerMemberId]);

  if (subscriptionRows.length === 0) {
    await pool.execute(
      'UPDATE members SET pending_bonus_months = COALESCE(pending_bonus_months, 0) + 1 WHERE id = ?',
      [referrerMemberId]
    );
    return;
  }

  const currentEndDate = subscriptionRows[0].end_date;
  const nextEndDate = addMonths(currentEndDate, 1);

  await pool.execute(
    'UPDATE subscriptions SET end_date = ?, is_free_extension = 1 WHERE id = ?',
    [nextEndDate, subscriptionRows[0].id]
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      phone,
      trainer_id,
      referral_code,
      join_date
    } = req.body;

    if (!email || !password || !full_name || !phone) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let trainerId = trainer_id || null;
    if (trainerId) {
      const [trainerRows] = await pool.execute('SELECT id FROM trainers WHERE id = ?', [trainerId]);
      if (trainerRows.length === 0) {
        return res.status(400).json({ error: 'Selected trainer not found' });
      }
    }

    const referrerMemberId = parseReferralCode(referral_code);
    if (referrerMemberId) {
      const [referralRows] = await pool.execute('SELECT id FROM members WHERE id = ?', [referrerMemberId]);
      if (referralRows.length === 0) {
        return res.status(400).json({ error: 'Referral code is invalid' });
      }
    }

    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, full_name, phone, 'MEMBER']
    );

    const [memberResult] = await pool.execute(
      'INSERT INTO members (user_id, trainer_id, join_date, is_loyal, referred_by) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, trainerId, join_date || new Date().toISOString().split('T')[0], 0, referrerMemberId]
    );

    await grantReferralBonus(referrerMemberId);

    res.status(201).json({
      message: 'User registered',
      userId: result.insertId,
      memberId: memberResult.insertId,
      referral_applied: Boolean(referrerMemberId),
      trainer_assigned: Boolean(trainerId)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const contextUser = await loadUserContext(user);

    res.json({ token, user: contextUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, role, full_name FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await loadUserContext(rows[0]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
