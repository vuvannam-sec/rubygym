const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth');

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

const hasDuplicateEmail = async (email, excludeUserId = 0) => {
  if (!email) {
    return false;
  }

  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE email = ? AND id <> ?',
    [email, excludeUserId]
  );
  return rows.length > 0;
};

const trainerExists = async (trainerId) => {
  if (trainerId === undefined || trainerId === null || trainerId === '') {
    return true;
  }

  const [rows] = await pool.execute('SELECT id FROM trainers WHERE id = ?', [trainerId]);
  return rows.length > 0;
};

const memberExists = async (memberId) => {
  if (memberId === undefined || memberId === null || memberId === '') {
    return true;
  }

  const [rows] = await pool.execute('SELECT id FROM members WHERE id = ?', [memberId]);
  return rows.length > 0;
};

const normalizeCurrentWeight = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return Number(value);
};

const normalizeHeightCm = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return Number(value);
};

const emptyToNull = (value) => (value === undefined || value === '' ? null : value);

const calculateBmi = (weight, heightCm) => {
  const numericWeight = Number(weight);
  const numericHeight = Number(heightCm);

  if (!numericWeight || !numericHeight) {
    return null;
  }

  const heightInMeters = numericHeight / 100;
  if (!heightInMeters) {
    return null;
  }

  return Number((numericWeight / (heightInMeters * heightInMeters)).toFixed(2));
};

const getSubscriptionMeta = async (memberId, startDate, planType, options = {}) => {
  const [memberRows] = await pool.execute(
    'SELECT id, join_date, is_loyal, pending_bonus_months FROM members WHERE id = ?',
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
  const loyalBonusMonths = isLoyal && isRenewal && planType === 'ANNUAL' ? 3 : 0;
  const referralBonusMonths = options.includePendingBonus ? Number(member.pending_bonus_months || 0) : 0;
  const totalMonths = (PLAN_MONTHS[planType] || 0) + loyalBonusMonths + referralBonusMonths;

  if (!totalMonths) {
    throw new Error('Invalid plan type');
  }

  return {
    isLoyal,
    isRenewal,
    loyalBonusMonths,
    referralBonusMonths,
    endDate: addMonths(startDate, totalMonths)
  };
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

  await pool.execute(
    'UPDATE subscriptions SET end_date = ?, is_free_extension = 1 WHERE id = ?',
    [addMonths(subscriptionRows[0].end_date, 1), subscriptionRows[0].id]
  );
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
      SELECT m.id, m.user_id, m.trainer_id, m.join_date, m.current_weight, m.height_cm, m.is_loyal, m.pending_bonus_months, m.referred_by,
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

router.get('/me/onboarding', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [memberRows] = await pool.execute(`
      SELECT m.id, m.user_id, m.trainer_id, m.join_date, m.current_weight, m.height_cm,
             m.is_loyal, m.pending_bonus_months, u.full_name, u.email, u.phone,
             t_u.full_name AS trainer_name
      FROM members m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN trainers t ON m.trainer_id = t.id
      LEFT JOIN users t_u ON t.user_id = t_u.id
      WHERE m.user_id = ?
    `, [req.user.id]);

    if (memberRows.length === 0) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const member = memberRows[0];
    const [subscriptionRows] = await pool.execute(
      'SELECT * FROM subscriptions WHERE member_id = ? ORDER BY start_date DESC, id DESC LIMIT 1',
      [member.id]
    );
    const [trainerRows] = await pool.execute(`
      SELECT t.id, u.full_name, t.specialization
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.full_name
    `);

    // Onboarding scope (ADR-002): body metrics + subscription + trainer preference.
    // The training goal is owned by the member and set separately on the Goals page.
    const hasMetrics = member.current_weight !== null && member.height_cm !== null;
    const completed = Boolean(hasMetrics && subscriptionRows.length > 0);
    const missingSteps = [
      !hasMetrics ? 'PROFILE_METRICS' : null,
      subscriptionRows.length === 0 ? 'SUBSCRIPTION' : null
    ].filter(Boolean);

    res.json({
      completed,
      missing_steps: missingSteps,
      member: {
        ...member,
        is_loyal: Boolean(member.is_loyal),
        current_bmi: calculateBmi(member.current_weight, member.height_cm)
      },
      subscription: subscriptionRows[0] || null,
      trainers: trainerRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me/onboarding', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [memberRows] = await pool.execute(
      'SELECT id, trainer_id, current_weight, height_cm FROM members WHERE user_id = ?',
      [req.user.id]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const member = memberRows[0];
    const {
      current_weight,
      height_cm,
      trainer_id,
      plan_type,
      start_date
    } = req.body;

    const parsedCurrentWeight = normalizeCurrentWeight(current_weight);
    const parsedHeightCm = normalizeHeightCm(height_cm);

    if (parsedCurrentWeight === null || parsedHeightCm === null || !plan_type || !start_date) {
      return res.status(400).json({ error: 'Missing onboarding fields' });
    }

    if (Number.isNaN(parsedCurrentWeight) || parsedCurrentWeight < 20 || parsedCurrentWeight > 350) {
      return res.status(400).json({ error: 'Current weight must be between 20 and 350 kg' });
    }

    if (Number.isNaN(parsedHeightCm) || parsedHeightCm < 100 || parsedHeightCm > 250) {
      return res.status(400).json({ error: 'Height must be between 100 and 250 cm' });
    }

    const nextTrainerId = trainer_id === '' || trainer_id === undefined || trainer_id === null ? null : Number(trainer_id);
    if (nextTrainerId !== null && !(await trainerExists(nextTrainerId))) {
      return res.status(400).json({ error: 'Trainer not found' });
    }

    const meta = await getSubscriptionMeta(member.id, start_date, plan_type, { includePendingBonus: true });

    await pool.execute(
      'UPDATE members SET trainer_id = ?, current_weight = ?, height_cm = ? WHERE id = ?',
      [nextTrainerId, parsedCurrentWeight, parsedHeightCm, member.id]
    );

    const [existingSubscriptions] = await pool.execute(
      'SELECT id FROM subscriptions WHERE member_id = ? ORDER BY start_date DESC, id DESC LIMIT 1',
      [member.id]
    );

    let subscriptionId = existingSubscriptions[0]?.id;
    if (subscriptionId) {
      await pool.execute(
        `UPDATE subscriptions
         SET plan_type = ?, start_date = ?, end_date = ?, is_free_extension = ?, status = 'ACTIVE'
         WHERE id = ?`,
        [
          plan_type,
          start_date,
          meta.endDate,
          meta.loyalBonusMonths > 0 || meta.referralBonusMonths > 0 ? 1 : 0,
          subscriptionId
        ]
      );
    } else {
      const [subscriptionResult] = await pool.execute(
        `INSERT INTO subscriptions (member_id, plan_type, start_date, end_date, is_free_extension, status)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [
          member.id,
          plan_type,
          start_date,
          meta.endDate,
          meta.loyalBonusMonths > 0 || meta.referralBonusMonths > 0 ? 1 : 0
        ]
      );
      subscriptionId = subscriptionResult.insertId;
    }

    if (meta.referralBonusMonths > 0) {
      await pool.execute('UPDATE members SET pending_bonus_months = 0 WHERE id = ?', [member.id]);
    }

    // Note (ADR-002): the training goal is intentionally NOT written here.
    // Members own and edit their goal via PUT /api/goals/me on the Goals page.

    res.json({
      message: 'Onboarding completed',
      completed: true,
      member: {
        id: member.id,
        trainer_id: nextTrainerId,
        current_weight: parsedCurrentWeight,
        height_cm: parsedHeightCm,
        current_bmi: calculateBmi(parsedCurrentWeight, parsedHeightCm)
      },
      subscription: {
        id: subscriptionId,
        member_id: member.id,
        plan_type,
        start_date,
        end_date: meta.endDate,
        status: 'ACTIVE'
      },
      free_extension_months: meta.loyalBonusMonths,
      referral_bonus_months: meta.referralBonusMonths
    });
  } catch (err) {
    if (err.message === 'Member not found' || err.message === 'Invalid plan type') {
      return res.status(400).json({ error: err.message });
    }

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
    const { email, password, full_name, phone, trainer_id, join_date, current_weight, height_cm, is_loyal, referred_by } = req.body;

    if (!email || !password || !full_name || !phone || !join_date) {
      return res.status(400).json({ error: 'Missing required member fields' });
    }

    const parsedCurrentWeight = normalizeCurrentWeight(current_weight);
    const parsedHeightCm = normalizeHeightCm(height_cm);
    if (parsedCurrentWeight !== null && Number.isNaN(parsedCurrentWeight)) {
      return res.status(400).json({ error: 'Current weight must be a number' });
    }

    if (parsedHeightCm !== null && Number.isNaN(parsedHeightCm)) {
      return res.status(400).json({ error: 'Height must be a number' });
    }

    if (await hasDuplicateEmail(email)) {
      return res.status(400).json({ error: 'Duplicate email' });
    }

    if (!(await trainerExists(trainer_id))) {
      return res.status(400).json({ error: 'Trainer not found' });
    }

    if (!(await memberExists(referred_by))) {
      return res.status(400).json({ error: 'Referrer member not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.execute(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, full_name, phone, 'MEMBER']
    );

    const [memberResult] = await pool.execute(
      'INSERT INTO members (user_id, trainer_id, join_date, current_weight, height_cm, is_loyal, referred_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userResult.insertId, trainer_id || null, join_date, parsedCurrentWeight, parsedHeightCm, is_loyal ? 1 : 0, referred_by || null]
    );

    await grantReferralBonus(referred_by);

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
      SELECT m.id, m.user_id, m.trainer_id, m.join_date, m.current_weight, m.height_cm, m.is_loyal, m.pending_bonus_months, m.referred_by,
             u.full_name, u.email, u.phone
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const existing = rows[0];
    const { full_name, email, phone, trainer_id, join_date, current_weight, height_cm, is_loyal, referred_by } = req.body;
    const parsedCurrentWeight = normalizeCurrentWeight(current_weight);
    const parsedHeightCm = normalizeHeightCm(height_cm);

    if (parsedCurrentWeight !== null && Number.isNaN(parsedCurrentWeight)) {
      return res.status(400).json({ error: 'Current weight must be a number' });
    }

    if (parsedHeightCm !== null && Number.isNaN(parsedHeightCm)) {
      return res.status(400).json({ error: 'Height must be a number' });
    }

    if (await hasDuplicateEmail(email, existing.user_id)) {
      return res.status(400).json({ error: 'Duplicate email' });
    }

    if (req.user.role === 'ADMIN' && !(await trainerExists(trainer_id))) {
      return res.status(400).json({ error: 'Trainer not found' });
    }

    if (req.user.role === 'ADMIN' && !(await memberExists(referred_by))) {
      return res.status(400).json({ error: 'Referrer member not found' });
    }

    const nextTrainerId = trainer_id === '' ? null : trainer_id;
    const nextReferredBy = referred_by === '' ? null : referred_by;
    const nextCurrentWeight = current_weight === undefined ? existing.current_weight : parsedCurrentWeight;
    const nextHeightCm = height_cm === undefined ? existing.height_cm : parsedHeightCm;

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
        'UPDATE members SET trainer_id = ?, join_date = ?, current_weight = ?, height_cm = ?, is_loyal = ?, referred_by = ? WHERE id = ?',
        [
          nextTrainerId !== undefined ? nextTrainerId : existing.trainer_id,
          join_date || existing.join_date,
          nextCurrentWeight,
          nextHeightCm,
          is_loyal !== undefined ? (is_loyal ? 1 : 0) : existing.is_loyal,
          nextReferredBy !== undefined ? nextReferredBy : existing.referred_by,
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
    await pool.execute('DELETE FROM training_goals WHERE member_id = ?', [req.params.id]);
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
