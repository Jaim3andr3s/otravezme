import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
import { UPLOADS_DIR } from './middleware/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Dominios de túneles ngrok (cambian en cada sesión), para poder probar la
// app completa (frontend + backend) expuesta públicamente sin tener que
// actualizar CORS_ORIGINS cada vez.
const NGROK_HOST_PATTERN = /^https:\/\/[a-z0-9-]+\.(ngrok-free\.app|ngrok\.app|ngrok\.io)$/i;

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || NGROK_HOST_PATTERN.test(origin)) {
        return callback(null, true);
      }
      callback(new Error('Origen no permitido por CORS.'));
    },
  })
);
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
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