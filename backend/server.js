import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initDatabase, getTracks, getTrack, getNowPlaying, getPlaylists, getProducts, getSession } from './database.js';
import * as auth from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 9000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
const DIST_PATH = process.env.DIST_PATH || path.join(__dirname, '..', 'dist');
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.join(__dirname, '..', '..', 'tonys_place_prod', 'backend', 'uploads');

console.log('📁 Serving static files from:', DIST_PATH);
console.log('🎵 Serving audio from:', UPLOADS_PATH);

// Serve React build (frontend)
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
}

// Serve uploads directory (audio files)
if (fs.existsSync(UPLOADS_PATH)) {
  app.use('/uploads', express.static(UPLOADS_PATH));
} else {
  console.log('⚠️ Uploads directory not found at:', UPLOADS_PATH);
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

// ============ FALLBACK FOR SPA ============

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  if (fs.existsSync(path.join(DIST_PATH, 'index.html'))) {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  } else {
    res.status(404).send('Tony\'s Place - Build not found. Run npm run build in the frontend.');
  }
});

// ============ START SERVER ============

async function start() {
  try {
    // Initialize database
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log('✅ Tony\'s Place Backend running on http://localhost:' + PORT);
      console.log('📡 API available at http://localhost:' + PORT + '/api');
      console.log('🎵 Audio files at http://localhost:' + PORT + '/uploads');
      console.log('🌐 Frontend at http://localhost:' + PORT);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
