import express from 'express';
import cors from 'cors';
import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';

dotenv.config();

const createToken = async (roomName: string, participantName: string, role: string) => {
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set');
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
      ttl: '10m',
    }
  );

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: role === 'host',
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  app.get('/api/getToken', async (req, res) => {
    try {
      const { room, username, role } = req.query;

      if (!room || !username || !role) {
        res.status(400).json({ error: 'Missing parameters: room, username, role' });
        return;
      }

      console.log(`Generating token for User: ${username} | Role: ${role} | Room: ${room}`);
      const token = await createToken(room as string, username as string, role as string);
      res.json({ token });
    } catch (e: any) {
      console.error('Token generation error:', e);
      res.status(500).json({ error: e.message || 'Failed to generate token' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
