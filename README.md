# Skify Core - AI Video Transformation Platform

A production-ready AI-powered video transformation SaaS platform that analyzes viral videos and applies their styles to user content.

## 🚀 Features

- **Viral Video Analysis**: AI-powered extraction of effects, transitions, text overlays, and audio sync
- **Template Library**: Save and reuse viral video styles
- **Queue-based Processing**: Async job processing with BullMQ and Redis
- **PWA Support**: Progressive Web App with offline capabilities
- **Payment Integration**: Razorpay for Free/Pro tiers
- **Multi-format Export**: 720p (free) and 4K (pro) with watermark control
- **Real-time Progress**: Job status tracking and progress updates

## 🏗️ Architecture

- **Frontend**: React + Vite + TypeScript + PWA
- **Backend**: Express.js + BullMQ + Redis
- **Storage**: Local filesystem or S3-compatible
- **Authentication**: JWT-based with user tiers
- **Payment**: Razorpay integration

## 📋 Prerequisites

- Node.js 18+ 
- Redis (optional - falls back to in-memory queue)
- Upstash account (optional for auto Redis setup)
- Razorpay account (for payments)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd skify-core
npm install
cd client && npm install && cd ..
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:

```env
# Required
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key

# Razorpay (required for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Optional - Upstash Redis Auto-creation
UPSTASH_EMAIL=your-upstash-email
UPSTASH_PASSWORD=your-upstash-password

# Optional - AI Integration
AI_ANALYZE_ENDPOINT=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-ai-api-key

# Optional - S3 Storage
S3_BUCKET=skify-uploads
S3_ACCESS_KEY=your-s3-key
S3_SECRET=your-s3-secret
```

### 3. Build and Run
```bash
# Build client
npm run build:client

# Start server
npm start

# Development mode
npm run dev
```

### 4. Access the Application
- Open http://localhost:5000
- Use demo account or create new user
- Start uploading and transforming videos!

## 🧪 Testing

```bash
# Run API tests
npm test

# Run end-to-end tests
npm run test:e2e

# Watch mode
npm run test:watch
```

## 📱 PWA Installation

The app supports Progressive Web App installation:
1. Visit the site on mobile/desktop
2. Look for "Install App" prompt
3. Enjoy native app experience with offline support

## 💳 Payment Integration

### Razorpay Setup
1. Create Razorpay account
2. Get API keys from dashboard
3. Add to Replit Secrets or .env:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
4. Test with Razorpay test cards

### Tier System
- **Free**: 720p exports with watermark
- **Pro**: 4K exports, no watermark, priority processing

## 🔄 Queue Processing

The system uses BullMQ for async job processing:

### With Redis
```bash
# Auto-setup with Upstash credentials
UPSTASH_EMAIL=your-email
UPSTASH_PASSWORD=your-password
```

### Without Redis
- Automatically falls back to in-memory processing
- Set `DISABLE_UPSTASH_AUTOCREATE=true` to skip Redis setup

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login

### Upload & Analysis
- `POST /api/upload/sign` - Get signed upload URL
- `POST /api/upload/complete` - Complete upload
- `POST /api/analyze` - Analyze video for style extraction

### Templates
- `GET /api/templates` - Get template library
- `POST /api/template` - Save new template
- `POST /api/template/apply` - Apply template to video

### Jobs & Status
- `GET /api/job/:id` - Get job status and progress
- `GET /api/files/:filename` - Download processed files

### Payments
- `POST /api/payment/order` - Create Razorpay order
- `POST /api/webhook/razorpay` - Payment verification

### Admin
- `GET /api/admin/audit` - Audit logs
- `GET /api/admin/moderation` - System stats

## 🚢 Deployment

### Docker
```bash
docker build -t skify-core .
docker run -p 5000:5000 --env-file .env skify-core
```

### Replit
1. Import repository to Replit
2. Add secrets in Replit Secrets:
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - Optional: Upstash credentials
3. Run with `npm start`

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure Redis (Upstash recommended)
- [ ] Add all required secrets
- [ ] Build client assets (`npm run build:client`)
- [ ] Set up SSL/TLS
- [ ] Configure domain and webhooks

## 🛠️ Development

### Project Structure
```
skify-core/
├── client/                 # React PWA frontend
│   ├── src/
│   │   ├── pages/         # App pages
│   │   ├── contexts/      # React contexts
│   │   └── components/    # UI components
├── server/                # Express.js backend
│   ├── app.js            # Main server file
│   └── worker/           # BullMQ workers
├── storage/              # Local file storage
├── tests/                # Test files
└── scripts/             # Setup scripts
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run build:client` - Build React app
- `npm test` - Run tests
- `npm run test:e2e` - Run Playwright tests

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available options.

### Feature Flags
- `DISABLE_UPSTASH_AUTOCREATE` - Skip Redis auto-setup
- `STORAGE_PROVIDER` - Choose storage backend (local/s3/r2)

## 📚 Documentation

### AI Integration
The system supports pluggable AI analysis:
- Set `AI_ANALYZE_ENDPOINT` for custom AI service
- Falls back to deterministic analysis if not configured
- Supports OpenAI, RunwayML, and custom endpoints

### Storage Options
- **Local**: Default for development
- **S3**: Configure with S3_* environment variables
- **R2**: Cloudflare R2 compatible

## 🤝 Support

For issues and questions:
1. Check the documentation above
2. Review test files for usage examples
3. Check Replit Secrets configuration
4. Verify all required environment variables

## 🔒 Security

- JWT tokens for authentication
- CSRF protection for webhooks
- File type validation for uploads
- Input sanitization throughout

## 📈 Monitoring

The system provides:
- Audit logging for all user actions
- Job progress tracking
- Error reporting and handling
- Admin dashboard for system stats

---

Built with ❤️ for viral video creators worldwide!