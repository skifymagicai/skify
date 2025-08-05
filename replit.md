# Skify - AI Video Transformation Platform

## Overview
An AI-powered video transformation platform that analyzes viral videos and applies their styles to user content with one-click automation.

## Project Architecture
- **Frontend**: React with Vite, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM 
- **Storage**: DatabaseStorage (using PostgreSQL instead of in-memory)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state

## Recent Changes
- **2025-01-05**: Successfully added PostgreSQL database integration
  - Created database using Neon PostgreSQL  
  - Updated storage implementation to use DatabaseStorage (replaced MemStorage)
  - Pushed schema to database with `npm run db:push`
  - Schema includes: users, videos, templates, analysis_results, payments
  - Database connection tested and verified working
  - All CRUD operations ready for user authentication and video processing

## Database Schema
- **users**: User accounts with authentication
- **videos**: Video processing records
- **templates**: Style templates for transformations
- **analysis_results**: AI analysis results
- **payments**: Payment transactions

## User Preferences
(To be updated based on user feedback)

## Development Notes
- Using Drizzle ORM for database operations
- Following fullstack_js blueprint guidelines
- Database migrations handled via `npm run db:push`