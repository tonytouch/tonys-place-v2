# Tony's Place 2026

The ultimate digital radio and lifestyle platform. High-fidelity audio, curated digital culture, and decentralized commerce.

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + sql.js (SQLite in-memory)
- **Authentication**: WebAuthn/Passkeys
- **Hosting**: Netlify (Frontend) + Render (Backend)

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Install Dependencies

```bash
# Frontend
cd tonys_place_v2
npm install

# Backend
cd backend
npm install
```

### Run Development

```bash
# Frontend (Vite dev server on port 3001)
npm run dev

# Backend (Express on port 9000)
cd backend && npm start
```

### Build for Production

```bash
# Frontend build
npm run build
# Output: dist/

# Backend is single server that serves both frontend + API
cd backend && npm start
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/radio/now-playing` | GET | Current playing track |
| `/api/tracks` | GET | List all tracks |
| `/api/tracks/:id` | GET | Single track |
| `/api/playlists` | GET | List playlists |
| `/api/products` | GET | Shop products |
| `/api/auth/register` | POST | Register with passkey |
| `/api/auth/login` | POST | Login with passkey |
| `/api/auth/session` | GET | Verify session |

## 🎵 Audio Files

Audio files are stored in `/home/tony/tonys_place_prod/backend/uploads` and served via `/uploads/*`

## 🔐 Authentication

Uses WebAuthn/Passkeys for secure, passwordless authentication.

## 🚢 Deployment

### Frontend → Netlify
```bash
netlify deploy --prod --dir=dist
```

### Backend → Render
1. Connect GitHub repo to Render
2. Create Web Service with:
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
   - Environment: Node

## 📁 Project Structure

```
tonys_place_v2/
├── backend/
│   ├── server.js      # Express server
│   ├── database.js    # SQLite with sql.js
│   ├── auth.js        # Passkey auth handlers
│   ├── data/          # Database files
│   └── uploads/       # Audio files (symlink)
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── services/      # Business logic
│   └── store/         # Zustand state
├── dist/              # Production build
└── Procfile           # Render deployment
```

## License

MIT
