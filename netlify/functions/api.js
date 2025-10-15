// netlify/functions/api.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import serverless from 'serverless-http'; // Módulo para envolver Express
import { 
    adminAuth, 
    readData, 
    writeData, 
    DB_PATH_CONTENT, 
    DB_PATH_EVENTS, 
    DB_PATH_PROFILES, 
    DB_PATH_READING_PLAN 
} from './utils.js'; // Importa las utilidades del archivo creado

// --- CONFIGURACIÓN DEL SERVIDOR ---
const app = express();

// --- MIDDLEWARE ---
// Netlify Functions ya maneja las cabeceras CORS en producción, pero es bueno dejarlo.
app.use(cors()); 
app.use(bodyParser.json());


// --- RUTAS DE LECTURA PÚBLICA (GET) ---

// GET: Obtener todo el contenido (libros)
app.get('/api/content', (req, res) => {
    const content = readData(DB_PATH_CONTENT);
    res.json(content);
});

// GET: Obtener un libro por ID
app.get('/api/content/:bookId', (req, res) => {
    const content = readData(DB_PATH_CONTENT);
    const book = content.find(b => b.id === parseInt(req.params.bookId));
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Libro no encontrado' });
    }
});

// GET: Obtener la lista de perfiles
app.get('/api/profiles', (req, res) => {
    // Nota: En una app real, esto debería estar protegido para no exponer todos los perfiles.
    const profiles = readData(DB_PATH_PROFILES);
    res.json(profiles);
});

// GET: Obtener un perfil específico por ID
app.get('/api/profiles/:profileId', (req, res) => {
    const profiles = readData(DB_PATH_PROFILES);
    const profile = profiles.find(p => p.id === parseInt(req.params.profileId));
    if (profile) {
        res.json(profile);
    } else {
        res.status(404).json({ message: 'Perfil no encontrado' });
    }
});

// GET: Obtener la lista de eventos
app.get('/api/events', (req, res) => {
    const events = readData(DB_PATH_EVENTS);
    res.json(events);
});

// GET: Obtener el plan de lectura
app.get('/api/reading-plan', (req, res) => {
    const plan = readData(DB_PATH_READING_PLAN);
    res.json(plan);
});


// --- RUTAS DE ESCRITURA/ADMINISTRACIÓN (POST, PUT, DELETE) ---

// POST: Publicar un nuevo libro (protegido por adminAuth)
app.post('/api/content', adminAuth, (req, res) => {
    let content = readData(DB_PATH_CONTENT);
    const newBook = req.body;
    
    // Asigna un nuevo ID (basado en el último ID + 1)
    const newId = content.length > 0 ? Math.max(...content.map(b => b.id)) + 1 : 1;
    
    // Validaciones y normalización
    newBook.id = newId;
    newBook.dateAdded = new Date().toISOString();
    newBook.rating = newBook.rating || 0;
    newBook.reviews = newBook.reviews || 0;
    
    content.push(newBook);
    writeData(DB_PATH_CONTENT, content);
    res.status(201).json(newBook);
});

// DELETE: Eliminar un libro por ID (protegido por adminAuth)
app.delete('/api/content/:bookId', adminAuth, (req, res) => {
    let content = readData(DB_PATH_CONTENT);
    const bookId = parseInt(req.params.bookId);

    const initialLength = content.length;
    content = content.filter(b => b.id !== bookId);

    if (content.length === initialLength) {
        return res.status(404).json({ message: 'Libro no encontrado para eliminar.' });
    }

    writeData(DB_PATH_CONTENT, content);
    res.status(200).json({ message: 'Libro eliminado exitosamente.' });
});

// POST: Crear un nuevo evento (protegido por adminAuth)
app.post('/api/events', adminAuth, (req, res) => {
    let events = readData(DB_PATH_EVENTS);
    const newEvent = req.body;

    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    
    newEvent.id = newId;
    newEvent.dateCreated = new Date().toISOString();
    
    events.push(newEvent);
    writeData(DB_PATH_EVENTS, events);
    res.status(201).json(newEvent);
});

// DELETE: Eliminar un evento por ID (protegido por adminAuth)
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


// POST: Publicar/Actualizar el plan de lectura (protegido por adminAuth)
app.post('/api/reading-plan', adminAuth, (req, res) => {
    let plan = readData(DB_PATH_READING_PLAN);
    const newPlan = req.body;

    // Se asume que solo se publica un único plan, o se reemplaza el existente.
    const planToSave = [{ ...newPlan, id: 1 }]; // Forzamos el ID a 1 para simplificar la gestión.
    
    writeData(DB_PATH_READING_PLAN, planToSave);
    res.status(201).json(planToSave[0]);
});

// DELETE: Eliminar un plan de lectura (solo vaciamos el contenido)
app.delete('/api/reading-plan/:planId', adminAuth, (req, res) => {
    const planId = parseInt(req.params.planId);
    let plan = readData(DB_PATH_READING_PLAN);

    if (plan.length === 0 || planId !== 1) {
         return res.status(404).json({ message: 'Plan de lectura no encontrado para eliminar.' });
    }

    writeData(DB_PATH_READING_PLAN, []); // Vaciar el archivo
    res.status(200).json({ message: 'Plan de lectura eliminado exitosamente.' });
});

// POST/PUT: Actualizar un perfil (e.g., añadir favoritos o libros leídos)
app.post('/api/profiles/:profileId', (req, res) => {
    let profiles = readData(DB_PATH_PROFILES);
    const profileId = parseInt(req.params.profileId);
    const updatedProfileData = req.body;

    const profileIndex = profiles.findIndex(p => p.id === profileId);

    if (profileIndex === -1) {
        return res.status(404).json({ message: 'Perfil no encontrado para actualizar.' });
    }

    // Actualiza solo los campos permitidos o deseados
    profiles[profileIndex] = { ...profiles[profileIndex], ...updatedProfileData };

    writeData(DB_PATH_PROFILES, profiles);
    res.status(200).json(profiles[profileIndex]);
});

// --- RUTA CATCH-ALL DE FALLO ---
// Si ninguna ruta anterior coincide, devuelve un 404
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta de API no encontrada. Asegúrate de que la ruta sea correcta.' });
});


// --- EXPORTACIÓN DEL HANDLER PARA NETLIFY ---
// Esta es la línea clave que permite que Netlify ejecute la app Express como una función.
export const handler = serverless(app);

// ¡IMPORTANTE!: Elimina la línea 'app.listen(PORT, () => console.log(...))' de tu código.