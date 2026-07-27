import { Router } from 'express';
import { body, query } from 'express-validator';
import { listUsers, updateUserAccess } from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();
router.use(protect, requireAdmin);
router.get(
  '/users',
  [query('q').optional().trim().isLength({ max: 100 }), query('page').optional().isInt({ min: 1 })],
  validate,
  listUsers,
);
router.put(
  '/users/:id/access',
  [
    body('roles').isArray({ min: 1, max: USER_ROLES.length }),
    body('roles.*').isIn(USER_ROLES),
    body('titles').isArray({ max: 10 }),
    body('titles.*').trim().isLength({ min: 1, max: 40 }),
  ],
  validate,
  updateUserAccess,
);

export default router;
