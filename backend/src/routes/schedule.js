const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middlewares/auth');

const MORNING_START = 5 * 60;
const MORNING_END = 11 * 60 + 30;
const AFTERNOON_START = 13 * 60 + 30;
const AFTERNOON_END = 20 * 60;
const EVENING_START = 17 * 60;

const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(':').map(Number);
  return (hours * 60) + minutes;
};

const getDurationMinutes = (startTime, endTime) => toMinutes(endTime) - toMinutes(startTime);

const getSessionPeriod = (startTime) => {
  const start = toMinutes(startTime);

  if (start < MORNING_END) {
    return 'MORNING';
  }

  if (start < EVENING_START) {
    return 'AFTERNOON';
  }

  return 'EVENING';
};

const isWithinOperatingHours = (startTime, endTime) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  const morningValid = start >= MORNING_START && end <= MORNING_END;
  const afternoonValid = start >= AFTERNOON_START && end <= AFTERNOON_END;

  return morningValid || afternoonValid;
};

const isWithinMonthlyCycle = (sessionDate) => {
  const targetDate = new Date(sessionDate);
  if (Number.isNaN(targetDate.getTime())) {
    return false;
  }

  const now = new Date();
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cycleEnd = new Date(cycleStart);
  cycleEnd.setDate(cycleEnd.getDate() + 31);

  return targetDate >= cycleStart && targetDate <= cycleEnd;
};

const rangesOverlap = (startA, endA, startB, endB) => (
  toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA)
);

const getTrainerIdByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id FROM trainers WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

const getMemberIdByUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id, trainer_id FROM members WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0] : null;
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

const canAccessMember = async (req, memberId) => {
  if (req.user.role === 'ADMIN') {
    return true;
  }

  if (req.user.role === 'MEMBER') {
    const ownMember = await getMemberIdByUser(req.user.id);
    return ownMember && Number(ownMember.id) === Number(memberId);
  }

  if (req.user.role === 'TRAINER') {
    const trainerId = await getTrainerIdByUser(req.user.id);
    const [rows] = await pool.execute('SELECT id FROM members WHERE id = ? AND trainer_id = ?', [memberId, trainerId]);
    return rows.length > 0;
  }

  return false;
};

const validateSessionRules = async ({ trainer_id, session_date, start_time, end_time, member_ids, sessionId }) => {
  if (!trainer_id || !session_date || !start_time || !end_time) {
    return 'Missing required session fields';
  }

  const durationMinutes = getDurationMinutes(start_time, end_time);
  if (durationMinutes <= 0) {
    return 'End time must be after start time';
  }

  if (durationMinutes > 120) {
    return 'Session duration cannot exceed 2 hours';
  }

  if (!isWithinMonthlyCycle(session_date)) {
    return 'Session date must be within the monthly scheduling cycle';
  }

  if (!isWithinOperatingHours(start_time, end_time)) {
    return 'Session must be within operating hours';
  }

  if (member_ids && member_ids.length > 3) {
    return 'A session can have at most 3 members';
  }

  const [trainerOverlapRows] = await pool.execute(`
    SELECT id
    FROM training_sessions
    WHERE trainer_id = ? AND session_date = ? AND id <> ?
      AND start_time < ? AND end_time > ?
    LIMIT 1
  `, [trainer_id, session_date, sessionId || 0, end_time, start_time]);

  if (trainerOverlapRows.length > 0) {
    return 'Trainer already has another session during this time';
  }

  const [trainerSessions] = await pool.execute(`
    SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) as total_minutes
    FROM training_sessions
    WHERE trainer_id = ? AND session_date = ? AND id <> ?
  `, [trainer_id, session_date, sessionId || 0]);

  if ((Number(trainerSessions[0].total_minutes) + durationMinutes) > 480) {
    return 'Trainer has reached 8h limit for this day';
  }

  if (member_ids && member_ids.length > 0) {
    const placeholders = member_ids.map(() => '?').join(', ');

    const [memberRows] = await pool.execute(
      `SELECT id, trainer_id FROM members WHERE id IN (${placeholders})`,
      member_ids
    );

    if (memberRows.length !== member_ids.length) {
      return 'One or more members not found';
    }

    const invalidMember = memberRows.find((member) => Number(member.trainer_id) !== Number(trainer_id));
    if (invalidMember) {
      return 'Member must belong to the selected trainer';
    }

    const [memberSchedules] = await pool.execute(`
      SELECT sm.member_id, ts.start_time, ts.end_time
      FROM session_members sm
      JOIN training_sessions ts ON sm.session_id = ts.id
      WHERE ts.session_date = ? AND ts.id <> ? AND sm.member_id IN (${placeholders})
    `, [session_date, sessionId || 0, ...member_ids]);

    const memberScheduleMap = memberSchedules.reduce((accumulator, row) => {
      const memberId = Number(row.member_id);
      const current = accumulator.get(memberId) || [];
      current.push(row);
      accumulator.set(memberId, current);
      return accumulator;
    }, new Map());

    const overloadedMember = member_ids.find((memberId) => (memberScheduleMap.get(Number(memberId)) || []).length >= 3);
    if (overloadedMember) {
      return 'Member has reached 3 sessions for this day';
    }

    const sessionPeriod = getSessionPeriod(start_time);
    const conflictingPeriodMember = member_ids.find((memberId) => {
      const schedules = memberScheduleMap.get(Number(memberId)) || [];
      return schedules.some((session) => getSessionPeriod(session.start_time) === sessionPeriod);
    });

    if (conflictingPeriodMember) {
      return 'Member can only join one session in each period (morning, afternoon, evening)';
    }

    const overlappingMember = member_ids.find((memberId) => {
      const schedules = memberScheduleMap.get(Number(memberId)) || [];
      return schedules.some((session) => rangesOverlap(start_time, end_time, session.start_time, session.end_time));
    });

    if (overlappingMember) {
      return 'Member already has another session during this time';
    }
  }

  return null;
};

const replaceSessionMembers = async (sessionId, memberIds) => {
  await pool.execute('DELETE FROM session_members WHERE session_id = ?', [sessionId]);

  if (memberIds && memberIds.length > 0) {
    for (const memberId of memberIds) {
      await pool.execute(
        'INSERT INTO session_members (session_id, member_id) VALUES (?, ?)',
        [sessionId, memberId]
      );
    }
  }
};

// Get schedule for a trainer
router.get('/trainer/:trainerId', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessTrainer(req, req.params.trainerId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.execute(`
      SELECT ts.*, GROUP_CONCAT(u.full_name ORDER BY u.full_name SEPARATOR ', ') as members
      FROM training_sessions ts
      LEFT JOIN session_members sm ON ts.id = sm.session_id
      LEFT JOIN members m ON sm.member_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE ts.trainer_id = ?
      GROUP BY ts.id
      ORDER BY ts.session_date, ts.start_time
    `, [req.params.trainerId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get schedule for a member
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const allowed = await canAccessMember(req, req.params.memberId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.execute(`
      SELECT ts.*, t_u.full_name as trainer_name
      FROM training_sessions ts
      JOIN session_members sm ON ts.id = sm.session_id
      JOIN trainers t ON ts.trainer_id = t.id
      JOIN users t_u ON t.user_id = t_u.id
      WHERE sm.member_id = ?
      ORDER BY ts.session_date, ts.start_time
    `, [req.params.memberId]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get session detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT ts.*, GROUP_CONCAT(sm.member_id ORDER BY sm.member_id SEPARATOR ',') as member_ids
      FROM training_sessions ts
      LEFT JOIN session_members sm ON ts.id = sm.session_id
      WHERE ts.id = ?
      GROUP BY ts.id
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const allowed = await canAccessTrainer(req, rows[0].trainer_id);
    let memberAllowed = false;

    if (!allowed) {
      const ownMember = await getMemberIdByUser(req.user.id);
      if (req.user.role === 'MEMBER' && ownMember) {
        const memberIds = rows[0].member_ids ? rows[0].member_ids.split(',').map(Number) : [];
        memberAllowed = memberIds.includes(Number(ownMember.id));
      }
    }

    if (!allowed && !memberAllowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      ...rows[0],
      member_ids: rows[0].member_ids ? rows[0].member_ids.split(',').map(Number) : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create session
router.post('/', authenticate, async (req, res) => {
  try {
    const { trainer_id, session_date, start_time, end_time, member_ids = [], session_type } = req.body;

    if (!['ADMIN', 'TRAINER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'TRAINER') {
      const ownTrainerId = await getTrainerIdByUser(req.user.id);
      if (Number(ownTrainerId) !== Number(trainer_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const validationError = await validateSessionRules({
      trainer_id,
      session_date,
      start_time,
      end_time,
      member_ids
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO training_sessions (trainer_id, session_date, start_time, end_time, session_type) VALUES (?, ?, ?, ?, ?)',
      [trainer_id, session_date, start_time, end_time, session_type || 'Cá nhân']
    );

    await replaceSessionMembers(result.insertId, member_ids);
    
    res.status(201).json({ message: 'Session created', sessionId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update session
router.put('/:id', authenticate, async (req, res) => {
  try {
    const [existingRows] = await pool.execute('SELECT * FROM training_sessions WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const existing = existingRows[0];
    const allowed = await canAccessTrainer(req, existing.trainer_id);

    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      trainer_id = existing.trainer_id,
      session_date = existing.session_date,
      start_time = existing.start_time,
      end_time = existing.end_time,
      session_type = existing.session_type,
      member_ids = null
    } = req.body;

    const [memberRows] = await pool.execute('SELECT member_id FROM session_members WHERE session_id = ?', [req.params.id]);
    const finalMemberIds = Array.isArray(member_ids) ? member_ids : memberRows.map((row) => row.member_id);

    const validationError = await validateSessionRules({
      trainer_id,
      session_date,
      start_time,
      end_time,
      member_ids: finalMemberIds,
      sessionId: req.params.id
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    await pool.execute(
      'UPDATE training_sessions SET trainer_id = ?, session_date = ?, start_time = ?, end_time = ?, session_type = ? WHERE id = ?',
      [trainer_id, session_date, start_time, end_time, session_type || 'Cá nhân', req.params.id]
    );

    await replaceSessionMembers(req.params.id, finalMemberIds);

    res.json({ message: 'Session updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete session
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT trainer_id FROM training_sessions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const allowed = await canAccessTrainer(req, rows[0].trainer_id);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.execute('DELETE FROM session_members WHERE session_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM training_sessions WHERE id = ?', [req.params.id]);

    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
