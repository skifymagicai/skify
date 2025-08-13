import request from 'supertest';
import app from '../src/index';

describe('Health Check', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('ok');
  });
});
