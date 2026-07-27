import crypto from 'node:crypto';
import Friendship from '../models/Friendship.js';
import User from '../models/User.js';
import WatchHistory from '../models/WatchHistory.js';
import WatchInvite from '../models/WatchInvite.js';
import WatchRoom from '../models/WatchRoom.js';
import { ApiError, asyncHandler } from '../utils/http.js';

const ROOM_LIFETIME_MS = 24 * 60 * 60 * 1000;
const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function normalizeRoomId(value) {
  return String(value || '')
    .trim()
    .toUpperCase();
}

function generateRoomId() {
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, (byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length]).join('');
}

async function createUniqueRoomId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomId = generateRoomId();
    if (!(await WatchRoom.exists({ roomId }))) return roomId;
  }
  throw new ApiError(503, 'Không thể tạo mã phòng lúc này, vui lòng thử lại');
}

function serializeVideo(item) {
  return {
    videoId: item.videoId,
    title: item.title,
    thumbnail: item.thumbnail,
    channelTitle: item.channelTitle,
    watchCount: item.watchCount,
    watchedAt: item.watchedAt,
  };
}

async function getActiveRoom(roomId) {
  const room = await WatchRoom.findOne({ roomId: normalizeRoomId(roomId), expiresAt: { $gt: new Date() } }).populate(
    'hostId',
    'username fullName',
  );
  if (!room) throw new ApiError(404, 'Phòng không tồn tại hoặc đã hết hạn');
  return room;
}

export const createRoom = asyncHandler(async (req, res) => {
  const roomId = await createUniqueRoomId();
  const room = await WatchRoom.create({
    roomId,
    hostId: req.user.id,
    videoId: req.body.videoId || '',
    videoTitle: req.body.title || '',
    videoThumbnail: req.body.thumbnail || '',
    expiresAt: new Date(Date.now() + ROOM_LIFETIME_MS),
  });
  await room.populate('hostId', 'username fullName');
  res.status(201).json({ room });
});

export const getRoom = asyncHandler(async (req, res) => {
  res.json({ room: await getActiveRoom(req.params.roomId) });
});

export const joinRoom = asyncHandler(async (req, res) => {
  const room = await getActiveRoom(req.params.roomId);
  room.expiresAt = new Date(Date.now() + ROOM_LIFETIME_MS);
  await room.save();
  res.json({ room });
});

export const inviteFriend = asyncHandler(async (req, res) => {
  const room = await getActiveRoom(req.params.roomId);
  if (room.hostId._id.toString() !== req.user.id) throw new ApiError(403, 'Chỉ chủ phòng có thể gửi lời mời');

  const recipient = await User.findOne({ username: req.body.username.toLowerCase(), isActive: true });
  if (!recipient) throw new ApiError(404, 'Không tìm thấy người dùng');
  if (recipient.id === req.user.id) throw new ApiError(422, 'Bạn đã ở trong phòng này');

  const friendship = await Friendship.exists({
    status: 'accepted',
    $or: [
      { requester: req.user.id, recipient: recipient.id },
      { requester: recipient.id, recipient: req.user.id },
    ],
  });
  if (!friendship) throw new ApiError(403, 'Bạn chỉ có thể mời người đã kết bạn');

  const invite = await WatchInvite.findOneAndUpdate(
    { roomId: room.roomId, recipient: recipient.id },
    {
      sender: req.user.id,
      status: 'pending',
      expiresAt: room.expiresAt,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.status(201).json({ invite, message: `Đã mời @${recipient.username}` });
});

export const listInvites = asyncHandler(async (req, res) => {
  const invites = await WatchInvite.find({
    recipient: req.user.id,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  })
    .populate('sender', 'username fullName')
    .sort('-createdAt')
    .limit(30);
  res.json({ invites });
});

export const respondInvite = asyncHandler(async (req, res) => {
  const invite = await WatchInvite.findOne({
    _id: req.params.id,
    recipient: req.user.id,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });
  if (!invite) throw new ApiError(404, 'Lời mời không tồn tại hoặc đã hết hạn');
  invite.status = req.body.accept ? 'accepted' : 'declined';
  await invite.save();
  const room = req.body.accept ? await getActiveRoom(invite.roomId) : null;
  res.json({ invite, room });
});

export const recordHistory = asyncHandler(async (req, res) => {
  const history = await WatchHistory.findOneAndUpdate(
    { userId: req.user.id, videoId: req.body.videoId },
    {
      $set: {
        title: req.body.title,
        thumbnail: req.body.thumbnail || '',
        channelTitle: req.body.channelTitle || '',
        watchedAt: new Date(),
      },
      $inc: { watchCount: 1 },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.status(201).json({ history });
});

export const listHistory = asyncHandler(async (req, res) => {
  const history = await WatchHistory.find({ userId: req.user.id }).sort('-watchedAt').limit(30);
  res.json({ history: history.map(serializeVideo) });
});

export const searchVideos = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  const history = await WatchHistory.find({ userId: req.user.id }).sort('-watchCount -watchedAt').limit(12);

  if (!query || !process.env.YOUTUBE_API_KEY?.trim()) {
    return res.json({
      videos: history.map(serializeVideo),
      source: 'history',
      youtubeSearchConfigured: Boolean(process.env.YOUTUBE_API_KEY?.trim()),
    });
  }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '12',
    safeSearch: 'moderate',
    q: query,
    key: process.env.YOUTUBE_API_KEY.trim(),
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new ApiError(502, 'YouTube Search đang tạm thời không khả dụng');
  const data = await response.json();
  const videos = (data.items || []).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
    channelTitle: item.snippet.channelTitle,
  }));
  res.json({ videos, source: 'youtube', youtubeSearchConfigured: true });
});
