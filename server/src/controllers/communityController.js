import Friendship from '../models/Friendship.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/http.js';

export const listFriends = asyncHandler(async (req, res) => {
  const friendships = await Friendship.find({
    $or: [{ requester: req.user.id }, { recipient: req.user.id }],
  }).populate('requester recipient', 'fullName username').sort('-createdAt');
  res.json({ friendships });
});

export const requestFriend = asyncHandler(async (req, res) => {
  const recipient = await User.findOne({ username: req.body.username?.toLowerCase(), isActive: true });
  if (!recipient || recipient.id === req.user.id) throw new ApiError(404, 'Không tìm thấy người dùng phù hợp');
  const existing = await Friendship.findOne({
    $or: [
      { requester: req.user.id, recipient: recipient.id },
      { requester: recipient.id, recipient: req.user.id },
    ],
  });
  if (existing) throw new ApiError(409, 'Lời mời hoặc kết bạn đã tồn tại');
  const friendship = await Friendship.create({ requester: req.user.id, recipient: recipient.id });
  res.status(201).json({ friendship });
});

export const respondFriend = asyncHandler(async (req, res) => {
  const friendship = await Friendship.findOne({ _id: req.params.id, recipient: req.user.id });
  if (!friendship) throw new ApiError(404, 'Không tìm thấy lời mời');
  if (req.body.accept) {
    friendship.status = 'accepted';
    await friendship.save();
  } else await friendship.deleteOne();
  res.json({ friendship: req.body.accept ? friendship : null });
});

export const removeFriend = asyncHandler(async (req, res) => {
  await Friendship.deleteOne({
    _id: req.params.id,
    $or: [{ requester: req.user.id }, { recipient: req.user.id }],
  });
  res.status(204).end();
});

export const getWorldMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ channel: 'world' }).populate('userId', 'fullName username').sort('-createdAt').limit(50);
  res.json({ messages: messages.reverse() });
});
