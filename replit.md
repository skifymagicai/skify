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
- **2025-08-05**: Successfully completed PostgreSQL database integration and UI fixes
  - Created database using Neon PostgreSQL  
  - Updated storage implementation to use DatabaseStorage (replaced MemStorage)
  - Pushed schema to database with `npm run db:push`
  - Schema includes: users, videos, templates, analysis_results, payments
  - Database connection tested and verified working
  - All CRUD operations ready for user authentication and video processing
- **2025-08-05**: Complete UI transformation to light theme with modern design
  - Redesigned entire application from dark theme to clean, modern light theme
  - Created new header navigation with proper routing (replaced floating navigation)
  - Updated all pages: Landing, Analysis, Template Preview, Upload/Apply, Comparison/Export
  - Implemented modern cards, buttons, and layouts with consistent styling
  - Added proper tabbed interfaces and interactive components
  - Used utility classes for consistent styling across components
  - All components now follow light theme design specifications

## Database Schema
- **users**: User accounts with authentication
- **videos**: Video processing records
- **templates**: Style templates for transformations
- **analysis_results**: AI analysis results
- **payments**: Payment transactions

## User Preferences
- Clean, modern light theme design with white backgrounds
- Professional UI components with consistent styling
- Tabbed interfaces for better organization
- Modern navigation with proper routing between pages

## Development Notes
- Using Drizzle ORM for database operations
- Following fullstack_js blueprint guidelines
- Database migrations handled via `npm run db:push`