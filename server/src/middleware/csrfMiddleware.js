import { getClientOrigins } from '../config/env.js';
import { ApiError } from '../utils/http.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export function verifyCookieOrigin(req, res, next) {
  if (safeMethods.has(req.method) || !req.cookies.profile_token || req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  const origin = req.get('origin');
  if (!origin || !getClientOrigins().includes(origin)) {
    throw new ApiError(403, 'Nguồn yêu cầu không được phép');
  }
  next();
}
