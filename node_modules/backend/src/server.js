import 'dotenv/config';
import app from './app.js';
import { validateEnv } from './config/env.js';

validateEnv();

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API de BiblioSueños escuchando en http://localhost:${port}`);
});
