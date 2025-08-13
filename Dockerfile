
# --- Build frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY apps/frontend/package*.json ./
RUN npm ci
COPY apps/frontend .
RUN npm run build

# --- Build backend ---
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY apps/backend/package*.json ./
RUN npm ci
COPY apps/backend .
# Copy built frontend to backend's public directory
COPY --from=frontend-build /app/frontend/dist ./public
RUN npm run build

# --- Production image ---
FROM node:20-alpine
WORKDIR /app
COPY --from=backend-build /app/backend .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]