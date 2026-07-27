import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Appearance from '../models/Appearance.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { setAuthCookie, signToken } from '../utils/token.js';

const sendSession = (res, user, remember = true, status = 200) => {
  setAuthCookie(res, signToken(user), remember);
  res.status(status).json({ user });
};

export const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;
  const normalizedUsername = username.toLowerCase();
  const exists = await User.findOne({ $or: [{ username: normalizedUsername }, { email: email.toLowerCase() }] });
  if (exists)
    throw new ApiError(
      409,
      exists.username === normalizedUsername ? 'Username đã được sử dụng' : 'Email đã được sử dụng',
    );
  const referralUsername = req.body.ref?.toLowerCase();
  const referrer = referralUsername
    ? await User.findOne({ username: referralUsername, isActive: true }).select('_id')
    : null;
  const user = await User.create({
    fullName,
    username: normalizedUsername,
    email,
    password,
    referredBy: referrer?._id || null,
  });
  try {
    await Promise.all([
      Profile.create({ userId: user.id, displayName: fullName }),
      Appearance.create({ userId: user.id }),
    ]);
  } catch (error) {
    await Promise.allSettled([
      Profile.deleteMany({ userId: user.id }),
      Appearance.deleteMany({ userId: user.id }),
      User.deleteOne({ _id: user.id }),
    ]);
    throw error;
  }
  if (referrer) await User.updateOne({ _id: referrer._id }, { $inc: { referralCount: 1 } });
  sendSession(res, user, true, 201);
});

export const login = asyncHandler(async (req, res) => {
  const identity = req.body.identity.toLowerCase();
  const user = await User.findOne({ $or: [{ email: identity }, { username: identity }] }).select(
    '+password +tokenVersion',
  );
  if (!user || !(await user.comparePassword(req.body.password)))
    throw new ApiError(401, 'Thông tin đăng nhập không chính xác');
  sendSession(res, user, req.body.remember !== false);
});

export const me = asyncHandler(async (req, res) => res.json({ user: req.user }));

export const logout = (req, res) => {
  res.clearCookie('profile_token', { path: '/' });
  res.status(204).end();
};

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password +tokenVersion');
  if (!(await user.comparePassword(req.body.currentPassword))) throw new ApiError(400, 'Mật khẩu hiện tại không đúng');
  user.password = req.body.newPassword;
  user.tokenVersion += 1;
  await user.save();
  setAuthCookie(res, signToken(user), true);
  res.json({ message: 'Đổi mật khẩu thành công' });
});

export const updateAccount = asyncHandler(async (req, res) => {
  const allowed = ['fullName', 'email'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  });
  await req.user.save();
  res.json({ user: req.user });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(req.body.password || ''))) throw new ApiError(400, 'Mật khẩu không đúng');
  user.isActive = false;
  await user.save();
  res.clearCookie('profile_token', { path: '/' });
  res.status(204).end();
});
