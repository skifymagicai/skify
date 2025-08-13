# Render Deployment Guide for Skify

## 1. Prerequisites
- Create a Backblaze B2 bucket and get your credentials
- Create a Postgres database (Render or external)
- Set up a Redis instance (Render or use the included service)

## 2. Environment Variables
Set these in the Render dashboard for both backend and frontend as needed:
- S3_ENDPOINT (Backblaze endpoint)
- S3_ACCESS_KEY (B2 Key ID)
- S3_SECRET_KEY (B2 App Key)
- S3_BUCKET (B2 bucket name)
- DATABASE_URL (Postgres connection string)
- REDIS_URL (Redis connection string)
- JWT_SECRET (your JWT secret)
- VITE_API_URL (for frontend, set to backend Render URL)

## 3. Deploy
- Push your code to GitHub
- Connect your repo to Render
- Render will auto-detect `render.yaml` and set up services
- Set environment variables/secrets in the Render dashboard
- Deploy!

## 4. Health Checks
- Backend: `/health` (port 4000)
- Frontend: `/` (port 5173)

---

See `render.yaml` for service definitions and environment variable mapping.
