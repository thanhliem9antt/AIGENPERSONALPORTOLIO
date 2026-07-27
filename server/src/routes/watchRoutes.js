import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createRoom,
  getRoom,
  inviteFriend,
  joinRoom,
  listHistory,
  listInvites,
  recordHistory,
  respondInvite,
  searchVideos,
} from '../controllers/watchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = Router();
const roomIdRule = param('roomId')
  .trim()
  .matches(/^[A-HJ-NP-Z2-9]{8}$/i)
  .withMessage('Mã phòng không hợp lệ');

router.use(protect);
router.post(
  '/rooms',
  [
    body('videoId').optional().trim().isLength({ max: 32 }),
    body('title').optional().trim().isLength({ max: 200 }),
    body('thumbnail').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  createRoom,
);
router.get('/rooms/:roomId', roomIdRule, validate, getRoom);
router.post('/rooms/:roomId/join', roomIdRule, validate, joinRoom);
router.post(
  '/rooms/:roomId/invites',
  [
    roomIdRule,
    body('username')
      .trim()
      .matches(/^[a-z0-9_]+$/i)
      .isLength({ min: 3, max: 30 }),
  ],
  validate,
  inviteFriend,
);
router.get('/invites', listInvites);
router.put('/invites/:id', [body('accept').isBoolean()], validate, respondInvite);
router.get('/history', listHistory);
router.post(
  '/history',
  [
    body('videoId').trim().notEmpty().isLength({ max: 32 }),
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('thumbnail').optional().trim().isLength({ max: 1000 }),
    body('channelTitle').optional().trim().isLength({ max: 120 }),
  ],
  validate,
  recordHistory,
);
router.get('/search', [query('q').optional().trim().isLength({ max: 100 })], validate, searchVideos);

export default router;
