import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

console.log('Loading modules...');

import { initDatabase, getTracks, getTrack, getNowPlaying, getPlaylists, getProducts, getSession } from './database.js';
import * as auth from './auth.js';

console.log('Modules loaded');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 9000;
console.log('PORT set to:', PORT);

const app = express();
console.log('Express app created');

// Middleware
app.use(cors());
app.use(express.json());
console.log('Middleware added');

// Paths - different for local vs Render
const isRender = process.env.RENDER === 'true' || !fs.existsSync(path.join(__dirname, '..', 'dist'));
const DIST_PATH = isRender ? null : path.join(__dirname, '..', 'dist');
const UPLOADS_PATH = isRender ? null : process.env.UPLOADS_PATH || path.join(__dirname, '..', '..', 'tonys_place_prod', 'backend', 'uploads');

console.log('Running on:', isRender ? 'Render (API only)' : 'Local (full stack)');

// Serve React build only if exists (local dev only)
if (DIST_PATH && fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  console.log('📁 Serving static files from:', DIST_PATH);
}

// Serve uploads directory if exists (local dev only)  
if (UPLOADS_PATH && fs.existsSync(UPLOADS_PATH)) {
  app.use('/uploads', express.static(UPLOADS_PATH));
  console.log('🎵 Serving audio from:', UPLOADS_PATH);
} else {
  console.log('⚠️ Audio files not available on this server');
}

// ============ API ROUTES ============

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Radio endpoints
app.get('/api/radio/now-playing', (req, res) => {
  const nowPlaying = getNowPlaying();
  res.json(nowPlaying);
});

// Track endpoints
app.get('/api/tracks', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const tracks = getTracks(limit, offset);
  res.json(tracks);
});

app.get('/api/tracks/:id', (req, res) => {
  const { id } = req.params;
  const track = getTrack(parseInt(id));
  
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }
  
  res.json(track);
});

// Stream audio file
app.get('/api/tracks/:id/stream', (req, res) => {
  const { id } = req.params;
  const track = getTrack(parseInt(id));
  
  if (!track || !track.file_path) {
    return res.status(404).json({ error: 'Track or file not found' });
  }
  
  const filePath = track.file_path.startsWith('/') 
    ? path.join(__dirname, track.file_path)
    : path.join(UPLOADS_PATH, track.file_path);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }
  
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0]);
    const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;
    const chunkSize = end - start + 1;
    
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg'
    };
    
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Playlist endpoints
app.get('/api/playlists', (req, res) => {
  const playlists = getPlaylists();
  res.json(playlists);
});

// Products endpoints
app.get('/api/products', (req, res) => {
  const products = getProducts();
  res.json(products);
});

// ============ AUTH ROUTES ============

app.post('/api/auth/register', auth.registerPasskey);
app.post('/api/auth/register/verify', auth.verifyPasskey);
app.post('/api/auth/login', auth.loginPasskey);
app.post('/api/auth/verify', auth.verifyLoginPasskey);
app.post('/api/auth/logout', auth.logout);
app.get('/api/auth/session', auth.verifySession);

// ============ FALLBACK FOR API ============

// API 404 handler
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found', path: req.path });
  }
  // On Render, just return a message
  res.json({ 
    message: "Tony's Place API is running", 
    endpoints: [
      '/api/v1/health',
      '/api/radio/now-playing', 
      '/api/tracks',
      '/api/products',
      '/api/auth/register',
      '/api/auth/login'
    ]
  });
});

// ============ START SERVER ============

async function start() {
  try {
    console.log('Starting Tony\'s Place backend...');
    console.log('PORT:', PORT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Initialize database
    await initDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('✅ Tony\'s Place API running on port ' + PORT);
      console.log('📡 Endpoints available at /api/*');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
