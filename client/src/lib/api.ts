// SkifyMagicAI - Frontend API Client
import { ApiResponse, User, VideoUpload, Template, RenderJob, Payment } from '../../../shared/types.js';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

class APIClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('skify_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('skify_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('skify_token');
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: { username: string; email: string; password: string }) {
    return this.request<{ user: User; token: string; expiresIn: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ user: User; token: string; expiresIn: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  async getQuota() {
    return this.request<{
      used: number;
      limit: number;
      remaining: number;
      resetAt: string;
      tier: string;
    }>('/auth/quota');
  }

  async logout() {
    const result = await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
    return result;
  }

  // Upload endpoints
  async getUploadSignedUrl(filename: string, contentType: string, size: number) {
    return this.request<{
      uploadId: string;
      signedUrl: string;
      expiresAt: string;
    }>('/upload/sign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType, size }),
    });
  }

  async completeUpload(uploadId: string) {
    return this.request<{
      uploadId: string;
      status: string;
      jobId: string;
    }>('/upload/complete', {
      method: 'POST',
      body: JSON.stringify({ uploadId }),
    });
  }

  async getUploadStatus(uploadId: string) {
    return this.request<VideoUpload>(`/upload/${uploadId}/status`);
  }

  async getUploads(page = 1, limit = 10) {
    return this.request<{
      uploads: VideoUpload[];
      pagination: { page: number; limit: number; total: number };
    }>(`/upload?page=${page}&limit=${limit}`);
  }

  async deleteUpload(uploadId: string) {
    return this.request(`/upload/${uploadId}`, { method: 'DELETE' });
  }

  // Template endpoints
  async getTemplates(page = 1, limit = 12) {
    return this.request<{
      templates: Template[];
      pagination: { page: number; limit: number; total: number };
    }>(`/templates?page=${page}&limit=${limit}`);
  }

  async getMyTemplates() {
    return this.request<{ templates: Template[] }>('/templates/my');
  }

  async getTemplate(templateId: string) {
    return this.request<Template & { isLiked: boolean }>(`/templates/${templateId}`);
  }

  async createTemplate(data: {
    videoId: string;
    name: string;
    description?: string;
    tags: string[];
    isPublic: boolean;
  }) {
    return this.request<{ template: Template }>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async applyTemplate(
    templateId: string,
    sourceMediaIds: string[],
    renderSettings: {
      resolution: '720p' | '1080p' | '4K';
      quality: 'draft' | 'standard' | 'high' | 'ultra';
      watermark: boolean;
      format: 'mp4' | 'mov';
      applyLayers: {
        timing: boolean;
        visual: boolean;
        audio: boolean;
        text: boolean;
        background: boolean;
      };
    }
  ) {
    return this.request<{
      renderJobId: string;
      queueJobId: string;
      status: string;
      estimatedDuration: number;
    }>(`/templates/${templateId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ sourceMediaIds, renderSettings }),
    });
  }

  async likeTemplate(templateId: string) {
    return this.request<{ liked: boolean }>(`/templates/${templateId}/like`, {
      method: 'POST',
    });
  }

  async deleteTemplate(templateId: string) {
    return this.request(`/templates/${templateId}`, { method: 'DELETE' });
  }

  // Job endpoints
  async getJobStatus(jobId: string) {
    return this.request<{
      id: string;
      status: string;
      progress: number;
      resultUrl?: string;
      errorMessage?: string;
      estimatedTimeRemaining?: number;
      createdAt: string;
      startedAt?: string;
      completedAt?: string;
    }>(`/job/${jobId}`);
  }

  async getJobs(page = 1, limit = 10) {
    return this.request<{
      jobs: RenderJob[];
      pagination: { page: number; limit: number; total: number };
    }>(`/job?page=${page}&limit=${limit}`);
  }

  async cancelJob(jobId: string) {
    return this.request(`/job/${jobId}`, { method: 'DELETE' });
  }

  // Payment endpoints
  async createPaymentOrder(plan: 'pro_monthly' | 'pro_yearly') {
    return this.request<{
      orderId: string;
      amount: number;
      currency: string;
      plan: string;
      paymentId: string;
    }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }

  async verifyPayment(paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return this.request<{
      success: boolean;
      paymentId: string;
      user: User;
      plan: string;
    }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentHistory() {
    return this.request<{ payments: Payment[] }>('/payments/history');
  }

  async createWatermarkRemovalPayment(videoId: string) {
    return this.request<{
      orderId: string;
      amount: number;
      paymentId: string;
    }>('/payments/watermark-removal', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });
  }

  // Upload file to signed URL
  async uploadFile(signedUrl: string, file: File, onProgress?: (progress: number) => void) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }
}

export const apiClient = new APIClient();