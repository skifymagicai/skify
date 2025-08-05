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
- **2025-08-05**: Completed modern UI redesign matching design specifications
  - Implemented clean, minimalistic SaaS interface with white backgrounds
  - Created professional landing page with gradient hero text and feature cards
  - Built comprehensive video analysis page with effect detection and confidence meters
  - Designed template preview page with editable color palette panel
  - Developed side-by-side comparison export page with watermark options
  - Added drag-and-drop upload interface with file requirements display
  - Used consistent blue/purple accent colors throughout the platform
  - Implemented proper navigation with tab system and back buttons
  - Added comprehensive data attributes for testing
  - Fixed all TypeScript errors and component issues

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