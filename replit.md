# Skify - AI Video Transformation Platform

## Overview
Skify is a next-generation AI-powered video transformation SaaS platform that analyzes viral short-form videos (Reels, TikToks, YouTube Shorts) and extracts style components including effects, templates, transitions, color grading, camera movements, and AI edits. Users can apply these extracted styles to their own videos with one-click automation for broadcast-quality output.

## Project Architecture
- **Frontend**: React with Vite, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM 
- **Storage**: DatabaseStorage (using PostgreSQL instead of in-memory)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state

## Recent Changes
- **2025-08-05**: Completed comprehensive backend infrastructure and AI integration
  - Enhanced database schema with subscriptions, analytics, processing jobs, and template likes
  - Implemented full API endpoints for video upload, AI analysis, template management, and payments
  - Created AI services module with RunwayML, OpenAI Vision, and Google Gemini integration points
  - Added real Razorpay payment processing for watermark removal (₹49) and Pro plans (₹199/month)
  - Built comprehensive gallery page with filtering, search, and favorite functionality
  - Implemented video processing pipeline with job tracking and progress monitoring
  - Added template analytics, trending algorithms, and user engagement metrics
  - Created production-ready authentication and authorization middleware
  - **NEW: Audio Matching & Synchronization Engine** - Extract audio from viral videos and perfectly sync with user content
  - **NEW: AI Audio Analysis** - Tempo, key, energy, danceability, vocal detection, and beat synchronization
  - **NEW: Audio Timeline Segmentation** - Intelligent audio breakdowns with intensity mapping and beat sync points
  - **NEW: FFmpeg Integration Ready** - Audio extraction, synchronization, and overlay capabilities for production
  - **FIXED: User Upload & Apply Template Feature** - Complete workflow from analysis → upload user video → apply template
  - All APIs include proper error handling, validation, and security measures
  - Platform ready for deployment with real AI services and payment integration

## Database Schema
- **users**: User accounts with authentication (id, username, email, password, createdAt)
- **videos**: Video processing records (id, userId, title, originalUrl, styledUrl, audioUrl, templateId, status, duration, audioMatched, createdAt)
- **templates**: Style templates for transformations (id, userId, name, description, colorPalette, effects, transitions, colorGrading, cameraMotion, audioUrl, audioDuration, audioFeatures, thumbnail, usageCount, rating, isPublic, createdAt)
- **analysis_results**: AI analysis results (id, videoId, effects, templates, transitions, colorGrading, cameraMotion, aiEdits, audioAnalysis, audioTimestamps, confidence, processingTime, createdAt)
- **payments**: Payment transactions (id, userId, videoId, amount, currency, status, razorpayPaymentId, razorpayOrderId, type, createdAt)
- **subscriptions**: User subscription management (id, userId, plan, status, startDate, endDate, paymentId, createdAt)
- **template_likes**: User template favorites (id, userId, templateId, createdAt)
- **video_processing_jobs**: Background job tracking (id, videoId, jobType, status, progress, errorMessage, startTime, endTime, metadata, createdAt)
- **template_analytics**: Template engagement metrics (id, templateId, views, likes, applications, averageRating, trendingScore, lastUpdated)

## API Endpoints
### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

### Video Management
- POST `/api/videos/upload` - Upload video for AI analysis (requires auth, supports MP4/MOV/AVI/WebM, max 500MB)
- GET `/api/videos/:id/analysis` - Get AI analysis results for video
- GET `/api/videos/user/:userId` - Get user's videos
- POST `/api/videos/:id/apply-template` - Apply template to video (with optional audio matching)
- POST `/api/videos/:id/extract-audio` - Extract audio from video using AI
- POST `/api/videos/:id/sync-audio` - Synchronize audio from source video to target video

### Template Management
- POST `/api/templates/create` - Create new template (requires auth)
- GET `/api/templates/public` - Get all public templates with analytics
- GET `/api/templates/trending` - Get trending templates
- GET `/api/templates/:id` - Get template details (increments view count)
- POST `/api/templates/:id/like` - Like/unlike template (requires auth)

### Payment Processing
- POST `/api/payments/create` - Create payment order for watermark removal (₹49) or Pro subscription (₹199/month)
- POST `/api/payments/:id/verify` - Verify Razorpay payment

### Job Tracking
- GET `/api/jobs/:id/status` - Get processing job status and progress

### Analytics
- GET `/api/analytics/dashboard` - User dashboard with video stats and subscription info

## User Preferences
- **Owner**: M. Suresh Kumar (kumarsuresh84678@gmail.com, 7373643481, Ariyalur, Tamil Nadu, India)
- **Contact**: support@skifymagicai.gmail.com
- **Focus**: Production-grade SaaS platform with real AI integration and monetization

## Development Notes
- Using Drizzle ORM for database operations
- Following fullstack_js blueprint guidelines  
- Database migrations handled via `npm run db:push`
- AI integration ready for RunwayML, OpenAI Vision, Google Gemini APIs
- Razorpay payment processing configured for Indian market
- File upload support with multer (500MB video limit)
- Background job processing for video analysis and style application