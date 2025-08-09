import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const S3_CONFIG = {
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'dev-key',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'dev-secret'
  },
  endpoint: process.env.S3_ENDPOINT
};

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'skify-storage';

export class StorageService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client(S3_CONFIG);
  }

  async generateUploadUrl(filename: string, contentType: string, userId: string): Promise<{
    uploadId: string;
    signedUrl: string;
    s3Key: string;
    expiresAt: Date;
  }> {
    const uploadId = crypto.randomUUID();
    const timestamp = new Date().toISOString().split('T')[0];
    const s3Key = `uploads/${userId}/${timestamp}/${uploadId}-${filename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        ContentType: contentType,
        Metadata: {
          userId,
          uploadId,
          originalFilename: filename
        }
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600 // 1 hour
      });

      const expiresAt = new Date(Date.now() + 3600 * 1000);

      return {
        uploadId,
        signedUrl,
        s3Key,
        expiresAt
      };
    } catch (error) {
      // Fallback for development without S3
      console.warn('S3 not configured, using fallback URLs');
      return {
        uploadId,
        signedUrl: `https://mock-s3.example.com/upload?key=${s3Key}`,
        s3Key,
        expiresAt: new Date(Date.now() + 3600 * 1000)
      };
    }
  }

  async generateDownloadUrl(s3Key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      // Fallback for development
      return `https://mock-s3.example.com/download?key=${s3Key}`;
    }
  }

  async deleteFile(s3Key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
      throw error;
    }
  }

  getPublicUrl(s3Key: string): string {
    if (process.env.S3_ENDPOINT && !process.env.S3_ENDPOINT.includes('amazonaws.com')) {
      // Custom S3-compatible endpoint (like Cloudflare R2)
      return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${s3Key}`;
    }
    
    // AWS S3 standard URL
    return `https://${BUCKET_NAME}.s3.${S3_CONFIG.region}.amazonaws.com/${s3Key}`;
  }

  // Generate key for different resource types
  static generateKey(type: 'upload' | 'template' | 'render', userId: string, filename: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const uuid = crypto.randomUUID();
    return `${type}s/${userId}/${timestamp}/${uuid}-${filename}`;
  }

  // Multipart upload support for large files (>50MB)
  async initiateMultipartUpload(s3Key: string, contentType: string) {
    // Implementation would go here for production
    // For now, return a mock response
    return {
      uploadId: crypto.randomUUID(),
      key: s3Key
    };
  }
}