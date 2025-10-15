// --- IMPORTACIONES ---
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path'; 



// --- CONFIGURACIÓN PARA ESM --- 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- CONFIGURACIÓN DEL SERVIDOR ---
const app = express();
const PORT = 4000;
const DB_PATH_CONTENT = path.join(__dirname, 'content.json');
const DB_PATH_EVENTS = path.join(__dirname, 'events.json');
const DB_PATH_PROFILES = path.join(__dirname, 'profiles.json');
const DB_PATH_READING_PLAN = path.join(__dirname, 'readingPlan.json'); // Usamos una ruta dedicada

// --- CLAVE SECRETA DE PUBLICACIÓN Y ADMINISTRACIÓN ---
// Esta clave debe ser enviada en la cabecera 'x-admin-key' para las operaciones de escritura administrativas.
const SECRET_ADMIN_KEY = "colombia2025"; 

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(bodyParser.json());

// --- FUNCIONES DE LECTURA/ESCRITURA DE DATOS (Más robustas) ---

/**
 * Lee y parsea los datos de un archivo JSON, con manejo de errores.
 * @param {string} filePath - Ruta al archivo JSON.
 * @returns {Array<any>} Los datos parseados o un array vacío en caso de error.
 */
const readData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`[WARN] Archivo no encontrado: ${filePath}. Retornando array vacío.`);
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        // Asegurarse de que el parseo sea robusto
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed]; 
    } catch (error) {
        console.error(`[ERROR] Falló la lectura o el parseo de ${filePath}:`, error.message);
        return []; 
    }
};

/**
 * Escribe datos en un archivo JSON, con manejo de errores.
 * @param {string} filePath - Ruta al archivo JSON.
 * @param {Array<any>} data - Datos a escribir.
 */
const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`[ERROR] Falló la escritura en ${filePath}:`, error.message);
    }
};

// --- MIDDLEWARE DE AUTENTICACIÓN ADMINISTRATIVA ---
const adminAuth = (req, res, next) => {
    // La clave debe ser enviada en la cabecera 'x-admin-key'
    if (req.headers['x-admin-key'] === SECRET_ADMIN_KEY) {
        next(); // Continuar con la ruta si la clave es correcta
    } else {
        res.status(401).json({ message: 'Acceso no autorizado. Clave de administrador faltante o inválida.' });
    }
};


// ====================================================================================
// --- RUTAS PÚBLICAS: LECTURA ---
// ====================================================================================

// GET: Obtener libros (books)
app.get('/api/books', (req, res) => {
    const content = readData(DB_PATH_CONTENT);
    res.json(content);
});

// GET: Obtener eventos
app.get('/api/events', (req, res) => {
    const events = readData(DB_PATH_EVENTS);
    res.json(events);
});

// GET: Obtener plan de lectura
app.get('/api/reading-plan', (req, res) => {
    const plan = readData(DB_PATH_READING_PLAN);
    res.json(plan);
});

// GET: Obtener perfil de usuario
app.get('/api/profile/:userId', (req, res) => {
    const profiles = readData(DB_PATH_PROFILES);
    const userId = parseInt(req.params.userId);

    const profile = profiles.find(p => p.id === userId);

    if (profile) {
        res.json(profile);
    } else {
        res.status(404).json({ message: 'Perfil no encontrado.' });
    }
});


// ====================================================================================
// --- RUTAS DE ESCRITURA NO ADMIN: VOTO, PERFIL, LISTAS ---
// ====================================================================================

// POST: Simular voto o calificación
app.post('/api/books/:bookId/vote', (req, res) => {
    const content = readData(DB_PATH_CONTENT);
    const bookId = parseInt(req.params.bookId);
    const { type } = req.body; 

    const index = content.findIndex(i => i.id === bookId);

    if (index === -1) {
        return res.status(404).json({ message: 'Libro no encontrado para votar.' });
    }

    let item = content[index];
    
    // Simular un cambio en rating y reviews
    if (type === 'up') {
        item.rating = Math.min(5.0, (item.rating * item.reviews + 5) / (item.reviews + 1));
        item.reviews += 1;
    } else if (type === 'down') {
        item.rating = Math.max(1.0, (item.rating * item.reviews + 1) / (item.reviews + 1));
        item.reviews += 1;
    } else {
        return res.status(400).json({ message: 'Tipo de voto inválido. Debe ser "up" o "down".' });
    }

    item.rating = parseFloat(item.rating.toFixed(1));

    content[index] = item;
    writeData(DB_PATH_CONTENT, content);
    res.json({ message: 'Voto registrado exitosamente.', book: item });
});

// PUT: Actualizar perfil de usuario (solo campos básicos)
app.put('/api/profile/:userId', (req, res) => {
    const profiles = readData(DB_PATH_PROFILES);
    const userId = parseInt(req.params.userId);
    const { name, bio, avatar } = req.body; 

    const index = profiles.findIndex(p => p.id === userId);

    if (index === -1) {
        return res.status(404).json({ message: 'Perfil no encontrado para actualizar.' });
    }

    const profile = profiles[index];
    
    if (name) profile.name = name;
    if (bio) profile.bio = bio;
    if (avatar) profile.avatar = avatar;

    profiles[index] = profile;
    writeData(DB_PATH_PROFILES, profiles);
    res.json({ message: 'Perfil actualizado exitosamente.', profile: profile });
});

// 🆕 PUT: Actualizar lista de favoritos (espera el array completo)
app.put('/api/profile/:userId/favorites', (req, res) => {
    const profiles = readData(DB_PATH_PROFILES);
    const userId = parseInt(req.params.userId);
    const { favorites } = req.body; 
    
    if (!Array.isArray(favorites)) {
         return res.status(400).json({ message: 'La lista de favoritos debe ser un array.' });
    }

    const index = profiles.findIndex(p => p.id === userId);

    if (index === -1) {
        return res.status(404).json({ message: 'Perfil no encontrado para actualizar favoritos.' });
    }

    const profile = profiles[index];
    profile.favorites = favorites;

    profiles[index] = profile;
    writeData(DB_PATH_PROFILES, profiles);
    res.json({ message: 'Lista de favoritos actualizada.', profile: profile });
});

// 🆕 PUT: Actualizar lista de libros leídos (espera el array completo)
app.put('/api/profile/:userId/read', (req, res) => {
    const profiles = readData(DB_PATH_PROFILES);
    const userId = parseInt(req.params.userId);
    const { read } = req.body; 
    
    if (!Array.isArray(read)) {
         return res.status(400).json({ message: 'La lista de leídos debe ser un array.' });
    }

    const index = profiles.findIndex(p => p.id === userId);

    if (index === -1) {
        return res.status(404).json({ message: 'Perfil no encontrado para actualizar libros leídos.' });
    }

    const profile = profiles[index];
    profile.read = read;

    profiles[index] = profile;
    writeData(DB_PATH_PROFILES, profiles);
    res.json({ message: 'Lista de libros leídos actualizada.', profile: profile });
});


// ====================================================================================
// --- RUTAS ADMINISTRATIVAS: CREACIÓN (REQUIEREN CLAVE ADMIN) ---
// ====================================================================================

// POST: Publicar nuevo libro (Ruta administrativa)
app.post('/api/books', adminAuth, (req, res) => {
    const books = readData(DB_PATH_CONTENT);
    const newBook = req.body;

    if (!newBook.title || !newBook.author || !newBook.cover) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para el libro (title, author, cover).' });
    }

    const newId = books.length > 0 ? Math.max(...books.map(e => e.id)) + 1 : 1;
    const finalBook = { 
        id: newId, 
        status: newBook.status || "Disponible", 
        ageRange: newBook.ageRange || "General",
        rating: newBook.rating || 4.5, 
        reviews: newBook.reviews || 0, 
        isStaffPick: newBook.isStaffPick || false,
        dateAdded: new Date().toISOString(),
        readOnlineUrl: newBook.readOnlineUrl || '#',
        ...newBook 
    }; 

    books.push(finalBook);
    writeData(DB_PATH_CONTENT, books);
    res.status(201).json({ message: 'Libro publicado exitosamente.', book: finalBook });
});

// POST: Crear nuevo evento (Ruta administrativa)
app.post('/api/events', adminAuth, (req, res) => {
    const events = readData(DB_PATH_EVENTS);
    const newEvent = req.body;

    if (!newEvent.title || !newEvent.date || !newEvent.description) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para el evento (title, date, description).' });
    }

    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const finalEvent = { 
        id: newId, 
        type: newEvent.type || "General",
        ...newEvent 
    }; 

    events.push(finalEvent);
    writeData(DB_PATH_EVENTS, events);
    res.status(201).json({ message: 'Evento creado exitosamente.', event: finalEvent });
});

// POST: Publicar Plan de Lectura (Ruta administrativa)
app.post('/api/reading-plan', adminAuth, (req, res) => {
    const newPlan = req.body;

    if (!newPlan.title || !newPlan.books || newPlan.books.length === 0) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para el plan de lectura (title, books).' });
    }

    // Sobreescribe el plan existente
    const plan = [{ id: 1, ...newPlan, publishedAt: new Date().toISOString() }];
    writeData(DB_PATH_READING_PLAN, plan);
    res.status(201).json({ message: 'Plan de lectura publicado exitosamente.', plan: plan[0] });
});

// ====================================================================================
// 🆕 RUTAS ADMINISTRATIVAS: ELIMINACIÓN (REQUIEREN CLAVE ADMIN) ---
// ====================================================================================

// DELETE: Eliminar un libro
app.delete('/api/books/:bookId', adminAuth, (req, res) => {
    let books = readData(DB_PATH_CONTENT);
    const bookId = parseInt(req.params.bookId);

    const initialLength = books.length;
    books = books.filter(b => b.id !== bookId);

    if (books.length === initialLength) {
        return res.status(404).json({ message: 'Libro no encontrado para eliminar.' });
    }

    writeData(DB_PATH_CONTENT, books);
    // Usamos 200/204 para indicar éxito en la eliminación.
    res.status(200).json({ message: 'Libro eliminado exitosamente.' });
});

// DELETE: Eliminar un evento
app.delete('/api/events/:eventId', adminAuth, (req, res) => {
    let events = readData(DB_PATH_EVENTS);
    const eventId = parseInt(req.params.eventId);

    const initialLength = events.length;
    events = events.filter(e => e.id !== eventId);

    if (events.length === initialLength) {
        return res.status(404).json({ message: 'Evento no encontrado para eliminar.' });
    }

    writeData(DB_PATH_EVENTS, events);
    res.status(200).json({ message: 'Evento eliminado exitosamente.' });
});

// DELETE: Eliminar un plan de lectura (solo hay uno, lo vaciamos)
app.delete('/api/reading-plan/:planId', adminAuth, (req, res) => {
    const planId = parseInt(req.params.planId);
    let plan = readData(DB_PATH_READING_PLAN);

    // Solo eliminamos si el ID es 1 (el único que se gestiona) o si el array no está vacío.
    if (plan.length === 0 || planId !== 1) {
         return res.status(404).json({ message: 'Plan de lectura no encontrado para eliminar.' });
    }

    writeData(DB_PATH_READING_PLAN, []); // Vaciar el archivo
    res.status(200).json({ message: 'Plan de lectura eliminado exitosamente.' });
});


// ====================================================================================
// --- INICIO DEL SERVIDOR ---
// ====================================================================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express funcionando en http://localhost:${PORT}`);
});