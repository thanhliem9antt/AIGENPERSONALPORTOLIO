import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { appearanceRouter, projectRouter, socialRouter } from './routes/resourceRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { getClientOrigins } from './config/env.js';
import { verifyCookieOrigin } from './middleware/csrfMiddleware.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: getClientOrigins(), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(verifyCookieOrigin);
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
  }),
);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/social-links', socialRouter);
app.use('/api/projects', projectRouter);
app.use('/api/appearance', appearanceRouter);
app.use('/api/community', communityRoutes);
app.use('/api/games', gameRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
