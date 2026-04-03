import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Initialize database with better-sqlite3 (sync, no dependencies)
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'tonys.db');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      passkey_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tracks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      duration INTEGER,
      bpm REAL,
      key TEXT,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Playlists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      is_public INTEGER DEFAULT 1,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data if empty
  const trackCount = db.prepare('SELECT COUNT(*) as count FROM tracks').get();
  if (trackCount.count === 0) {
    const insertQuery = `
      INSERT OR IGNORE INTO tracks (title, artist, album, duration, bpm, key, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const sampleTracks = [
      ['Midnight Dreams', 'Tony Studio', 'Night Sessions Vol. 1', 245, 128.0, 'Cm', '/stream/midnight_dreams.mp3'],
      ['Neon Horizons', 'Tony Studio', 'Night Sessions Vol. 1', 312, 124.0, 'Am', '/stream/neon_horizons.mp3'],
      ['Electric Soul', 'Various Artists', 'Curated Collection', 278, 126.0, 'Gm', '/stream/electric_soul.mp3'],
      ['Deep Waters', 'Ambient Collective', 'Underground', 420, 95.0, 'Dm', '/stream/deep_waters.mp3'],
      ['Golden Hour', 'Tony Studio', 'Sunset Sessions', 198, 110.0, 'Em', '/stream/golden_hour.mp3'],
      ['Crystal Clear', 'Tony Studio', 'Night Sessions Vol. 2', 267, 130.0, 'Fm', '/stream/crystal_clear.mp3'],
      ['Velvet Night', 'Lounge Collective', 'Evening Vibes', 345, 98.0, 'Bbm', '/stream/velvet_night.mp3'],
    ];

    for (const [title, artist, album, duration, bpm, key, filePath] of sampleTracks) {
      db.run(insertQuery, [title, artist, album, duration, bpm, key, filePath]);
    }
  }

  console.log('✅ Database initialized at:', dbPath);
}

// Export database for use in server.js
export default db;
