# SkifyMagicAI - AI-Powered Video Transformation Platform

> Transform your videos into viral content using cutting-edge AI style transfer technology

## 🌟 Features

- **AI-Powered Analysis**: Extract style components from viral videos (timing, effects, color grading, transitions)
- **Template Library**: Browse and apply viral video templates to your content
- **Real-time Processing**: Background job queue with progress tracking
- **Pro Features**: 4K exports, watermark removal, unlimited uploads
- **Mobile-First PWA**: Responsive design with offline capabilities
- **Secure Payments**: Integrated Razorpay payment processing
- **Production Ready**: Complete testing suite and deployment infrastructure

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, uses memory fallback)
- S3-compatible storage (AWS S3, Cloudflare R2)

### Installation

```bash
# Clone and install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## 🔧 Environment Setup

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/skify_db

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-key

# S3 Storage (AWS S3, Cloudflare R2, etc.)
S3_BUCKET_NAME=skify-storage
S3_ACCESS_KEY_ID=your-s3-access-key
S3_SECRET_ACCESS_KEY=your-s3-secret-key
S3_REGION=us-east-1

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Optional: Redis for BullMQ
REDIS_URL=redis://localhost:6379

# Optional: AI Analysis Service
AI_ANALYZE_ENDPOINT=https://api.your-ai-service.com/analyze
AI_API_KEY=your-ai-api-key
```

### Replit Secrets Setup

If running on Replit, add these secrets in the Secrets tab:

1. `DATABASE_URL` - Your PostgreSQL connection string
2. `JWT_SECRET` - A secure random string for JWT tokens
3. `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` - S3 credentials
4. `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` - Razorpay payment credentials
5. `REDIS_URL` - Redis connection string (optional)

## 📋 Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests

# Code Quality
npm run check        # TypeScript type checking
```

## 🏗️ Architecture

### Backend (Node.js + Express)

- **Authentication**: JWT-based with bcrypt password hashing
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: S3-compatible file storage with signed URLs  
- **Queue System**: BullMQ with Redis for background processing
- **Payment Processing**: Razorpay integration with webhook handling
- **API Documentation**: RESTful API with comprehensive error handling

### Frontend (React + TypeScript)

- **State Management**: Zustand for auth, TanStack Query for server state
- **UI Components**: shadcn/ui with Tailwind CSS
- **File Upload**: Drag & drop with progress tracking
- **PWA Features**: Service Worker, offline support, installable
- **Responsive Design**: Mobile-first with dark mode support

### Database Schema

8 comprehensive tables including:
- Users with tier management and upload quotas
- Video uploads with metadata and analysis results  
- Style analysis with detailed AI extraction data
- Templates with public/private sharing
- Render jobs with progress tracking
- Payment processing with Razorpay integration
- Audit logs for compliance and debugging
- Moderation queue for content review

## 🧪 Testing

### Unit Tests (Jest + Supertest)

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm test auth.test.ts      # Run specific test file
```

### End-to-End Tests (Playwright)

```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e -- --ui   # Run with UI mode
```

Test coverage includes:
- Authentication flows
- File upload and processing
- Payment integration
- Template application
- API error handling

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment-Specific Configuration

- Development: Uses Vite dev server with hot reload
- Production: Serves static files with Express
- Testing: Isolated test database and mocked services

## 🔐 Security Features

- JWT token-based authentication with secure httpOnly cookies
- bcrypt password hashing with salt rounds
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- CORS protection with configurable origins
- Rate limiting and request size restrictions
- Secure file upload with type validation
- Payment signature verification

## 📊 Monitoring & Analytics

- Comprehensive audit logging for all user actions
- Error tracking with detailed stack traces
- Performance monitoring for API endpoints
- Database query optimization
- File upload progress tracking
- Payment transaction logging

## 🤝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user
- `GET /api/auth/quota` - Check upload quota

### File Upload
- `POST /api/upload/sign` - Get signed upload URL
- `POST /api/upload/complete` - Complete upload and trigger analysis
- `GET /api/upload/:id/status` - Get upload status

### Templates  
- `GET /api/templates` - Browse public templates
- `GET /api/templates/my` - Get user's templates
- `POST /api/templates/:id/apply` - Apply template to media
- `POST /api/templates/:id/like` - Like/unlike template

### Jobs
- `GET /api/job/:id` - Get render job status
- `GET /api/job` - List user's jobs
- `DELETE /api/job/:id` - Cancel job

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history

## 🎯 Roadmap

- [ ] Advanced AI models for style analysis
- [ ] Real-time collaboration features  
- [ ] Advanced template customization
- [ ] Batch processing capabilities
- [ ] API rate limiting and quotas
- [ ] Advanced analytics dashboard
- [ ] Third-party integrations (Instagram, TikTok APIs)
- [ ] Mobile app (React Native)

## 📞 Support

For support and questions:
- Email: support@skifymagicai.gmail.com
- Documentation: [Coming Soon]
- Issues: GitHub Issues

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by the SkifyMagicAI Team**

*Transform your videos, amplify your reach, create viral content effortlessly.*