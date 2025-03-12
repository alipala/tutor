# Tutor Application

A voice conversation application with a modern UI that allows users to interact through voice.

## Railway.app Deployment Guide

This application is configured for easy deployment on Railway.app.

### Prerequisites

1. A Railway.app account
2. OpenAI API key for the voice conversation functionality

### Deployment Steps

1. **Fork or clone this repository to your GitHub account**

2. **Connect your Railway.app account to GitHub**
   - Log in to Railway.app
   - Go to your dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select this repository

3. **Configure Environment Variables**
   In your Railway.app project settings, add the following environment variables:

   **Required Variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: Set to `production`

   **Optional Variables:**
   - `PORT`: The port for your backend (Railway sets this automatically)
   - `FRONTEND_URL`: URL of your frontend (if deployed separately)
   - `BACKEND_URL`: URL of your backend (if deployed separately)

4. **Deploy the Application**
   - Railway will automatically detect the configuration and deploy your application
   - The deployment process will:
     - Install dependencies for both frontend and backend
     - Build the Next.js frontend
     - Start the backend server

5. **Access Your Application**
   - Once deployed, Railway will provide a URL to access your application
   - You can also configure a custom domain in Railway settings

### Local Development

To run the application locally:

1. Clone the repository
2. Install dependencies:
   ```
   npm run install:all
   ```
3. Create `.env` files:
   - Copy `.env.example` to `.env` in the backend directory
   - Copy `.env.example` to `.env.local` in the frontend directory
   - Add your OpenAI API key to the backend `.env` file

4. Start the development servers:
   ```
   npm run dev
   ```

This will start both the backend (port 3001) and frontend (port 3000) in development mode.

## Project Structure

- `/backend`: Express.js server that handles API requests and OpenAI integration
- `/frontend`: Next.js application with the user interface
- `railway.json`: Configuration for Railway.app deployment
- `Procfile`: Defines process types for deployment platforms

## Features

- Modern dark gradient UI
- Voice conversation functionality
- WebRTC integration for real-time communication
- Responsive design for mobile and desktop
