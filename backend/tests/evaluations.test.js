process.env.JWT_SECRET = 'test-secret';

jest.mock('../src/config/database', () => ({
  execute: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');
const app = require('../src/index');

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

describe('Monthly Evaluation Routes (FR-EVL)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/evaluations should reject a MEMBER (only trainer/admin)', async () => {
    const token = createToken({ id: 30, role: 'MEMBER', email: 'm@rubygym.com' });

    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ member_id: 5, month_year: '2026-03', actual_weight: 60, actual_bmi: 22 });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Access denied');
  });

  test('POST /api/evaluations should let a trainer evaluate their own client', async () => {
    const token = createToken({ id: 12, role: 'TRAINER', email: 't@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 2 }]]) // getTrainerIdByUser
      .mockResolvedValueOnce([[{ id: 5 }]]) // validateTrainerOwnClient -> owned
      .mockResolvedValueOnce([[]]) // findDuplicateMonthEvaluation -> none
      .mockResolvedValueOnce([[{ target_weight: 58, target_bmi: 21.5 }]]) // getMemberGoal
      .mockResolvedValueOnce([{ insertId: 99 }]); // INSERT

    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ member_id: 5, month_year: '2026-03', actual_weight: 59, actual_bmi: 21.8 });

    expect(res.statusCode).toBe(201);
    expect(res.body.evaluationId).toBe(99);
  });

  test('POST /api/evaluations should reject evaluating a non-assigned member', async () => {
    const token = createToken({ id: 12, role: 'TRAINER', email: 't@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 2 }]]) // getTrainerIdByUser
      .mockResolvedValueOnce([[]]); // validateTrainerOwnClient -> not owned

    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ member_id: 7, month_year: '2026-03', target_weight: 60, actual_weight: 60, target_bmi: 22, actual_bmi: 22 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Trainer can only evaluate their own clients');
  });

  test('POST /api/evaluations should reject a duplicate month for the same member', async () => {
    const token = createToken({ id: 12, role: 'TRAINER', email: 't@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 2 }]]) // getTrainerIdByUser
      .mockResolvedValueOnce([[{ id: 5 }]]) // validateTrainerOwnClient -> owned
      .mockResolvedValueOnce([[{ id: 1 }]]); // findDuplicateMonthEvaluation -> exists

    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ member_id: 5, month_year: '2026-03', target_weight: 60, actual_weight: 60, target_bmi: 22, actual_bmi: 22 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Monthly evaluation already exists for this member');
  });
});
