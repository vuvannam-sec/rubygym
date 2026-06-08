process.env.JWT_SECRET = 'test-secret';

jest.mock('../src/config/database', () => ({
  execute: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');
const app = require('../src/index');

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);
// Use LOCAL date parts (not UTC) so it matches the server's local-date scheduling cycle.
// Using toISOString() here caused a timezone-boundary flake (UTC vs +07:00) after local midnight.
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

describe('Schedule Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/schedule should reject sessions over 2 hours', async () => {
    const token = createToken({ id: 1, role: 'ADMIN', email: 'admin@rubygym.com' });

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 1,
        session_date: today(),
        start_time: '05:00:00',
        end_time: '07:30:00',
        member_ids: [2]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Session duration cannot exceed 2 hours');
  });

  test('POST /api/schedule should reject lunch-break sessions', async () => {
    const token = createToken({ id: 1, role: 'ADMIN', email: 'admin@rubygym.com' });

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 1,
        session_date: today(),
        start_time: '11:00:00',
        end_time: '12:00:00',
        member_ids: [2]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Session must be within operating hours');
  });

  test('POST /api/schedule should reject empty member list', async () => {
    const token = createToken({ id: 1, role: 'ADMIN', email: 'admin@rubygym.com' });

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 1,
        session_date: today(),
        start_time: '05:30:00',
        end_time: '06:30:00',
        member_ids: []
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Session must include at least one member');
  });

  test('GET /api/schedule/member/:memberId should reject member reading another schedule', async () => {
    const token = createToken({ id: 20, role: 'MEMBER', email: 'member@rubygym.com' });
    pool.execute.mockResolvedValueOnce([[{ id: 5, trainer_id: 1 }]]);

    const res = await request(app)
      .get('/api/schedule/member/6')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Access denied');
  });

  test('POST /api/schedule should create valid admin session for assigned members', async () => {
    const token = createToken({ id: 1, role: 'ADMIN', email: 'admin@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total_minutes: 120 }]])
      .mockResolvedValueOnce([[{ id: 2, trainer_id: 1 }, { id: 3, trainer_id: 1 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 44 }])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 1,
        session_date: today(),
        start_time: '05:00:00',
        end_time: '06:00:00',
        session_type: 'Nhóm nhỏ',
        member_ids: [2, 3]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.sessionId).toBe(44);
  });
});
