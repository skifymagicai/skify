// Test setup for SkifyMagicAI
import { beforeAll, afterAll, beforeEach } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/skify_test';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.S3_ACCESS_KEY_ID = 'test-key';
process.env.S3_SECRET_ACCESS_KEY = 'test-secret';
process.env.RAZORPAY_KEY_ID = 'rzp_test_mock';
process.env.RAZORPAY_KEY_SECRET = 'mock_secret';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up SkifyMagicAI test environment');
});

afterAll(async () => {
  console.log('🧹 Cleaning up SkifyMagicAI test environment');
});

beforeEach(() => {
  // Clear mocks before each test
  jest.clearAllMocks();
});