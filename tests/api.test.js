const request = require('supertest');
const app = require('../server/app');

describe('Skify Core API', () => {
  let authToken;
  let testUser = {
    email: 'testuser@example.com',
    password: 'testpassword123'
  };

  beforeAll(async () => {
    // Create test user and get auth token
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    authToken = signupResponse.body.token;
  });

  describe('Authentication', () => {
    test('should signup new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(newUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(newUser.email);
    });

    test('should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Skify Core API');
      expect(response.body.status).toBe('operational');
    });
  });

  describe('Upload', () => {
    test('should generate signed upload URL', async () => {
      const response = await request(app)
        .post('/api/upload/sign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'test-video.mp4',
          contentType: 'video/mp4'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.uploadId).toBeDefined();
      expect(response.body.signedUrl).toBeDefined();
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/upload/sign')
        .send({
          filename: 'test-video.mp4',
          contentType: 'video/mp4'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Analysis', () => {
    test('should analyze video', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          videoUrl: 'https://example.com/video.mp4'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.analysis).toBeDefined();
      expect(response.body.analysis.style).toBeDefined();
      expect(response.body.analysis.confidence).toBeDefined();
    });
  });

  describe('Templates', () => {
    test('should get templates list', async () => {
      const response = await request(app).get('/api/templates');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.templates)).toBe(true);
    });

    test('should create template', async () => {
      const templateData = {
        name: 'Test Template',
        metadata: {
          effects: ['blur', 'glow'],
          transitions: ['fade', 'slide']
        }
      };

      const response = await request(app)
        .post('/api/template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.template.name).toBe(templateData.name);
      expect(response.body.template.id).toBeDefined();
    });

    test('should apply template', async () => {
      // First create a template
      const templateResponse = await request(app)
        .post('/api/template')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Apply Test Template',
          metadata: { effects: ['blur'] }
        });

      const templateId = templateResponse.body.template.id;

      const response = await request(app)
        .post('/api/template/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          templateId,
          videoUrl: 'https://example.com/video.mp4'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.jobId).toBeDefined();
    });
  });

  describe('Job Status', () => {
    test('should get job status', async () => {
      // Create a job first
      const templateResponse = await request(app)
        .post('/api/template')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Job Test Template',
          metadata: { effects: ['blur'] }
        });

      const applyResponse = await request(app)
        .post('/api/template/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          templateId: templateResponse.body.template.id,
          videoUrl: 'https://example.com/video.mp4'
        });

      const jobId = applyResponse.body.jobId;

      const response = await request(app).get(`/api/job/${jobId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.job).toBeDefined();
      expect(response.body.job.id).toBe(jobId);
    });

    test('should return 404 for non-existent job', async () => {
      const response = await request(app).get('/api/job/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Job not found');
    });
  });

  describe('Payment', () => {
    test('should create payment order', async () => {
      const response = await request(app)
        .post('/api/payment/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000,
          currency: 'INR'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.orderId).toBeDefined();
      expect(response.body.amount).toBe(1000);
    });
  });

  describe('Admin', () => {
    test('should get audit logs', async () => {
      const response = await request(app).get('/api/admin/audit');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.events)).toBe(true);
    });

    test('should get moderation stats', async () => {
      const response = await request(app).get('/api/admin/moderation');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
    });
  });
});