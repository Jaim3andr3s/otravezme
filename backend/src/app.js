import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import booksRoutes from './routes/books.routes.js';
import eventsRoutes from './routes/events.routes.js';
import readingPlansRoutes from './routes/readingPlans.routes.js';
import profileRoutes from './routes/profile.routes.js';
import achievementsRoutes from './routes/achievements.routes.js';

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Origen no permitido por CORS.'));
    },
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/reading-plans', readingPlansRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/achievements', achievementsRoutes);

app.use((req, res) => res.status(404).json({ message: 'Ruta de API no encontrada.' }));
app.use(errorHandler);

export default app;
