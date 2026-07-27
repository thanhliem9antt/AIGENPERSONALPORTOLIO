import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import User from './models/User.js';
import Message from './models/Message.js';
import WatchRoom from './models/WatchRoom.js';
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
    const cookies = Object.fromEntries(
      (socket.handshake.headers.cookie || '')
        .split(';')
        .filter(Boolean)
        .map((item) => {
          const [key, ...value] = item.trim().split('=');
          return [key, decodeURIComponent(value.join('='))];
        }),
    );
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
  const emitWatchParticipants = (roomId) => {
    if (!roomId) return;
    const roomName = `watch:${roomId}`;
    const memberIds = io.sockets.adapter.rooms.get(roomName) || new Set();
    const participants = [...memberIds]
      .map((id) => io.sockets.sockets.get(id))
      .filter(Boolean)
      .map((member) => ({
        id: member.id,
        userId: member.user.id,
        username: member.user.username,
        fullName: member.user.fullName,
        voiceReady: Boolean(member.watchVoiceReady),
        muted: Boolean(member.watchMuted),
      }));
    io.to(roomName).emit('watch:participants', participants);
  };

  socket.on('disconnect', () => {
    const remaining = (activeConnections.get(userId) || 1) - 1;
    if (remaining > 0) activeConnections.set(userId, remaining);
    else activeConnections.delete(userId);
    emitWatchParticipants(socket.watchRoomId);
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
      const clean = String(content || '')
        .trim()
        .slice(0, 500);
      if (!clean) return;
      const message = await Message.create({ userId: socket.user.id, content: clean });
      const payload = {
        ...message.toObject(),
        userId: { _id: socket.user.id, fullName: socket.user.fullName, username: socket.user.username },
      };
      io.to('world').emit('world:message', payload);
      acknowledge?.({ ok: true });
    } catch {
      acknowledge?.({ ok: false });
    }
  });

  socket.on('watch:join', async (rawRoomId, acknowledge) => {
    try {
      const roomId = String(rawRoomId || '')
        .trim()
        .toUpperCase();
      if (!/^[A-HJ-NP-Z2-9]{8}$/.test(roomId)) throw new Error('invalid_room');
      const room = await WatchRoom.findOne({ roomId, expiresAt: { $gt: new Date() } });
      if (!room) throw new Error('room_not_found');

      if (socket.watchRoomId) socket.leave(`watch:${socket.watchRoomId}`);
      socket.watchRoomId = roomId;
      socket.watchHostId = room.hostId.toString();
      socket.watchVoiceReady = false;
      socket.watchMuted = false;
      socket.join(`watch:${roomId}`);
      emitWatchParticipants(roomId);
      acknowledge?.({ ok: true });
    } catch (error) {
      acknowledge?.({ ok: false, error: error.message });
    }
  });

  socket.on('watch:sync', async (payload, acknowledge) => {
    try {
      if (!socket.watchRoomId || socket.watchHostId !== socket.user.id) throw new Error('forbidden');
      const videoId = String(payload?.videoId || '').trim();
      const currentTime = Number(payload?.currentTime);
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId) || !Number.isFinite(currentTime) || currentTime < 0) {
        throw new Error('invalid_state');
      }
      const state = {
        videoId,
        videoTitle: String(payload?.title || '')
          .trim()
          .slice(0, 200),
        videoThumbnail: String(payload?.thumbnail || '')
          .trim()
          .slice(0, 1000),
        currentTime: Math.min(currentTime, 86_400),
        isPlaying: Boolean(payload?.isPlaying),
        lastSyncedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      const updated = await WatchRoom.updateOne(
        { roomId: socket.watchRoomId, hostId: socket.user.id, expiresAt: { $gt: new Date() } },
        state,
      );
      if (!updated.matchedCount) throw new Error('room_not_found');
      socket.to(`watch:${socket.watchRoomId}`).emit('watch:sync', state);
      acknowledge?.({ ok: true });
    } catch (error) {
      acknowledge?.({ ok: false, error: error.message });
    }
  });

  socket.on('watch:voice-state', (payload) => {
    if (!socket.watchRoomId) return;
    socket.watchVoiceReady = Boolean(payload?.enabled);
    socket.watchMuted = Boolean(payload?.muted);
    emitWatchParticipants(socket.watchRoomId);
  });

  socket.on('watch:signal', (payload, acknowledge) => {
    try {
      const target = io.sockets.sockets.get(String(payload?.targetId || ''));
      const signal = payload?.signal;
      if (
        !socket.watchRoomId ||
        !target ||
        target.watchRoomId !== socket.watchRoomId ||
        !signal ||
        !['offer', 'answer', 'ice'].includes(signal.type) ||
        JSON.stringify(signal).length > 20_000
      ) {
        throw new Error('invalid_signal');
      }
      target.emit('watch:signal', { senderId: socket.id, signal });
      acknowledge?.({ ok: true });
    } catch (error) {
      acknowledge?.({ ok: false, error: error.message });
    }
  });
});

function listen() {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port);
  });
}

connectDatabase()
  .then(listen)
  .then(() => console.log(`API running at http://localhost:${port}`))
  .catch(async (error) => {
    if (error.code === 'EADDRINUSE') {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(2000) });
        if (response.ok) {
          console.log(`API is already running at http://localhost:${port}. Reuse the existing server.`);
          await mongoose.disconnect();
          return;
        }
      } catch {
        // The port belongs to another process, so show the actionable message below.
      }
      console.error(
        `Port ${port} is already in use. Stop the process using it or set a different PORT in server/.env.`,
      );
    } else {
      console.error(error.message);
    }
    await mongoose.disconnect().catch(() => {});
    process.exitCode = 1;
  });
