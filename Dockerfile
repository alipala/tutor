# Use Node.js for frontend build and Python for backend
FROM node:20-slim AS frontend

# Set working directory for frontend
WORKDIR /app

# Copy package files for better caching
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Python stage for backend
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend requirements first for better caching
COPY backend/requirements.txt ./backend/

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend /app/frontend/.next ./frontend/.next
COPY --from=frontend /app/frontend/out ./frontend/out
COPY --from=frontend /app/frontend/public ./frontend/public

# Set environment variables
ENV PORT=3001
ENV NODE_ENV=production

# Expose the port
EXPOSE ${PORT}

# Command to run the application
CMD ["python3", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "${PORT}"]
