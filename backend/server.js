const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('Starting Tony\'s Place Backend...');

const PORT = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(express.json());

// Health check - FIRST route
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Radio endpoints
app.get('/api/radio/now-playing', (req, res) => {
  res.json({
    now_playing: {
      song: {
        id: 1,
        title: 'Demo Track',
        artist: 'Tony Studio',
        duration: 240,
        audio_url: '/uploads/demo.mp3'
      }
    }
  });
});

// Track endpoints
app.get('/api/tracks', (req, res) => {
  const tracks = [
    { id: 1, title: 'Demo Track 1', artist: 'Tony Studio', duration: 240 },
    { id: 2, title: 'Demo Track 2', artist: 'Various', duration: 180 },
  ];
  res.json(tracks);
});

// Products endpoints
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, title: 'Premium Headphones', price: 299.99, image: '/icons.svg' },
    { id: 2, title: 'DJ Controller', price: 549.99, image: '/icons.svg' },
  ]);
});

// Auth endpoints (stubs)
app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, message: 'Registration endpoint ready' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, message: 'Login endpoint ready' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: "Tony's Place API is running",
    version: "1.0.0"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Tony\'s Place API running on port ' + PORT);
});
