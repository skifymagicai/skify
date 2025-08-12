FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build frontend (if using Vite/React)
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production
	RUN cd client && npm install --package-lock-only && npm ci --only=production

# Copy source code
COPY . .

# Build client
RUN npm run build:client

# Create necessary directories
RUN mkdir -p storage/uploads storage/outputs logs

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]