// netlify/functions/utils.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Las funciones serverless se ejecutan dentro de /netlify/functions. 
// Para acceder a los archivos JSON que están en la raíz del proyecto (un nivel arriba), ajustamos la ruta.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ajuste de las rutas: ../ sube un nivel, apuntando a la raíz del proyecto.
export const DB_PATH_CONTENT = path.join(__dirname, '..', '..', 'content.json');
export const DB_PATH_EVENTS = path.join(__dirname, '..', '..', 'events.json');
export const DB_PATH_PROFILES = path.join(__dirname, '..', '..', 'profiles.json');
// Asumiendo que también existe un readingPlan.json en la raíz
export const DB_PATH_READING_PLAN = path.join(__dirname, '..', '..', 'readingPlan.json'); 

// La clave secreta ahora se toma de las variables de entorno de Netlify
export const SECRET_ADMIN_KEY = process.env.SECRET_ADMIN_KEY || "colombia2025_fallback"; 
// **IMPORTANTE**: En Netlify, debes configurar la variable SECRET_ADMIN_KEY. El fallback es solo para desarrollo.


/**
 * Lee y parsea los datos de un archivo JSON, con manejo de errores.
 * @param {string} filePath La ruta completa al archivo JSON.
 * @returns {Array<any>|Object} El contenido parseado, o un array/objeto vacío si hay un error.
 */
export const readData = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Archivo no encontrado: ${filePath}. Inicializando con datos vacíos.`);
            // Si el archivo no existe o está vacío, devuelve una estructura por defecto
            if (filePath.includes('readingPlan')) return []; 
            if (filePath.includes('events')) return [];
            return [];
        }
        console.error(`Error leyendo/parseando ${filePath}:`, error.message);
        return []; // Devuelve un array vacío en caso de error de parseo.
    }
};

/**
 * Escribe datos en un archivo JSON, sobrescribiendo el contenido existente.
 * @param {string} filePath La ruta completa al archivo JSON.
 * @param {Array<any>|Object} data Los datos a escribir.
 */
export const writeData = (filePath, data) => {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonString, 'utf8');
    } catch (error) {
        console.error(`Error escribiendo en ${filePath}:`, error.message);
    }
};

/**
 * Middleware para autenticación administrativa.
 */
export const adminAuth = (req, res, next) => {
    const adminKey = req.header('x-admin-key');
    if (adminKey && adminKey === SECRET_ADMIN_KEY) {
        next();
    } else {
        res.status(401).json({ message: 'Acceso no autorizado. Clave de administrador requerida.' });
    }
};

// Se asume que todo el código de utilidades de tu server.js (como las funciones de búsqueda y auxiliares)
// se movería aquí o se importaría directamente en api.js.