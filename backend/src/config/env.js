const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET'];
const OPTIONAL_VARS = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'GOOGLE_CLIENT_ID'];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  }

  for (const key of OPTIONAL_VARS) {
    if (!process.env[key]) {
      console.warn(`⚠️  Variable opcional ${key} no configurada.`);
    }
  }
}
