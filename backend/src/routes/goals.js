const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middlewares/auth');

const emptyToNull = (value) => (value === undefined || value === '' ? null : value);

const getMemberByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id, trainer_id FROM members WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0] : null;
};

const getTrainerIdByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM trainers WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

const canViewMemberGoal = async (req, memberId) => {
  if (req.user.role === 'ADMIN') {
    return true;
  }

  if (req.user.role === 'MEMBER') {
    const member = await getMemberByUser(req.user.id);
    return member && Number(member.id) === Number(memberId);
  }

  if (req.user.role === 'TRAINER') {
    const trainerId = await getTrainerIdByUser(req.user.id);
    const [rows] = await pool.execute(
      'SELECT id FROM members WHERE id = ? AND trainer_id = ?',
      [memberId, trainerId]
    );
    return rows.length > 0;
  }

  return false;
};

const canUpdateMemberGoal = async (req, memberId) => {
  if (req.user.role !== 'MEMBER') {
    return false;
  }

  const member = await getMemberByUser(req.user.id);
  return member && Number(member.id) === Number(memberId);
};

const findGoal = async (memberId) => {
  const [rows] = await pool.execute(
    `SELECT tg.*, u.full_name AS member_name
     FROM training_goals tg
     JOIN members m ON tg.member_id = m.id
     JOIN users u ON m.user_id = u.id
     WHERE tg.member_id = ?`,
    [memberId]
  );
  return rows.length > 0 ? rows[0] : null;
};

const upsertGoal = async (memberId, payload) => {
  const goalType = payload.goal_type || 'General fitness';
  const targetWeight = emptyToNull(payload.target_weight);
  const targetBmi = emptyToNull(payload.target_bmi);
  const targetDate = emptyToNull(payload.target_date);
  const notes = emptyToNull(payload.notes);

  await pool.execute(
    `INSERT INTO training_goals (member_id, goal_type, target_weight, target_bmi, target_date, notes)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       goal_type = VALUES(goal_type),
       target_weight = VALUES(target_weight),
       target_bmi = VALUES(target_bmi),
       target_date = VALUES(target_date),
       notes = VALUES(notes),
       updated_at = CURRENT_TIMESTAMP`,
    [memberId, goalType, targetWeight, targetBmi, targetDate, notes]
  );

  return {
    member_id: Number(memberId),
    goal_type: goalType,
    target_weight: targetWeight,
    target_bmi: targetBmi,
    target_date: targetDate,
    notes
  };
};

router.get('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = await getMemberByUser(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const goal = await findGoal(member.id);
    if (!goal) {
      return res.status(404).json({ error: 'Training goal not found' });
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = await getMemberByUser(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const goal = await upsertGoal(member.id, req.body);
    res.json({ message: 'Training goal saved', goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const allowed = await canViewMemberGoal(req, req.params.memberId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const goal = await findGoal(req.params.memberId);
    if (!goal) {
      return res.status(404).json({ error: 'Training goal not found' });
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/member/:memberId', authenticate, async (req, res) => {
  try {
    const allowed = await canUpdateMemberGoal(req, req.params.memberId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const goal = await upsertGoal(req.params.memberId, req.body);
    res.json({ message: 'Training goal saved', goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
