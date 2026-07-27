import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  changePassword,
  deleteAccount,
  login,
  logout,
  me,
  register,
  updateAccount,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = Router();
const passwordRule = body('password').isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự');
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.post(
  '/register',
  authLimiter,
  [
    body('fullName').trim().isLength({ min: 2, max: 80 }).withMessage('Họ tên từ 2–80 ký tự'),
    body('username')
      .trim()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username chỉ gồm chữ, số và dấu gạch dưới'),
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    passwordRule,
  ],
  validate,
  register,
);
router.post(
  '/login',
  authLimiter,
  [body('identity').trim().notEmpty().withMessage('Vui lòng nhập email hoặc username'), passwordRule],
  validate,
  login,
);
router.get('/me', protect, me);
router.post('/logout', protect, logout);
router.put(
  '/account',
  protect,
  [
    body('fullName').optional().trim().isLength({ min: 2, max: 80 }),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  validate,
  updateAccount,
);
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Mật khẩu mới phải có ít nhất 8 ký tự'),
  ],
  validate,
  changePassword,
);
router.delete('/account', protect, deleteAccount);
export default router;
