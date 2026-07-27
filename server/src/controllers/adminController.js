import mongoose from 'mongoose';
import AdminAuditLog from '../models/AdminAuditLog.js';
import User, { USER_ROLES } from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/http.js';

function normalizedRoles(user) {
  return [...new Set(['user', ...(user.roles || []), ...(user.role === 'admin' ? ['admin'] : [])])].filter((role) =>
    USER_ROLES.includes(role),
  );
}

function serializeUser(user) {
  return {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    roles: normalizedRoles(user),
    titles: user.titles || [],
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = 20;
  const query = String(req.query.q || '').trim();
  const filter = query
    ? {
        $or: [
          { fullName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
          { username: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
          { email: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        ],
      }
    : {};
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({
    users: users.map(serializeUser),
    pagination: { page, pages: Math.max(Math.ceil(total / limit), 1), total },
    availableRoles: USER_ROLES,
  });
});

export const updateUserAccess = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, 'Không tìm thấy người dùng');
  const target = await User.findById(req.params.id).select('+tokenVersion');
  if (!target) throw new ApiError(404, 'Không tìm thấy người dùng');

  const nextRoles = [...new Set(['user', ...req.body.roles])].filter((role) => USER_ROLES.includes(role));
  const nextTitles = [...new Set(req.body.titles.map((title) => title.trim()).filter(Boolean))];
  const previousRoles = normalizedRoles(target);
  const previousTitles = [...(target.titles || [])];
  const rolesChanged =
    previousRoles.length !== nextRoles.length || previousRoles.some((role) => !nextRoles.includes(role));

  if (target.id === req.user.id && rolesChanged) {
    throw new ApiError(422, 'Bạn không thể thay đổi role của chính mình');
  }
  if (previousRoles.includes('admin') && !nextRoles.includes('admin')) {
    const adminCount = await User.countDocuments({
      isActive: true,
      $or: [{ role: 'admin' }, { roles: 'admin' }],
    });
    if (adminCount <= 1) throw new ApiError(409, 'Không thể gỡ admin cuối cùng của hệ thống');
  }

  target.roles = nextRoles;
  target.role = nextRoles.includes('admin') ? 'admin' : 'user';
  target.titles = nextTitles;
  if (rolesChanged) target.tokenVersion += 1;
  await target.save();
  await AdminAuditLog.create({
    actorId: req.user.id,
    targetId: target.id,
    action: 'access_updated',
    previousRoles,
    nextRoles,
    previousTitles,
    nextTitles,
  });
  res.json({
    user: serializeUser(target),
    message: rolesChanged ? 'Đã cập nhật quyền; người dùng cần đăng nhập lại' : 'Đã cập nhật danh hiệu',
  });
});
