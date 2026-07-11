import { v2 as cloudinary } from 'cloudinary';

// Credenciales gratuitas de https://cloudinary.com/users/register/free
// (plan gratuito: 25GB de almacenamiento y de transferencia al mes, de
// sobra para una biblioteca escolar). Sin esto la subida de archivos no
// funciona ni en local ni en producción — hay que crear la cuenta y pegar
// las 3 variables en el .env.
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn(
    '⚠️  Faltan variables de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) en el .env. La subida de archivos (fotos, PDF, Word) no va a funcionar hasta que las agregues.'
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
