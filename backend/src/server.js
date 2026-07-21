import 'dotenv/config';
import app from './app.js';
import prisma from './lib/prisma.js';
import { validateEnv } from './config/env.js';

validateEnv();

const port = process.env.PORT || 4000;

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida.');
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`📚 API de BiblioSueños escuchando en http://localhost:${port}`);
  });
}

start();
