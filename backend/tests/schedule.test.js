const request = require('supertest');
const app = require('../src/index');

// Mock database
jest.mock('../src/config/database', () => ({
  execute: jest.fn(),
  query: jest.fn()
}));

// Mock auth middleware
jest.mock('../src/middlewares/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  authorize: (...roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  }
}));

describe('Schedule Routes', () => {
  test('GET /api/schedule should return route exists', async () => {
    const res = await request(app).get('/api/schedule');
    expect(res.statusCode).not.toBe(404);
  });

  test('POST /api/schedule should return route exists', async () => {
    const res = await request(app)
      .post('/api/schedule')
      .send({
        trainer_id: 1,
        session_date: '2026-04-25',
        start_time: '08:00',
        end_time: '09:30',
        member_ids: [1, 2]
      });
    // Route exists and processes request (may fail on DB but not 404)
    expect(res.statusCode).not.toBe(404);
  });
});
