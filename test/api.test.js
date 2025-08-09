import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server/app.js';

let server;

beforeAll(async () => {
  server = app.listen(0); // Use random port for testing
});

afterAll(async () => {
  if (server) {
    server.close();
  }
});

describe('Skify API Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Skify API');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('Upload Endpoint', () => {
    it('should handle missing file upload', async () => {
      const response = await request(app)
        .post('/api/upload')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No file uploaded');
    });
  });

  describe('Analyze Endpoint', () => {
    it('should analyze viral video from URL', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          videoUrl: 'https://example.com/video.mp4'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.analysis).toBeDefined();
      expect(response.body.data.analysis.timing).toBeDefined();
      expect(response.body.data.analysis.visual).toBeDefined();
      expect(response.body.data.analysis.audio).toBeDefined();
    });

    it('should handle missing video input', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Video URL or link required');
    });
  });

  describe('Templates Endpoint', () => {
    it('should return templates list', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.templates).toBeDefined();
      expect(Array.isArray(response.body.data.templates)).toBe(true);
      expect(response.body.data.templates.length).toBeGreaterThan(0);
    });

    it('should apply template', async () => {
      const response = await request(app)
        .post('/api/templates/apply')
        .send({
          templateId: '1',
          userMedia: ['test-file.mp4']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobId).toBeDefined();
      expect(response.body.data.status).toBe('processing');
    });

    it('should handle missing template data', async () => {
      const response = await request(app)
        .post('/api/templates/apply')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Template ID and user media required');
    });
  });

  describe('Job Status Endpoint', () => {
    it('should handle job not found', async () => {
      const response = await request(app)
        .get('/api/job/nonexistent-job')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Job not found');
    });
  });

  describe('Static File Serving', () => {
    it('should serve index.html for non-API routes', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    it('should return 404 for unknown API routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('API endpoint not found');
    });
  });
});