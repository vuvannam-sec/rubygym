process.env.JWT_SECRET = 'test-secret';

jest.mock('../src/config/database', () => ({
  execute: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');
const app = require('../src/index');

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

describe('Trainer Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/trainers should return 401 without token', async () => {
    const res = await request(app).get('/api/trainers');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  test('POST /api/trainers should create trainer for admin', async () => {
    const token = createToken({ id: 1, role: 'ADMIN', email: 'admin@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([{ insertId: 20 }])
      .mockResolvedValueOnce([{ insertId: 6 }]);

    const res = await request(app)
      .post('/api/trainers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'trainer.new@rubygym.com',
        password: 'trainer123',
        full_name: 'Trainer New',
        phone: '0901234567',
        specialization: 'Pilates'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Trainer created');
    expect(res.body.trainerId).toBe(6);
  });

  test('PUT /api/trainers/:id should allow trainer to update own profile', async () => {
    const token = createToken({ id: 7, role: 'TRAINER', email: 'trainer@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ id: 3 }]])
      .mockResolvedValueOnce([[
        {
          id: 3,
          user_id: 7,
          specialization: 'Yoga',
          max_daily_hours: 8,
          full_name: 'Tran Trainer',
          email: 'trainer@rubygym.com',
          phone: '0901111111'
        }
      ]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .put('/api/trainers/3')
      .set('Authorization', `Bearer ${token}`)
      .send({
        full_name: 'Tran Trainer Updated',
        phone: '0902222222',
        specialization: 'Yoga Therapy'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Trainer updated');
  });

  test('PUT /api/trainers/:id should reject trainer updating another trainer', async () => {
    const token = createToken({ id: 7, role: 'TRAINER', email: 'trainer@rubygym.com' });
    pool.execute.mockResolvedValueOnce([[{ id: 3 }]]);

    const res = await request(app)
      .put('/api/trainers/9')
      .set('Authorization', `Bearer ${token}`)
      .send({ full_name: 'Should Fail' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Access denied');
  });

  test('DELETE /api/trainers/:id should delete trainer for admin', async () => {
    const token = createToken({ id: 1, role: 'ADMIN', email: 'admin@rubygym.com' });

    pool.execute
      .mockResolvedValueOnce([[{ user_id: 15 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .delete('/api/trainers/4')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Trainer deleted');
  });
});
