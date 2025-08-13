// Shared types and utilities for Skify

export interface User {
  id: string;
  username: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
  uploadsUsed: number;
  uploadLimit: number;
}

export interface Template {
  templateId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  modelVersion: Record<string, string>;
  sourceVideo: {
    url: string;
    title: string;
    duration: number;
    resolution: string;
    aspectRatio: string;
  };
  styleMetadata: Record<string, any>;
  analysisConfidence: Record<string, number>;
  flags: Record<string, any>;
}

// ...more types as needed
