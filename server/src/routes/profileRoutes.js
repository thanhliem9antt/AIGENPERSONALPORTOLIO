import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { imageUpload } from '../middleware/uploadMiddleware.js';
import { addView, deleteAvatar, deleteBackground, getMine, getPublic, updateMine, uploadAvatar, uploadBackground } from '../controllers/profileController.js';

const router = Router();
router.get('/me', protect, getMine);
router.put('/me', protect, updateMine);
router.post('/avatar', protect, imageUpload.single('image'), uploadAvatar);
router.delete('/avatar', protect, deleteAvatar);
router.post('/background', protect, imageUpload.single('image'), uploadBackground);
router.delete('/background', protect, deleteBackground);
router.get('/public/:username', getPublic);
router.post('/public/:username/view', addView);
export default router;
