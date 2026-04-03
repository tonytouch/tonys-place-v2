import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'tonys.db');
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.join(__dirname, '..', '..', 'tonys_place_prod', 'backend', 'uploads');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

// Initialize database
export async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Loaded existing database from', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ Created new database');
  }

  // Create tables
  createTables();

  // Import tracks from uploads folder
  await importTracks();

  // Save initial state
  saveDatabase();

  console.log('✅ Database initialized with', getTrackCount(), 'tracks');
  return db;
}

function createTables() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      passkey_id TEXT,
      credential_public_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tracks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      duration INTEGER,
      file_path TEXT,
      bpm REAL,
      key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Playlists table
  db.run(`
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      is_public INTEGER DEFAULT 1,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample products if empty
  const productCount = db.exec('SELECT COUNT(*) as count FROM products')[0]?.values[0][0] || 0;
  if (productCount === 0) {
    const products = [
      ['Premium Headphones', 299.99, '/icons.svg', 'High-fidelity wireless headphones'],
      ['DJ Controller Kit', 549.99, '/icons.svg', 'Professional DJ controller'],
      ['Studio Monitor Speakers', 899.99, '/icons.svg', 'Professional studio monitors'],
      ['Microphone Pack', 149.99, '/icons.svg', 'Studio quality microphone'],
      [' vinyl Records Bundle', 79.99, '/icons.svg', 'Curated vinyl collection'],
    ];

    for (const [title, price, image, description] of products) {
      db.run('INSERT INTO products (title, price, image, description) VALUES (?, ?, ?, ?)', 
        [title, price, image, description]);
    }
  }
}

async function importTracks() {
  const trackCount = getTrackCount();
  if (trackCount > 0) {
    console.log(`📀 Database already has ${trackCount} tracks, skipping import`);
    return;
  }

  console.log('📀 Scanning audio files from', UPLOADS_PATH);

  if (!fs.existsSync(UPLOADS_PATH)) {
    console.log('⚠️ Uploads directory not found, creating sample tracks');
    createSampleTracks();
    return;
  }

  // Scan uploads directory for audio files
  const files = fs.readdirSync(UPLOADS_PATH);
  const audioFiles = files.filter(f => 
    f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.flac') || f.endsWith('.m4a')
  );

  console.log(`📀 Found ${audioFiles.length} audio files`);

  // Import first 100 tracks (can increase later)
  const maxTracks = 100;
  for (let i = 0; i < Math.min(audioFiles.length, maxTracks); i++) {
    const filename = audioFiles[i];
    const filePath = path.join(UPLOADS_PATH, filename);

    // Parse filename for title and artist
    // Format: "Artist - Title.mp3" or just "Title.mp3"
    let title = filename.replace(/\.(mp3|wav|flac|m4a)$/i, '');
    let artist = 'Unknown Artist';

    if (filename.includes(' - ')) {
      const parts = filename.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').replace(/\.(mp3|wav|flac|m4a)$/i, '').trim();
    }

    // Get file stats for duration estimate (rough)
    const stats = fs.statSync(filePath);
    const duration = Math.round(stats.size / 20000); // Rough estimate: ~20KB/sec for mp3

    db.run(
      'INSERT INTO tracks (title, artist, file_path, duration) VALUES (?, ?, ?, ?)',
      [title, artist, `/uploads/${filename}`, duration]
    );
  }

  console.log(`✅ Imported ${Math.min(audioFiles.length, maxTracks)} tracks`);
}

function createSampleTracks() {
  const sampleTracks = [
    ['Midnight Dreams', 'Tony Studio', '/uploads/sample1.mp3', 245],
    ['Neon Horizons', 'Tony Studio', '/uploads/sample2.mp3', 312],
    ['Electric Soul', 'Various Artists', '/uploads/sample3.mp3', 278],
    ['Deep Waters', 'Ambient Collective', '/uploads/sample4.mp3', 420],
    ['Golden Hour', 'Tony Studio', '/uploads/sample5.mp3', 198],
  ];

  for (const [title, artist, file_path, duration] of sampleTracks) {
    db.run('INSERT INTO tracks (title, artist, file_path, duration) VALUES (?, ?, ?, ?)',
      [title, artist, file_path, duration]);
  }
}

function getTrackCount() {
  const result = db.exec('SELECT COUNT(*) as count FROM tracks');
  return result[0]?.values[0][0] || 0;
}

export function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function getDb() {
  return db;
}

// Query helpers
export function getTracks(limit = 50, offset = 0) {
  const stmt = db.prepare('SELECT * FROM tracks ORDER BY id DESC LIMIT ? OFFSET ?');
  stmt.bind([limit, offset]);
  
  const tracks = [];
  while (stmt.step()) {
    tracks.push(stmt.getAsObject());
  }
  stmt.free();
  return tracks;
}

export function getTrack(id) {
  const stmt = db.prepare('SELECT * FROM tracks WHERE id = ?');
  stmt.bind([id]);
  
  let track = null;
  if (stmt.step()) {
    track = stmt.getAsObject();
  }
  stmt.free();
  return track;
}

export function getNowPlaying() {
  // For now, return random track as "now playing"
  const stmt = db.prepare('SELECT * FROM tracks ORDER BY RANDOM() LIMIT 1');
  
  let track = null;
  if (stmt.step()) {
    track = stmt.getAsObject();
  }
  stmt.free();
  
  return {
    now_playing: {
      song: track ? {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        audio_url: track.file_path
      } : null
    }
  };
}

export function getPlaylists() {
  const result = db.exec('SELECT * FROM playlists ORDER BY id DESC');
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

export function getProducts() {
  const result = db.exec('SELECT * FROM products ORDER BY id DESC');
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

// Auth helpers
export function findUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  stmt.bind([email]);
  
  let user = null;
  if (stmt.step()) {
    user = stmt.getAsObject();
  }
  stmt.free();
  return user;
}

export function createUser(email, name, passkeyId, credentialPublicKey) {
  db.run(
    'INSERT INTO users (email, name, passkey_id, credential_public_key) VALUES (?, ?, ?, ?)',
    [email, name, passkeyId, credentialPublicKey]
  );
  saveDatabase();
  
  return findUserByEmail(email);
}

export function createSession(userId, token, expiresAt) {
  db.run(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
  saveDatabase();
}

export function getSession(token) {
  const stmt = db.prepare('SELECT s.*, u.email, u.name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?');
  stmt.bind([token, new Date().toISOString()]);
  
  let session = null;
  if (stmt.step()) {
    session = stmt.getAsObject();
  }
  stmt.free();
  return session;
}

export function deleteSession(token) {
  db.run('DELETE FROM sessions WHERE token = ?', [token]);
  saveDatabase();
}

export default { initDatabase, getDb, getTracks, getTrack, getNowPlaying, getPlaylists, getProducts };
