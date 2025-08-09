// SkifyMagicAI - Shared Type Definitions

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  tier: 'free' | 'pro';
  subscriptionId?: string;
  uploadLimit: number;
  uploadsUsed: number;
  resetDate: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoUpload {
  id: string;
  userId: string;
  filename: string;
  originalUrl?: string;
  s3Key: string;
  s3Url: string;
  size: number;
  mimeType: string;
  duration?: number;
  width?: number;
  height?: number;
  frameRate?: number;
  bitrate?: number;
  status: 'uploading' | 'uploaded' | 'analyzing' | 'analyzed' | 'failed';
  metadata?: any;
  analysisResult?: StyleAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface StyleAnalysis {
  id: string;
  videoId: string;
  timing: TimingAnalysis;
  visual: VisualAnalysis;
  audio: AudioAnalysis;
  text: TextAnalysis;
  confidence: number;
  version: string;
  processingTime?: number;
  aiModel?: string;
  createdAt: Date;
}

export interface TimingAnalysis {
  totalDuration: number;
  cuts: Array<{
    timestamp: number;
    type: 'hard' | 'soft';
    confidence: number;
  }>;
  speedRamps: Array<{
    startTime: number;
    endTime: number;
    speedMultiplier: number;
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  }>;
  transitions: Array<{
    timestamp: number;
    type: 'fade' | 'wipe' | 'slide' | 'zoom';
    duration: number;
    direction?: string;
  }>;
}

export interface VisualAnalysis {
  colorGrading: {
    saturation: number;
    brightness: number;
    contrast: number;
    temperature: number;
    tint: number;
    lut?: string;
  };
  effects: Array<{
    type: string;
    startTime: number;
    endTime: number;
    intensity: number;
    parameters: Record<string, any>;
  }>;
  backgroundChanges: Array<{
    timestamp: number;
    type: 'blur' | 'replace' | 'mask';
    maskData?: string;
  }>;
  aspectRatio: string;
}

export interface AudioAnalysis {
  bpm: number;
  key: string;
  energy: number;
  beatMap: Array<{
    timestamp: number;
    strength: number;
    type: 'kick' | 'snare' | 'hihat' | 'vocal';
  }>;
  musicCues: Array<{
    timestamp: number;
    type: 'verse' | 'chorus' | 'bridge' | 'buildup' | 'drop';
    duration: number;
  }>;
}

export interface TextAnalysis {
  overlays: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    position: {
      x: number;
      y: number;
      anchor: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    };
    style: {
      fontFamily: string;
      fontSize: number;
      color: string;
      stroke?: string;
      strokeWidth?: number;
      weight: 'normal' | 'bold' | 'light';
    };
    animation?: {
      type: 'fade' | 'slide' | 'scale' | 'bounce';
      duration: number;
      easing: string;
    };
  }>;
  lyrics: Array<{
    text: string;
    startTime: number;
    endTime: number;
    position: {
      x: number;
      y: number;
      anchor: string;
    };
    style: {
      fontFamily: string;
      fontSize: number;
      color: string;
      weight: string;
    };
  }>;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  sourceVideoId: string;
  styleAnalysisId: string;
  tags: string[];
  isPublic: boolean;
  likes: number;
  uses: number;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RenderJob {
  id: string;
  userId: string;
  templateId: string;
  sourceMediaIds: string[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  errorMessage?: string;
  renderSettings: RenderSettings;
  priority: number;
  estimatedDuration?: number;
  actualDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface RenderSettings {
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

export interface Payment {
  id: string;
  userId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  plan: 'pro_monthly' | 'pro_yearly' | 'watermark_removal';
  metadata?: any;
  webhook?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ModerationItem {
  id: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}