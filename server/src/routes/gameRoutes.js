import { Router } from 'express';
import { body } from 'express-validator';
import { addGame, deleteGame, getCatalog, listGames, reorderGames, updateGame } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = Router();
router.use(protect);
router.get('/catalog', getCatalog);
router.get('/', listGames);
router.post('/', [
  body('gameKey').trim().notEmpty().withMessage('Vui lòng chọn game'),
  body('hoursPlayed').optional().isFloat({ min: 0, max: 100000 }).withMessage('Số giờ chơi không hợp lệ'),
], validate, addGame);
router.put('/reorder', reorderGames);
router.put('/:id', [
  body('hoursPlayed').optional().isFloat({ min: 0, max: 100000 }).withMessage('Số giờ chơi không hợp lệ'),
], validate, updateGame);
router.delete('/:id', deleteGame);
export default router;
