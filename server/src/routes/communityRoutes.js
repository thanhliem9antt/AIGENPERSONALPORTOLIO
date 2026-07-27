import { Router } from 'express';
import {
  getWorldMessages,
  listFriends,
  removeFriend,
  requestFriend,
  respondFriend,
} from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.get('/friends', listFriends);
router.post('/friends', requestFriend);
router.put('/friends/:id', respondFriend);
router.delete('/friends/:id', removeFriend);
router.get('/messages/world', getWorldMessages);
export default router;
