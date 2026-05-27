process.env.JWT_SECRET = 'test-secret';

jest.mock('../src/config/database', () => ({
  execute: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');
const app = require('../src/index');

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

describe('Training Goal Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('PUT /api/goals/me should let member save their own training goal', async () => {
    const token = createToken({ id: 30, role: 'MEMBER', email: 'member@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 5, trainer_id: 2 }]])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/api/goals/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        goal_type: 'Fat loss',
        target_weight: 58,
        target_bmi: 21.5,
        target_date: '2026-08-31',
        notes: 'Focus on consistency.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Training goal saved');
    expect(res.body.goal.member_id).toBe(5);
    expect(res.body.goal.target_weight).toBe(58);
  });

  test('GET /api/goals/member/:id should allow trainer to view assigned member goal', async () => {
    const token = createToken({ id: 12, role: 'TRAINER', email: 'trainer@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 2 }]])
      .mockResolvedValueOnce([[{ id: 5 }]])
      .mockResolvedValueOnce([[{
        id: 1,
        member_id: 5,
        member_name: 'Member Five',
        goal_type: 'Muscle gain',
        target_weight: 74,
        target_bmi: 23,
        target_date: '2026-09-30',
        notes: 'Progressive overload'
      }]]);

    const res = await request(app)
      .get('/api/goals/member/5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.member_id).toBe(5);
    expect(res.body.goal_type).toBe('Muscle gain');
  });

  test('PUT /api/goals/member/:id should reject member updating another member goal', async () => {
    const token = createToken({ id: 30, role: 'MEMBER', email: 'member@rubygym.com' });

    pool.execute.mockResolvedValueOnce([[{ id: 5, trainer_id: 2 }]]);

    const res = await request(app)
      .put('/api/goals/member/6')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal_type: 'Should fail' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Access denied');
  });
});
