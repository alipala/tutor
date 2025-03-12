import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is not configured in .env file');
  console.log('Please add OPENAI_API_KEY=your_api_key to your .env file');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://tutor-production.up.railway.app']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  import('path').then(path => {
    import('url').then(url => {
      const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
      const frontendPath = path.join(__dirname, '../frontend');
      
      // Serve Next.js static files
      app.use('/_next', express.static(path.join(frontendPath, '.next')));
      
      // Serve public files
      app.use(express.static(path.join(frontendPath, 'public')));
      
      // For all other routes, serve the Next.js app
      app.get('*', (req, res) => {
        if (req.url.startsWith('/api')) {
          // Skip API routes
          return;
        }
        res.sendFile(path.join(frontendPath, '.next/server/pages/index.html'));
      });
      
      console.log(`Serving Next.js files from: ${frontendPath}`);
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple endpoint for testing connection
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connection successful' });
});

// Mock ephemeral key endpoint for testing when OpenAI API key is not available
app.post('/api/mock-token', (req, res) => {
  console.log('Providing mock ephemeral key for testing');
  res.json({
    ephemeral_key: 'mock_ephemeral_key_for_testing',
    expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  });
});

// Endpoint to generate ephemeral keys for OpenAI Realtime API
app.post('/api/realtime/token', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('ERROR: OPENAI_API_KEY is not configured in .env file');
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }
    
    console.log('Generating ephemeral key with OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return res.status(response.status).json({ 
        error: 'Error from OpenAI API', 
        details: errorText 
      });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error generating ephemeral key:', error);
    res.status(500).json({ error: 'Failed to generate ephemeral key' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
