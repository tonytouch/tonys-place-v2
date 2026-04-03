import { v4 as uuidv4 } from 'uuid';
import { findUserByEmail, createUser, createSession, getSession, deleteSession, saveDatabase } from './database.js';

// Generate challenge for WebAuthn
function generateChallenge() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Simple in-memory store for challenges (in production, use Redis or similar)
const pendingChallenges = new Map();

export async function registerPasskey(req, res) {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if user already exists
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Generate challenge
  const challenge = generateChallenge();
  const challengeId = uuidv4();

  // Store challenge temporarily
  pendingChallenges.set(challengeId, {
    email,
    name,
    challenge,
    createdAt: Date.now()
  });

  // WebAuthn registration options (simplified)
  const options = {
    challenge: challenge,
    rp: {
      name: "Tony's Place",
      id: 'tonysplace.co.uk'
    },
    user: {
      id: Array.from(crypto.getRandomValues(new Uint8Array(16))),
      name: email,
      displayName: name || email.split('@')[0]
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },
      { type: 'public-key', alg: -257 }
    ],
    timeout: 60000,
    attestation: 'preferred'
  };

  res.json({
    options,
    challengeId
  });
}

export async function verifyPasskey(req, res) {
  const { credential, challengeId } = req.body;

  if (!credential || !challengeId) {
    return res.status(400).json({ error: 'Missing credential or challenge ID' });
  }

  // Get stored challenge
  const stored = pendingChallenges.get(challengeId);
  if (!stored) {
    return res.status(400).json({ error: 'Invalid or expired challenge' });
  }

  // Check challenge age (max 5 minutes)
  if (Date.now() - stored.createdAt > 5 * 60 * 1000) {
    pendingChallenges.delete(challengeId);
    return res.status(400).json({ error: 'Challenge expired' });
  }

  // In a real implementation, you would verify the credential here
  // This is a simplified version that stores the credential data
  const passkeyId = credential.id || uuidv4();
  const credentialPublicKey = JSON.stringify(credential);

  // Create user
  const user = createUser(
    stored.email,
    stored.name,
    passkeyId,
    credentialPublicKey
  );

  // Generate session token
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  createSession(user.id, token, expiresAt);

  // Clean up challenge
  pendingChallenges.delete(challengeId);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token,
    expires_at: expiresAt
  });
}

export async function loginPasskey(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if user has passkey
  if (!user.passkey_id) {
    return res.status(400).json({ error: 'No passkey registered for this user' });
  }

  // Generate challenge for authentication
  const challenge = generateChallenge();
  const challengeId = uuidv4();

  pendingChallenges.set(challengeId, {
    email,
    userId: user.id,
    challenge,
    createdAt: Date.now()
  });

  // Return authentication options
  const options = {
    challenge: challenge,
    rp: {
      name: "Tony's Place",
      id: 'tonysplace.co.uk'
    },
    allowCredentials: [
      {
        id: user.passkey_id,
        type: 'public-key'
      }
    ],
    timeout: 60000
  };

  res.json({
    options,
    challengeId
  });
}

export async function verifyLoginPasskey(req, res) {
  const { credential, challengeId } = req.body;

  if (!credential || !challengeId) {
    return res.status(400).json({ error: 'Missing credential or challenge ID' });
  }

  // Get stored challenge
  const stored = pendingChallenges.get(challengeId);
  if (!stored) {
    return res.status(400).json({ error: 'Invalid or expired challenge' });
  }

  // Check challenge age
  if (Date.now() - stored.createdAt > 5 * 60 * 1000) {
    pendingChallenges.delete(challengeId);
    return res.status(400).json({ error: 'Challenge expired' });
  }

  // In production, verify the credential properly
  // For now, just create session
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  createSession(stored.userId, token, expiresAt);

  // Clean up challenge
  pendingChallenges.delete(challengeId);

  // Get user info
  const user = findUserByEmail(stored.email);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token,
    expires_at: expiresAt
  });
}

export async function verifySession(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }

  const token = authHeader.split(' ')[1];
  const session = getSession(token);

  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      id: session.user_id,
      email: session.email,
      name: session.name
    }
  });
}

export async function logout(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  deleteSession(token);

  res.json({ success: true });
}

export default {
  registerPasskey,
  verifyPasskey,
  loginPasskey,
  verifyLoginPasskey,
  verifySession,
  logout
};
