import crypto from 'crypto';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import SocialLink from '../models/SocialLink.js';
import Project from '../models/Project.js';
import Appearance from '../models/Appearance.js';
import ProfileView from '../models/ProfileView.js';
import PlayedGame from '../models/PlayedGame.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { destroyAsset, uploadBuffer } from '../services/cloudinaryService.js';

export const getMine = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user.id });
  res.json({ profile });
});

export const updateMine = asyncHandler(async (req, res) => {
  const allowed = [
    'displayName',
    'headline',
    'bio',
    'location',
    'contactEmail',
    'phone',
    'website',
    'availabilityStatus',
    'skills',
    'isPublished',
  ];
  const updates = Object.fromEntries(
    allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]),
  );
  if (req.body.username) {
    const username = req.body.username.toLowerCase();
    if (!/^[a-z0-9_]+$/.test(username)) throw new ApiError(422, 'Username không hợp lệ');
    req.user.username = username;
    await req.user.save();
  }
  const profile = await Profile.findOneAndUpdate({ userId: req.user.id }, updates, {
    new: true,
    runValidators: true,
    upsert: true,
  });
  res.json({ profile, user: req.user });
});

async function replaceImage(req, field) {
  if (!req.file) throw new ApiError(422, 'Vui lòng chọn ảnh');
  const profile = await Profile.findOne({ userId: req.user.id });
  const result = await uploadBuffer(req.file.buffer, `personal-profile/${req.user.id}/${field}`);
  const publicIdField = `${field}PublicId`;
  const urlField = `${field}Url`;
  await destroyAsset(profile[publicIdField]);
  profile[urlField] = result.secure_url;
  profile[publicIdField] = result.public_id;
  await profile.save();
  return profile;
}

export const uploadAvatar = asyncHandler(async (req, res) => res.json({ profile: await replaceImage(req, 'avatar') }));
export const uploadBackground = asyncHandler(async (req, res) =>
  res.json({ profile: await replaceImage(req, 'background') }),
);

function removeImage(field) {
  return asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user.id });
    await destroyAsset(profile[`${field}PublicId`]);
    profile[`${field}Url`] = undefined;
    profile[`${field}PublicId`] = undefined;
    await profile.save();
    res.status(204).end();
  });
}
export const deleteAvatar = removeImage('avatar');
export const deleteBackground = removeImage('background');

export const getPublic = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase(), isActive: true });
  if (!user) throw new ApiError(404, 'Không tìm thấy profile');
  const [profile, socialLinks, projects, appearance, games] = await Promise.all([
    Profile.findOne({ userId: user.id, isPublished: true }),
    SocialLink.find({ userId: user.id, isVisible: true }).sort('order'),
    Project.find({ userId: user.id, isVisible: true }).sort('order'),
    Appearance.findOne({ userId: user.id }),
    PlayedGame.find({ userId: user.id, isVisible: true }).sort('order createdAt'),
  ]);
  if (!profile) throw new ApiError(404, 'Profile chưa được công khai');
  res.json({
    user: {
      fullName: user.fullName,
      username: user.username,
      roles: [...new Set(['user', ...(user.roles || []), ...(user.role === 'admin' ? ['admin'] : [])])],
      titles: user.titles || [],
    },
    profile,
    socialLinks,
    projects,
    appearance,
    games,
  });
});

export const addView = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) throw new ApiError(404, 'Không tìm thấy profile');
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
  const visitorIpHash = crypto
    .createHmac('sha256', process.env.IP_HASH_SECRET || process.env.JWT_SECRET)
    .update(rawIp)
    .digest('hex');
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const viewed = await ProfileView.exists({ profileUserId: user.id, visitorIpHash, viewedAt: { $gte: since } });
  if (!viewed) {
    await Promise.all([
      ProfileView.create({ profileUserId: user.id, visitorIpHash, userAgent: req.get('user-agent') }),
      Profile.updateOne({ userId: user.id }, { $inc: { profileViews: 1 } }),
    ]);
  }
  res.status(204).end();
});
