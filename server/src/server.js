import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import User from './models/User.js';
import Message from './models/Message.js';
import { assertEnvironment, getClientOrigins } from './config/env.js';

assertEnvironment();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const activeConnections = new Map();
const io = new Server(server, {
  cors: { origin: getClientOrigins(), credentials: true },
});

io.use(async (socket, next) => {
  try {
    const cookies = Object.fromEntries((socket.handshake.headers.cookie || '').split(';').filter(Boolean).map((item) => {
      const [key, ...value] = item.trim().split('=');
      return [key, decodeURIComponent(value.join('='))];
    }));
    const token = socket.handshake.auth.token || cookies.profile_token;
    if (!token) return next(new Error('unauthorized'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('+tokenVersion');
    if (!user?.isActive || (payload.ver || 0) !== user.tokenVersion) return next(new Error('unauthorized'));
    if ((activeConnections.get(user.id) || 0) >= 5) return next(new Error('too_many_connections'));
    socket.user = user;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  activeConnections.set(userId, (activeConnections.get(userId) || 0) + 1);
  socket.on('disconnect', () => {
    const remaining = (activeConnections.get(userId) || 1) - 1;
    if (remaining > 0) activeConnections.set(userId, remaining);
    else activeConnections.delete(userId);
  });

  socket.join('world');
  const messageTimes = [];
  socket.on('world:message', async (content, acknowledge) => {
    try {
      const now = Date.now();
      while (messageTimes.length && messageTimes[0] <= now - 10_000) messageTimes.shift();
      if (messageTimes.length >= 8) {
        acknowledge?.({ ok: false, error: 'rate_limited' });
        return;
      }
      messageTimes.push(now);
      const clean = String(content || '').trim().slice(0, 500);
      if (!clean) return;
      const message = await Message.create({ userId: socket.user.id, content: clean });
      const payload = { ...message.toObject(), userId: { _id: socket.user.id, fullName: socket.user.fullName, username: socket.user.username } };
      io.to('world').emit('world:message', payload);
      acknowledge?.({ ok: true });
    } catch {
      acknowledge?.({ ok: false });
    }
  });
});

connectDatabase()
  .then(() => server.listen(port, () => console.log(`API running at http://localhost:${port}`)))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
