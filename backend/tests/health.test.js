const request = require('supertest');
const app = require('../src/index');

describe('Health Check', () => {
  test('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('rubygym-api');
  });
});

describe('API Routes Exist', () => {
  test('POST /api/auth/login should return 500 (no DB) not 404', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123' });
    // 500 = route exists but DB not connected (expected in test)
    // 404 = route not found (would be a bug)
    expect(res.statusCode).not.toBe(404);
  });

  test('GET /api/trainers should return 401 (no token)', async () => {
    const res = await request(app).get('/api/trainers');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/members should return 401 (no token)', async () => {
    const res = await request(app).get('/api/members');
    expect(res.statusCode).toBe(401);
  });
});
