import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/http.js';

export const protect = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  const token = req.cookies.profile_token || bearer;
  if (!token) throw new ApiError(401, 'Vui lòng đăng nhập');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user?.isActive) throw new Error();
    req.user = user;
    next();
  } catch {
    throw new ApiError(401, 'Phiên đăng nhập đã hết hạn');
  }
});
