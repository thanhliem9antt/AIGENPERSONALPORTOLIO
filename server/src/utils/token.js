import jwt from 'jsonwebtoken';

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export function setAuthCookie(res, token, remember = true) {
  res.cookie('profile_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : undefined,
    path: '/',
  });
}
