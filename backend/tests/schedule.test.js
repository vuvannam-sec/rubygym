process.env.JWT_SECRET = 'test-secret';

jest.mock('../src/config/database', () => ({
  execute: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');
const app = require('../src/index');

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

describe('Schedule Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/schedule should reject sessions outside operating hours', async () => {
    const token = createToken({ id: 5, role: 'TRAINER', email: 'trainer@rubygym.com' });
    pool.execute.mockResolvedValueOnce([[{ id: 2 }]]);

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 2,
        session_date: '2026-04-14',
        start_time: '12:00:00',
        end_time: '13:00:00',
        member_ids: []
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Session must be within operating hours');
  });

  test('POST /api/schedule should reject sessions longer than 2 hours', async () => {
    const token = createToken({ id: 5, role: 'TRAINER', email: 'trainer@rubygym.com' });
    pool.execute.mockResolvedValueOnce([[{ id: 2 }]]);

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 2,
        session_date: '2026-04-14',
        start_time: '05:00:00',
        end_time: '07:30:00',
        member_ids: []
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Session duration cannot exceed 2 hours');
  });

  test('POST /api/schedule should reject more than 3 members in one session', async () => {
    const token = createToken({ id: 5, role: 'TRAINER', email: 'trainer@rubygym.com' });
    pool.execute.mockResolvedValueOnce([[{ id: 2 }]]);

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 2,
        session_date: '2026-04-14',
        start_time: '05:00:00',
        end_time: '06:00:00',
        member_ids: [1, 2, 3, 4]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('A session can have at most 3 members');
  });

  test('POST /api/schedule should reject trainer exceeding 8 hours per day', async () => {
    const token = createToken({ id: 5, role: 'TRAINER', email: 'trainer@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 2 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total_minutes: 480 }]]);

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 2,
        session_date: '2026-04-14',
        start_time: '14:00:00',
        end_time: '15:00:00',
        member_ids: []
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Trainer has reached 8h limit for this day');
  });

  test('POST /api/schedule should reject a member taking two sessions in the same period', async () => {
    const token = createToken({ id: 5, role: 'TRAINER', email: 'trainer@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 2 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total_minutes: 60 }]])
      .mockResolvedValueOnce([[{ id: 4, trainer_id: 2 }]])
      .mockResolvedValueOnce([[{ member_id: 4, start_time: '06:00:00', end_time: '07:00:00' }]]);

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 2,
        session_date: '2026-04-14',
        start_time: '09:00:00',
        end_time: '10:00:00',
        member_ids: [4]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Member can only join one session in each period (morning, afternoon, evening)');
  });

  test('POST /api/schedule should create a valid session', async () => {
    const token = createToken({ id: 5, role: 'TRAINER', email: 'trainer@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 2 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total_minutes: 120 }]])
      .mockResolvedValueOnce([[{ id: 4, trainer_id: 2 }, { id: 5, trainer_id: 2 }]])
      .mockResolvedValueOnce([
        [
          { member_id: 4, start_time: '05:30:00', end_time: '06:30:00' },
          { member_id: 5, start_time: '05:30:00', end_time: '06:30:00' },
          { member_id: 5, start_time: '17:00:00', end_time: '18:00:00' }
        ]
      ])
      .mockResolvedValueOnce([{ insertId: 88 }])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/api/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trainer_id: 2,
        session_date: '2026-04-14',
        start_time: '14:00:00',
        end_time: '15:00:00',
        member_ids: [4, 5]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Session created');
    expect(res.body.sessionId).toBe(88);
  });
});
