const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/router');

// Load environment variables
const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
console.log('🔍 Looking for .env file at:', envPath);
console.log('📁 .env file exists:', fs.existsSync(envPath));
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174', 'http://localhost:8080'], // Support multiple ports including Python server
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', chatRoutes);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve the main chat interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/hospital-fixed.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Call Center Backend is running' });
});

// Streaming chat endpoint for real-time responses
app.post('/api/chat/stream', async (req, res) => {
  try {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true'
    });

    const { message, sessionId, conversationHistory } = req.body;

    // Import the router here to avoid circular dependency
    const router = require('./routes/router');
    
    // Get the AI response (we'll modify this to stream)
    const aiResponse = await new Promise((resolve, reject) => {
      // Create a mock response object to capture the result
      const mockRes = {
        json: (data) => resolve(data),
        status: (code) => ({ json: (data) => reject(new Error(`HTTP ${code}: ${data.error}`)) })
      };
      
      // Create mock request
      const mockReq = { body: { message, sessionId, conversationHistory } };
      
      // Call the existing chat handler
      router.stack.find(layer => layer.route?.path === '/chat')?.route?.stack?.[0]?.handle(mockReq, mockRes);
    });

    // Stream the response character by character
    const responseText = aiResponse.message;
    const agent = aiResponse.agent;
    
    // Send agent info first
    res.write(`data: ${JSON.stringify({ type: 'agent', agent })}\n\n`);
    
    // Stream the message character by character
    for (let i = 0; i < responseText.length; i++) {
      const char = responseText[i];
      res.write(`data: ${JSON.stringify({ type: 'char', char })}\n\n`);
      
      // Add small delay to simulate real typing
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
    }
    
    // Send completion signal
    res.write(`data: ${JSON.stringify({ type: 'complete', message: responseText, agent })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'I apologize, but I encountered a technical issue. Please try again.' })}\n\n`);
    res.end();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Call Center Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📅 Mock LLM mode: ${process.env.USE_MOCK_LLM === 'true' ? 'ENABLED' : 'DISABLED'}`);
});
