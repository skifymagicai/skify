import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import uploadRoutes from '../server/routes/upload.js';
import { AuthService } from '../server/services/auth.js';

describe('Upload API', () => {
  let app: express.Application;
  let token: string;
  let userId: string;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/upload', uploadRoutes);

    // Create test user and get token
    const user = await AuthService.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user.id;
    token = AuthService.generateToken(user.id);
  });

  describe('POST /api/upload/sign', () => {
    it('should generate signed URL for valid file', async () => {
      const fileData = {
        filename: 'test-video.mp4',
        contentType: 'video/mp4',
        size: 10485760 // 10MB
      };

      const response = await request(app)
        .post('/api/upload/sign')
        .set('Authorization', `Bearer ${token}`)
        .send(fileData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('uploadId');
      expect(response.body.data).toHaveProperty('signedUrl');
      expect(response.body.data).toHaveProperty('expiresAt');
    });

    it('should reject oversized files', async () => {
      const fileData = {
        filename: 'huge-video.mp4',
        contentType: 'video/mp4',
        size: 600 * 1024 * 1024 // 600MB (over limit)
      };

      const response = await request(app)
        .post('/api/upload/sign')
        .set('Authorization', `Bearer ${token}`)
        .send(fileData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('size');
    });

    it('should reject invalid file types', async () => {
      const fileData = {
        filename: 'document.pdf',
        contentType: 'application/pdf',
        size: 1048576 // 1MB
      };

      const response = await request(app)
        .post('/api/upload/sign')
        .set('Authorization', `Bearer ${token}`)
        .send(fileData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject requests without authentication', async () => {
      const fileData = {
        filename: 'test-video.mp4',
        contentType: 'video/mp4',
        size: 10485760
      };

      const response = await request(app)
        .post('/api/upload/sign')
        .send(fileData)
        .expect(401);

      expect(response.body.error).toContain('Access token required');
    });
  });

  describe('POST /api/upload/complete', () => {
    let uploadId: string;

    beforeEach(async () => {
      // Create a signed URL first
      const fileData = {
        filename: 'test-video.mp4',
        contentType: 'video/mp4',
        size: 10485760
      };

      const signResponse = await request(app)
        .post('/api/upload/sign')
        .set('Authorization', `Bearer ${token}`)
        .send(fileData);

      uploadId = signResponse.body.data.uploadId;
    });

    it('should complete upload and trigger analysis', async () => {
      const response = await request(app)
        .post('/api/upload/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ uploadId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.uploadId).toBe(uploadId);
      expect(response.body.data.status).toBe('analyzing');
      expect(response.body.data).toHaveProperty('jobId');
    });

    it('should reject invalid upload ID', async () => {
      const response = await request(app)
        .post('/api/upload/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ uploadId: 'invalid-id' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/upload/:uploadId/status', () => {
    let uploadId: string;

    beforeEach(async () => {
      const fileData = {
        filename: 'test-video.mp4',
        contentType: 'video/mp4',
        size: 10485760
      };

      const signResponse = await request(app)
        .post('/api/upload/sign')
        .set('Authorization', `Bearer ${token}`)
        .send(fileData);

      uploadId = signResponse.body.data.uploadId;
    });

    it('should return upload status', async () => {
      const response = await request(app)
        .get(`/api/upload/${uploadId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(uploadId);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('filename');
    });

    it('should reject access to other users uploads', async () => {
      // Create another user
      const otherUser = await AuthService.createUser({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });
      const otherToken = AuthService.generateToken(otherUser.id);

      const response = await request(app)
        .get(`/api/upload/${uploadId}/status`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Upload not found');
    });
  });
});