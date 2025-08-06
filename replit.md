# Skify - AI Video Transformation Platform

## Overview
Skify is a next-generation AI-powered video transformation SaaS platform. It analyzes viral short-form videos (Reels, TikToks, YouTube Shorts) to extract style components including effects, templates, transitions, color grading, camera movements, and AI edits. Users can then apply these extracted styles to their own videos with one-click automation to achieve broadcast-quality output. The platform aims to be a production-grade SaaS solution with real AI integration and monetization capabilities.

## Recent Changes (August 2025)
- **COMPLETE REBUILD WITH REAL AI**: Implemented production-ready Skify AI platform with authentic AI service integrations
- **AI SERVICES INTEGRATED**: Replicate AI, AssemblyAI, Google Vision OCR, Cloudinary, and FFmpeg all working with real API keys
- **KARAOKE LYRICS SYSTEM**: Advanced video player with synchronized lyrics display and timestamp synchronization
- **PRODUCTION DASHBOARD**: React frontend with upload, analysis, results, and template management tabs
- **FIXED VIDEO NOT FOUND ERROR**: Resolved video analysis pipeline with proper URL tracking and database integration
- **DATABASE CONSTRAINTS FIXED**: Created demo user system to resolve foreign key constraint errors
- **API ROUTES ENHANCED**: Added comprehensive debugging and proper user authentication for all video operations
- **INVESTOR DEMO READY**: Full MVP implementation ready for investor demonstrations and beta launch

## User Preferences
- **Owner**: M. Suresh Kumar (kumarsuresh84678@gmail.com, 7373643481, Ariyalur, Tamil Nadu, India)
- **Contact**: support@skifymagicai.gmail.com
- **Focus**: Production-grade SaaS platform with real AI integration and monetization

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