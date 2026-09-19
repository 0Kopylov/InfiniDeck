import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number; slideId?: string };
  lastActive: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface PaintStroke {
  id: string;
  slideId: string;
  userId: string;
  userColor: string;
  tool: 'pen' | 'highlighter' | 'laser';
  size: number;
  points: StrokePoint[];
  color: string;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // In-memory state for live collaboration
  const users = new Map<WebSocket, Collaborator>();
  const chatMessages: ChatMessage[] = [
    {
      id: 'welcome-msg',
      senderId: 'system',
      senderName: 'Meeting Assistant',
      senderColor: '#3b82f6',
      text: 'Collaborative session active. Paint, pan, and notes sync in real time.',
      timestamp: Date.now() - 60000,
    }
  ];
  const paintStrokes: PaintStroke[] = [];

  // WebSocket Server attached to same HTTP port
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcast(data: any, excludeWs?: WebSocket) {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
        client.send(payload);
      }
    });
  }

  wss.on('connection', (ws: WebSocket) => {
    // Send initial snapshot
    const currentUsers = Array.from(users.values());
    ws.send(JSON.stringify({
      type: 'init',
      payload: {
        users: currentUsers,
        messages: chatMessages,
        paintStrokes,
      }
    }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        switch (msg.type) {
          case 'user:join': {
            const user: Collaborator = {
              id: msg.payload.id || `user_${Math.random().toString(36).substring(2, 7)}`,
              name: msg.payload.name || 'Anonymous Presenter',
              color: msg.payload.color || '#38bdf8',
              lastActive: Date.now(),
            };
            users.set(ws, user);
            broadcast({
              type: 'user:joined',
              payload: { user }
            });
            break;
          }

          case 'cursor:move': {
            const user = users.get(ws);
            if (user) {
              user.cursor = msg.payload;
              user.lastActive = Date.now();
              broadcast({
                type: 'cursor:update',
                payload: {
                  userId: user.id,
                  cursor: msg.payload,
                }
              }, ws);
            }
            break;
          }

          case 'paint:stroke': {
            const stroke: PaintStroke = msg.payload;
            paintStrokes.push(stroke);
            if (paintStrokes.length > 3000) {
              paintStrokes.splice(0, paintStrokes.length - 3000);
            }
            broadcast({
              type: 'paint:stroke',
              payload: stroke
            }, ws);
            break;
          }

          case 'paint:clear': {
            const slideId = msg.payload.slideId;
            if (slideId) {
              for (let i = paintStrokes.length - 1; i >= 0; i--) {
                if (paintStrokes[i].slideId === slideId) {
                  paintStrokes.splice(i, 1);
                }
              }
            } else {
              paintStrokes.length = 0;
            }
            broadcast({
              type: 'paint:clear',
              payload: { slideId }
            });
            break;
          }

          case 'chat:send': {
            const chatMsg: ChatMessage = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              senderId: msg.payload.senderId,
              senderName: msg.payload.senderName,
              senderColor: msg.payload.senderColor,
              text: msg.payload.text,
              timestamp: Date.now(),
            };
            chatMessages.push(chatMsg);
            if (chatMessages.length > 200) {
              chatMessages.shift();
            }
            broadcast({
              type: 'chat:message',
              payload: chatMsg
            });
            break;
          }

          case 'slide:sync': {
            broadcast({
              type: 'slide:sync',
              payload: msg.payload
            }, ws);
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      const user = users.get(ws);
      if (user) {
        users.delete(ws);
        broadcast({
          type: 'user:left',
          payload: { userId: user.id }
        });
      }
    });
  });

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      activeUsers: users.size,
      strokesCount: paintStrokes.length,
      chatCount: chatMessages.length,
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} and ws://0.0.0.0:${PORT}/ws`);
  });
}

startServer();
