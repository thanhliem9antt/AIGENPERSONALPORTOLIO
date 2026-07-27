import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, ver: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export function setAuthCookie(res, token, remember = true) {
  res.cookie('profile_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : undefined,
    path: '/',
  });
}
