import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { audioUpload, imageUpload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { deleteMusic, getAppearance, projectController, socialController, updateAppearance, uploadMusic, uploadThumbnail } from '../controllers/resourceControllers.js';

export const socialRouter = Router();
socialRouter.use(protect);
socialRouter.get('/', socialController.list);
const socialRules = [
  body('platform').trim().isLength({ min: 1, max: 40 }).withMessage('Nền tảng không hợp lệ'),
  body('url').custom((value) => /^(https?:\/\/|mailto:)[^\s]+$/i.test(value)).withMessage('URL không hợp lệ'),
];
socialRouter.post('/', socialRules, validate, socialController.create);
socialRouter.put('/reorder', socialController.reorder);
socialRouter.put('/:id', [
  body('url').optional().custom((value) => /^(https?:\/\/|mailto:)[^\s]+$/i.test(value)).withMessage('URL không hợp lệ'),
], validate, socialController.update);
socialRouter.delete('/:id', socialController.remove);

export const projectRouter = Router();
projectRouter.use(protect);
projectRouter.get('/', projectController.list);
const projectRules = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Tên dự án không hợp lệ'),
  body('demoUrl').optional({ values: 'falsy' }).isURL().withMessage('Link demo không hợp lệ'),
  body('githubUrl').optional({ values: 'falsy' }).isURL().withMessage('Link GitHub không hợp lệ'),
];
projectRouter.post('/', projectRules, validate, projectController.create);
projectRouter.put('/reorder', projectController.reorder);
projectRouter.post('/:id/thumbnail', imageUpload.single('image'), uploadThumbnail);
projectRouter.put('/:id', [
  body('demoUrl').optional({ values: 'falsy' }).isURL().withMessage('Link demo không hợp lệ'),
  body('githubUrl').optional({ values: 'falsy' }).isURL().withMessage('Link GitHub không hợp lệ'),
], validate, projectController.update);
projectRouter.delete('/:id', projectController.remove);

export const appearanceRouter = Router();
appearanceRouter.use(protect);
appearanceRouter.get('/', getAppearance);
appearanceRouter.put('/', updateAppearance);
appearanceRouter.post('/music', audioUpload.single('music'), uploadMusic);
appearanceRouter.delete('/music', deleteMusic);
