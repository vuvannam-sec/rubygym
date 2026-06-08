process.env.JWT_SECRET = 'test-secret';

jest.mock('../src/config/database', () => ({
  execute: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');
const app = require('../src/index');

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

describe('Member Onboarding Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/members/me/onboarding should report missing member setup steps', async () => {
    const token = createToken({ id: 30, role: 'MEMBER', email: 'new@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{
        id: 5,
        user_id: 30,
        trainer_id: null,
        join_date: '2026-06-08',
        current_weight: null,
        height_cm: null,
        is_loyal: 0,
        pending_bonus_months: 0,
        full_name: 'New Member',
        email: 'new@rubygym.com',
        phone: '0909999999',
        trainer_name: null
      }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ id: 1, full_name: 'Trainer One', specialization: 'Strength' }]]);

    const res = await request(app)
      .get('/api/members/me/onboarding')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(false);
    // ADR-002: onboarding no longer includes the training goal step.
    expect(res.body.missing_steps).toEqual(['PROFILE_METRICS', 'SUBSCRIPTION']);
    expect(res.body).not.toHaveProperty('goal');
  });

  test('PUT /api/members/me/onboarding should save metrics, plan and trainer but NOT the goal', async () => {
    const token = createToken({ id: 30, role: 'MEMBER', email: 'new@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 5, trainer_id: null, current_weight: 70, height_cm: 171 }]])
      .mockResolvedValueOnce([[{ id: 2 }]])
      .mockResolvedValueOnce([[{ id: 5, join_date: '2026-06-08', is_loyal: 0, pending_bonus_months: 0 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 12 }]);

    const res = await request(app)
      .put('/api/members/me/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_weight: 70.4,
        height_cm: 171,
        trainer_id: 2,
        plan_type: 'QUARTERLY',
        start_date: '2026-06-08'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.member.current_bmi).toBe(24.08);
    expect(res.body.subscription.end_date).toBe('2026-09-08');
    expect(res.body).not.toHaveProperty('goal');
    expect(pool.execute).toHaveBeenCalledWith(
      'UPDATE members SET trainer_id = ?, current_weight = ?, height_cm = ? WHERE id = ?',
      [2, 70.4, 171, 5]
    );
    // ADR-002: onboarding must NOT write the training goal (owned by member via /goals/me).
    const wroteGoal = pool.execute.mock.calls.some(
      ([sql]) => typeof sql === 'string' && sql.includes('training_goals')
    );
    expect(wroteGoal).toBe(false);
  });
});
