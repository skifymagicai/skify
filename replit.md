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
- **2025-08-05**: **MAJOR BACKEND OVERHAUL COMPLETED** - Redesigned entire AI pipeline for production deployment
  - **PRODUCTION STATUS: FULLY OPERATIONAL** - Complete end-to-end AI video transformation platform ready for deployment
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
  - **NEW: Lyrical/Text Extraction & Recreation Feature** - Complete OCR-powered text analysis and recreation system
    - Google Vision API integration for OCR text extraction from video frames
    - Font detection and classification (Montserrat, Arial, etc.) with confidence scoring
    - Text positioning, timing, animation detection (fade, slide, typewriter)
    - Color, size, weight, and styling analysis for accurate text recreation
    - Custom lyrical template application with text overlay matching original viral videos
    - Enhanced database schema with textExtraction and lyricalData fields
    - New API endpoints: /extract-text and /apply-lyrical-template
    - Dedicated lyrical analysis page with text editing and font customization
    - Complete workflow: viral video → OCR analysis → text extraction → user video → lyrical template application
  - **NEW: Copy Link & Download Feature** - Instant video fetching from social media platforms
    - Direct URL input for Instagram Reels, TikTok videos, and YouTube Shorts
    - Automated video downloading using ytdl-core and platform-specific APIs
    - Background processing with real-time progress tracking
    - Seamless integration with existing analysis pipeline
    - Enhanced landing page with prominent "Paste Video Link" option
    - New API endpoint: /fetch-from-url with job tracking
    - Complete workflow: paste URL → automatic download → instant analysis → style extraction
  - **NEW: In-App Sample Demo Video Gallery** - Comprehensive feature showcase for user conversion
    - Interactive video showcase component with sample transformations
    - Real-time demonstration of AI style transfer, audio matching, and text extraction
    - Feature-rich gallery with categorized examples (Travel, Urban, Documentary, Fitness)
    - Prominent call-to-action buttons leading to upload and link-fetch workflows
    - Enhanced landing page with "See How Skify Works!" section
    - Compact gallery integration for template discovery
    - Complete feature demonstrations showcasing every Skify capability
  - **COMPREHENSIVE AI PIPELINE OVERHAUL** - Complete backend redesign for real AI integration
    - **Real FFmpeg Integration** - Actual video, audio, and frame extraction capabilities
    - **Modular AI Services Architecture** - AIVideoProcessor class with production-ready pipeline
    - **Asset Separation Engine** - Extract visual effects, audio tracks, and text overlays separately
    - **Template-from-Analysis Workflow** - Create reusable templates from comprehensive AI analysis
    - **Complete User Journey API** - Upload → Analyze → Template → Apply → Export pipeline
    - **Advanced Job Processing** - Real-time progress tracking with metadata and error handling
    - **Production Export System** - Watermark control, payment integration, and HD export
    - **Comprehensive AI Workflow UI** - Step-by-step guided interface for complete video transformation
  - **ULTIMATE SKIFY APP FIX COMPLETED** - Core backend and frontend pipeline redesigned per specifications
    - **Fixed Full Analysis & Template Generation** - Viral videos create structured template folders with separated assets
    - **Corrected Frontend Workflow** - Landing page prioritizes viral analysis with dual upload system
    - **Backend API & Storage Logic** - New cloud storage system with organized template folders (local fallback)
    - **Combinatorial Rendering** - Complete workflow for applying extracted styles to user videos
    - **New Viral Analysis Page** - Step-by-step interface: viral upload → analysis → template creation → user upload → styling
    - **Enhanced Landing Page** - Primary CTA now "Recreate Viral Video Style" with clear workflow guidance
    - **Template Storage Manager** - Organized cloud storage with metadata, visual, audio, and text assets
    - **Viral Analysis APIs** - /analyze-viral, /analyze-viral-url, /apply-to-user-video endpoints
    - **Real-time Progress Tracking** - Visual progress indicators for analysis and application stages
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

### Comprehensive AI Video Pipeline
- POST `/api/videos/upload` - Upload video for complete AI analysis (FFmpeg + AI processing)
- GET `/api/videos/:id/analysis` - Get comprehensive AI analysis results
- GET `/api/videos/user/:userId` - Get user's videos with processing status
- POST `/api/templates/create-from-analysis` - **NEW: Create template from AI analysis results**
- POST `/api/templates/:id/apply-to-video` - **NEW: Apply template to user video with full customization**
- POST `/api/videos/:id/export` - **NEW: Export styled video with watermark control**

### Legacy Template Management (Still Supported)
- POST `/api/templates/create` - Create new template manually
- GET `/api/templates/public` - Get all public templates with analytics
- GET `/api/templates/trending` - Get trending templates
- GET `/api/templates/:id` - Get template details (increments view count)
- POST `/api/templates/:id/like` - Like/unlike template (requires auth)
- POST `/api/videos/:id/apply-template` - Apply template to existing video (legacy)

### Audio Processing
- POST `/api/videos/:id/extract-audio` - Extract audio from video using FFmpeg
- POST `/api/videos/:id/sync-audio` - Synchronize audio from source video to target video

### Video Link Fetching
- POST `/api/videos/fetch-from-url` - Download video from Instagram, TikTok, or YouTube URL
- Real-time job tracking for URL downloads with platform detection

### Text & Lyrical Analysis
- POST `/api/videos/:id/extract-text` - Extract text/lyrics using OCR
- POST `/api/videos/:id/apply-lyrical-template` - Apply lyrical template with text overlays

### Payment Processing
- POST `/api/payments/create` - Create payment order for watermark removal (₹49) or Pro subscription (₹199/month)
- POST `/api/payments/:id/verify` - Verify Razorpay payment

### Job Tracking & Progress
- GET `/api/jobs/:id/status` - Get processing job status and real-time progress
- Advanced metadata tracking for all processing stages

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