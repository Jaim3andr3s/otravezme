import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './lib/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import booksRoutes from './routes/books.routes.js';
import eventsRoutes from './routes/events.routes.js';
import readingPlansRoutes from './routes/readingPlans.routes.js';
import profileRoutes from './routes/profile.routes.js';
import achievementsRoutes from './routes/achievements.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import publicationsRoutes from './routes/publications.routes.js';
import challengesRoutes from './routes/challenges.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import forumRoutes from './routes/forum.routes.js';
import activitiesRoutes from './routes/activities.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = new Set([
  'https://biblioyenecomunity.netlify.app',
  'https://bibliosuenos.netlify.app',
  'http://localhost:5173',
  'capacitor://localhost',
  'https://localhost',
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

const NGROK_HOST_PATTERN = /^https:\/\/[a-z0-9-]+\.(ngrok-free\.app|ngrok\.app|ngrok\.io)$/i;

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || NGROK_HOST_PATTERN.test(origin)) {
        return callback(null, true);
      }
      callback(new Error('Origen no permitido por CORS.'));
    },
  })
);
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/reading-plans', readingPlansRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/activities', activitiesRoutes);

app.use((req, res) => res.status(404).json({ message: 'Ruta de API no encontrada.' }));
app.use(errorHandler);

export default app;