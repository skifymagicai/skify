// Frontend API client for modular backend endpoints
import { apiRequest } from "@/lib/queryClient";

export interface JobStatus {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  startTime?: string;
  endTime?: string;
}

export interface VideoData {
  id: string;
  userId: string;
  title: string;
  originalUrl: string;
  styledUrl?: string;
  status: string;
  duration?: number;
  createdAt: string;
}

export interface TemplateData {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isPublic: boolean;
}

export class SkifyApiClient {
  
  // ===== UPLOAD METHODS =====
  
  static async uploadViralVideo(file: File, title?: string): Promise<{
    success: boolean;
    video: VideoData;
    jobId: string;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('viralVideo', file);
    if (title) formData.append('title', title);
    
    return apiRequest('POST', '/api/upload/viral', formData);
  }

  static async uploadUserVideo(file: File, title?: string, templateId?: string): Promise<{
    success: boolean;
    video: VideoData;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('userVideo', file);
    if (title) formData.append('title', title);
    if (templateId) formData.append('templateId', templateId);
    
    return apiRequest('POST', '/api/upload/user', formData);
  }

  // ===== IMPORT METHOD =====
  
  static async importFromUrl(url: string, title?: string): Promise<{
    success: boolean;
    video: VideoData;
    jobId: string;
    message: string;
  }> {
    return apiRequest('POST', '/api/import', { url, title });
  }

  // ===== ANALYSIS METHOD =====
  
  static async analyzeVideo(videoId: string): Promise<{
    success: boolean;
    video: VideoData;
    jobId: string;
    message: string;
  }> {
    return apiRequest('POST', '/api/analyze', { videoId });
  }

  // ===== TEMPLATE METHODS =====
  
  static async saveTemplate(
    videoId: string, 
    templateName: string, 
    templateDescription?: string, 
    makePublic?: boolean
  ): Promise<{
    success: boolean;
    template: TemplateData;
    jobId: string;
    message: string;
  }> {
    return apiRequest('POST', '/api/template/save', {
      videoId,
      templateName,
      templateDescription,
      makePublic
    });
  }

  // ===== APPLICATION METHOD =====
  
  static async applyTemplate(
    userVideoId: string, 
    templateId: string, 
    options?: {
      applyVisual?: boolean;
      applyAudio?: boolean;
      applyText?: boolean;
    }
  ): Promise<{
    success: boolean;
    userVideo: VideoData;
    template: TemplateData;
    jobId: string;
    message: string;
  }> {
    return apiRequest('POST', '/api/apply', {
      userVideoId,
      templateId,
      options
    });
  }

  // ===== EXPORT METHOD =====
  
  static async exportVideo(
    videoId: string, 
    quality?: string, 
    watermark?: boolean
  ): Promise<{
    success: boolean;
    video: VideoData;
    jobId: string;
    message: string;
  }> {
    return apiRequest('POST', '/api/export', {
      videoId,
      quality: quality || 'HD',
      watermark: watermark !== false
    });
  }

  // ===== DOWNLOAD METHOD =====
  
  static async getDownloadUrl(videoId: string): Promise<{
    success: boolean;
    downloadUrl: string;
    fileSize: string;
    format: string;
    message: string;
  }> {
    return apiRequest('GET', `/api/download/${videoId}`);
  }

  // ===== STATUS POLLING =====
  
  static async getJobStatus(jobId: string): Promise<{
    success: boolean;
    job: JobStatus;
  }> {
    return apiRequest('GET', `/api/status/${jobId}`);
  }

  // ===== POLLING HELPER =====
  
  static async pollJobUntilComplete(
    jobId: string, 
    onProgress?: (job: JobStatus) => void,
    maxAttempts: number = 60
  ): Promise<JobStatus> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const response = await this.getJobStatus(jobId);
      
      if (!response.success) {
        throw new Error('Failed to get job status');
      }

      const job = response.job;
      
      if (onProgress) {
        onProgress(job);
      }

      if (job.status === 'completed') {
        return job;
      }
      
      if (job.status === 'failed') {
        throw new Error(job.message || 'Job failed');
      }

      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    throw new Error('Job polling timeout');
  }
}

export default SkifyApiClient;