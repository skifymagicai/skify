# Skify - AI Video Transformation Platform

## Overview
Skify is a next-generation AI-powered video transformation SaaS platform. It analyzes viral short-form videos (Reels, TikToks, YouTube Shorts) to extract style components including effects, templates, transitions, color grading, camera movements, and AI edits. Users can then apply these extracted styles to their own videos with one-click automation to achieve broadcast-quality output. The platform aims to be a production-grade SaaS solution with real AI integration and monetization capabilities.

## Recent Changes (August 2025)
- **VIDEO ANALYSIS FEATURE COMPLETE** (Aug 10, 2025): Fixed and fully implemented video analysis for file uploads and URLs
  - **CRITICAL FIX**: Resolved MP4 file validation issue - files with `application/octet-stream` MIME type now accepted
  - **Analysis Endpoint**: `/api/analyze` endpoint fully functional for both video URLs and file uploads
  - **File Upload**: Successfully processes large MP4 files (tested with 50.9MB video)
  - **URL Analysis**: Supports TikTok, YouTube, Instagram with proper validation and AI style extraction
  - **AI Analysis**: Comprehensive style analysis including effects, transitions, color grading, audio analysis
  - **Security**: File cleanup, error handling, and temporary storage management
  - **Frontend**: Enhanced UI with detailed analysis results, confidence scores, and audio metrics
- **CRITICAL BUG FIX COMPLETED** (Aug 9, 2025): Fixed production authentication error `column "tier" does not exist`
  - **Database Migration**: Applied full schema migration with proper UUID primary keys
  - **User Tiers**: Implemented complete user tier system (free/pro) with upload limits and billing integration
  - **Authentication**: Fixed password hashing and JWT token generation, demo user login working
  - **Database Schema**: Created all required tables (users, video_uploads, templates, render_jobs, payments, audit_logs)
  - **API Endpoints**: All core endpoints functional (/api/auth, /api/templates, /api/jobs, /api/payments)
- **SKIFY CORE IMPLEMENTATION COMPLETE**: Full production-ready application deployed with comprehensive feature set
- **COMPLETE ARCHITECTURE REBUILD**: Express.js backend + React PWA frontend with modern stack
- **BULLMQ QUEUE SYSTEM**: Async job processing with Redis integration and in-memory fallback
- **PWA WITH OFFLINE SUPPORT**: Progressive Web App with service worker, manifest, installable
- **AUTHENTICATION SYSTEM**: JWT-based auth with demo account and user tiers (Free/Pro)
- **COMPREHENSIVE API SUITE**: 
  - `/api/auth/*` - JWT authentication with signup/login ✅ WORKING
  - `/api/upload/*` - File upload with signed URLs
  - `/api/analyze` - AI video analysis with deterministic fallback
  - `/api/templates` - Template CRUD operations and library ✅ WORKING
  - `/api/template/apply` - Async template application with progress tracking
  - `/api/jobs/:id` - Real-time job status monitoring ✅ WORKING
  - `/api/payment/*` - Razorpay order creation and verification
  - `/api/admin/*` - Audit logs and moderation stats
- **MODERN REACT FRONTEND**: Wouter routing, TanStack Query, Lucide icons, mobile-first design
- **TESTING INFRASTRUCTURE**: Jest API tests + Playwright E2E smoke tests
- **DOCKER & DEPLOYMENT**: Production Dockerfile, comprehensive README, environment management
- **COMPLETE DOCUMENTATION**: Full README with deployment guide, API documentation, configuration

## User Preferences
- **Owner**: M. Suresh Kumar (kumarsuresh84678@gmail.com, 7373643481, Ariyalur, Tamil Nadu, India)
- **Contact**: support@skifymagicai.gmail.com
- **Focus**: Production-grade SaaS platform with real AI integration and monetization
- **Collaboration**: Full development control granted to AI assistant (@openai-dev-helper)
- **AI Developer Status**: Confirmed full-time assistant developer with complete project takeover
- **Tracking Preference**: Visible activity logs and progress summaries required
- **Communication**: Real-time updates on development progress and system status
- **Authorization**: Owner confirms no blocks or restrictions on AI development collaboration

## System Architecture
Skify is a full-stack application designed for robust AI video transformation.
- **Frontend**: Built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui for a modern and responsive user interface. Wouter is used for client-side routing, and TanStack Query manages server state.
- **Backend**: Developed using Express.js with TypeScript, providing a scalable and efficient API layer.
- **Database**: PostgreSQL is used as the primary data store, managed with Drizzle ORM for type-safe database interactions.
- **Core Functionality**:
    - **Comprehensive AI Pipeline**: Redesigned for production, enabling end-to-end video analysis and transformation. This includes asset separation (visual effects, audio tracks, text overlays) and template generation from AI analysis.
    - **Audio Processing**: Features an audio matching and synchronization engine, AI audio analysis (tempo, key, energy, vocal detection, beat synchronization), and audio timeline segmentation.
    - **Text & Lyrical Analysis**: Incorporates OCR-powered text extraction (Google Vision API) from video frames, font detection, positioning, timing, animation analysis, and recreation of lyrical templates.
    - **Video Link Fetching**: Allows instant video fetching from social media platforms (Instagram, TikTok, YouTube) via URL input, integrating seamlessly with the analysis pipeline.
    - **Job Processing**: Advanced background job processing for video analysis, style application, and export, with real-time progress tracking.
    - **Production Export System**: Manages watermark control, payment integration, and HD video export.
    - **User Workflow**: A guided step-by-step interface for the entire video transformation process, from viral video import to style application and export.
    - **Database Schema**: Includes tables for users, videos, templates, AI analysis results, payments, subscriptions, template likes, video processing jobs, and template analytics.

## External Dependencies
- **AI Services**: Integrations with RunwayML, OpenAI Vision, and Google Gemini APIs for AI analysis and transformation.
- **Payment Gateway**: Razorpay for payment processing, supporting watermark removal and Pro plan subscriptions.
- **Video Download**: `ytdl-core` for downloading videos from social media URLs.
- **Video Processing**: FFmpeg for video, audio, and frame extraction, synchronization, and overlay capabilities.