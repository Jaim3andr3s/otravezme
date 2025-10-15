// ----------------------------------------------------------------------
// --- App.jsx: BIBLIOSUEÑOS - VERSIÓN CORREGIDA con DELETE, Archivos (URL) y DEMO DATA AMPLIADA
// ----------------------------------------------------------------------

// --- IMPORTACIONES ---
import React, { useState, useEffect, createContext, useContext, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Book, Award, Users, User, Sun, Moon, Menu, X,
    Sparkles, BookHeart, Wind, Feather, Star, XCircle,
    Search, Calendar, MessageSquare, BookOpenCheck, ChevronRight,
    PlayCircle, PauseCircle, StopCircle, UserSquare2, Loader2,
    MessageCircleHeart, StarHalf, Mic, Badge, Edit,
    ShieldCheck, Gem, Rocket, Send, ThumbsUp, ThumbsDown,
    Gamepad2, Palette, Trophy, Loader, ChevronLeft, Volume2, VolumeX, Key, Megaphone, Eraser, Check, Trash2,
    Plus, Globe, NotebookText, Heart, XOctagon, Landmark, Zap
} from 'lucide-react';
import 'tailwindcss/tailwind.css';

// --- CONSTANTES ---
const API_BASE_URL = 'http://localhost:4000/api';
const DEMO_USER_ID = 12345;
const ADMIN_KEY_SECRET = "colombia2025"; 

// --- CONTEXTO DE LA APLICACIÓN ---
const AppContext = createContext();
const useAppContext = () => useContext(AppContext);

// --- ESTRUCTURAS DE DATOS BASE (Fallback/Demo) ---
// 🚨 DEMO_BOOKS AMPLIADO (6 Libros)
const DEMO_BOOKS = [
    { id: 1, title: 'El Principito', author: 'Antoine de Saint-Exupéry', category: 'Infantil', cover: 'https://images.cdn1.buscalibre.com/fit-in/360x360/34/29/34292c8e89f726f2ef8924073ff4c382.jpg', description: 'Un cuento poético y filosófico sobre la amistad, el amor y la pérdida.', status: 'Disponible', ageRange: '8-12 años', isStaffPick: true, readOnlineUrl: 'https://web.seducoahuila.gob.mx/biblioweb/upload/el%20principito.pdf', dateAdded: '2025-06-20T10:00:00Z', rating: 4.9, reviews: 124 },
    { id: 2, title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', category: 'Novela', cover: 'https://images.cdn3.buscalibre.com/fit-in/520x520/90/d6/90d6455083f95cb36dc10052fe29f2ea.jpg', description: 'La obra maestra del realismo mágico que narra la historia de la familia Buendía en Macondo.', status: 'Prestado', ageRange: 'Adultos', isStaffPick: true, readOnlineUrl: '#', dateAdded: '2025-05-15T10:00:00Z', rating: 4.8, reviews: 980 },
    { id: 3, title: 'La Sombra del Viento', author: 'Carlos Ruiz Zafón', category: 'Misterio', cover: 'https://m.media-amazon.com/images/I/510wV-vE8rL._SL1000_.jpg', description: 'Una novela ambientada en la Barcelona de posguerra que sigue la historia de Daniel Sempere.', status: 'Disponible', ageRange: 'Adultos', isStaffPick: false, readOnlineUrl: '#', dateAdded: '2025-07-20T10:00:00Z', rating: 4.7, reviews: 550 },
    { id: 4, title: 'Donde Viven los Monstruos', author: 'Maurice Sendak', category: 'Infantil', cover: 'https://images.cdn1.buscalibre.com/fit-in/360x360/f2/cf/f2cf1902092cc7713e20e8b233a01a61.jpg', description: 'El clásico sobre un niño, Max, que es enviado a su habitación y navega a una tierra de monstruos.', status: 'Disponible', ageRange: '4-7 años', isStaffPick: false, readOnlineUrl: '#', dateAdded: '2025-08-01T10:00:00Z', rating: 4.9, reviews: 320 },
    { id: 11, title: 'Harry Potter y la Piedra Filosofal', author: 'J.K. Rowling', category: 'Fantasía', cover: 'https://m.media-amazon.com/images/I/51-2yG1qNqL._SL1500_.jpg', description: 'El inicio de la saga del joven mago que descubre su verdadera identidad y su destino en Hogwarts.', status: 'Prestado', ageRange: '10-14 años', isStaffPick: false, readOnlineUrl: 'https://biblioteca-digital.universidadcolumbia.edu.mx/acervo/LITERATURA/Harry_Potter_y_la_Piedra_Filosofal-J_K_Rowling.pdf', dateAdded: '2025-07-04T10:00:00Z', rating: 4.9, reviews: 450 },
    { id: 12, title: 'Poesía Completa', author: 'Jorge Luis Borges', category: 'Poesía', cover: 'https://images.cdn3.buscalibre.com/fit-in/360x360/b1/4b/b14bf4593f0b2f70b616421c97ac388a.jpg', description: 'Una recopilación esencial de la obra poética de uno de los escritores más influyentes del siglo XX.', status: 'Disponible', ageRange: 'Adultos', isStaffPick: true, readOnlineUrl: '#', dateAdded: '2025-04-20T10:00:00Z', rating: 4.7, reviews: 210 },
];
const DEMO_EVENTS = [
   
];
const DEMO_READING_PLANS = [];
const DEMO_PROFILE = {
    id: DEMO_USER_ID,
    name: "Lector Invitado",
    email: "demo@biblio.com",
    bio: "Perfil de demostración.",
    avatar: "https://api.dicebear.com/8.x/adventurer/svg?seed=Annie&flip=true",
    favorites: [],
    read: [],
    joinedAt: "2025-01-01T00:00:00Z",
};


// --- UTILITIES Y FUNCIONES AUXILIARES ---

// Función robusta para fetch con reintentos
const fetchWithRetry = async (url, options = {}, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 404) {
                    console.error(`Error 404: No encontrado en ${url}`);
                    if (options.method === 'GET') return null;
                }
                const errorText = await response.text();
                let errorMessage = `HTTP error! status: ${response.status}.`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorMessage;
                }
                throw new Error(errorMessage);
            }
            if (options.method === 'DELETE' && response.status === 204) {
                 return { message: 'Eliminado exitosamente.' };
            }
            const text = await response.text();
            return text ? JSON.parse(text) : { message: 'Operación exitosa sin contenido de respuesta.' };

        } catch (error) {
            console.warn(`Fetch fallido (Intento ${i + 1}/${maxRetries}):`, error.message);
            if (i === maxRetries - 1) {
                throw new Error(error.message || `Fallo en la conexión después de ${maxRetries} intentos.`);
            }
            await new Promise(resolve => setTimeout(resolve, delay * (2 ** i)));
        }
    }
};

// Función para generar avatares (no utilizada actualmente pero mantenida)
// const getAvatarUrl = (name) => {
//     const seed = name.replace(/\s/g, '').toLowerCase();
//     return `https://api.dicebear.com/8.x/adventurer/svg?seed=${seed}&flip=true`;
// };


// --- COMPONENTES UI REUTILIZABLES ---

const ModalWrapper = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center p-4">
        <motion.div
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{title}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                    <XCircle className="w-6 h-6" />
                </button>
            </div>
            {children}
        </motion.div>
    </div>
);

const IconButton = ({ icon: Icon, onClick, className = '', title = '', disabled = false }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-2 rounded-full transition duration-200 ease-in-out shadow-lg transform hover:scale-105 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <Icon className="w-6 h-6" />
    </button>
);

const LoadingScreen = () => { return (
        <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-[100] p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <BookOpenCheck className="w-16 h-16 text-emerald-500" />
            </motion.div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                Cargando BiblioSueños...
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Conectando con el universo literario.
            </p>
        </motion.div>
    );
};

const Notification = ({ message, type = 'info', onClose }) => {
    const Icon = {
        info: MessageSquare,
        success: Check,
        error: XCircle,
    }[type];

    const colorClasses = {
        info: 'bg-blue-500 border-blue-600',
        success: 'bg-emerald-500 border-emerald-600',
        error: 'bg-red-500 border-red-600',
    }[type];

    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl text-white font-semibold flex items-center space-x-3 z-[150] ${colorClasses} border-b-4`}
        >
            <Icon className="w-6 h-6" />
            <span>{message}</span>
        </motion.div>
    );
};

// Componente para mostrar clasificación de libro
const Pill = ({ icon: Icon, text, color = 'bg-gray-100 dark:bg-gray-700', textColor = 'text-gray-600 dark:text-gray-200' }) => (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${color} ${textColor}`}>
        {Icon && <Icon className="w-4 h-4 mr-1" />}
        {text}
    </span>
);

const StarRating = ({ rating, reviews }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
            {hasHalfStar && (
                <StarHalf key="half" className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            ))}
            {reviews !== undefined && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({reviews} opiniones)</span>
            )}
        </div>
    );
};

// BookCard: Muestra la clasificación de forma prominente.
const BookCard = ({ book, onClick }) => {
    const { isFavorite } = useAppContext();
    const favorite = isFavorite(book.id);

    return (
        <motion.div
            className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.02]"
            onClick={() => onClick(book)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            layout
        >
            <div className="relative overflow-hidden w-full h-56 flex-shrink-0">
                <img
                    src={book.cover}
                    alt={`Portada de ${book.title}`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/360x560/E2E8F0/1F2937?text=Sin+Portada" }}
                />
                {favorite && (
                    <motion.div
                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                    >
                        <Heart className="w-4 h-4 text-white fill-white" />
                    </motion.div>
                )}
                {book.isStaffPick && (
                    <div className="absolute top-2 left-2">
                        <Pill icon={Sparkles} text="Selección Staff" color="bg-yellow-400/90" textColor="text-yellow-900" />
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">{book.title}</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-3">{book.author}</p>
                <div className="mt-auto">
                    <StarRating rating={book.rating} />
                    <div className="mt-3 flex flex-wrap gap-2">
                        {/* CLASIFICACIÓN (CATEGORÍA) */}
                        <Pill text={book.category} color="bg-indigo-100 dark:bg-indigo-700/50" textColor="text-indigo-600 dark:text-indigo-300" />
                        {/* CLASIFICACIÓN (RANGO DE EDAD) */}
                        <Pill text={book.ageRange} color="bg-teal-100 dark:bg-teal-700/50" textColor="text-teal-600 dark:text-teal-300" />
                        {/* CLASIFICACIÓN (ESTADO) */}
                        <Pill icon={book.status === 'Disponible' ? Check : XOctagon} text={book.status} color={book.status === 'Disponible' ? 'bg-emerald-100 dark:bg-emerald-700/50' : 'bg-red-100 dark:bg-red-700/50'} textColor={book.status === 'Disponible' ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// BookModal: Muestra la clasificación de forma detallada.
const BookModal = ({ book, onClose, onVote, onToggleFavorite, isFavorite, onBookReadComplete, isAdminLoggedIn, onDelete }) => {
    const { profile } = useAppContext();
    const isRead = profile?.read?.some(r => r.bookId === book.id);
    const buttonClass = "px-4 py-2 rounded-full font-semibold text-white transition-colors duration-200 shadow-md flex items-center justify-center";
    
    const handleVoteUp = () => onVote(book.id, 'up');
    const handleVoteDown = () => onVote(book.id, 'down');

    return (
        <ModalWrapper title={book.title} onClose={onClose}>
            <div className="p-6 space-y-4 text-left">
                <div className="flex flex-col md:flex-row gap-6">
                    <img
                        src={book.cover}
                        alt={`Portada de ${book.title}`}
                        className="w-40 h-56 object-cover rounded-lg shadow-lg flex-shrink-0"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/160x224/AEC6CF/FFFFFF?text=Portada+No+Disponible"; }}
                    />
                    <div className="flex-grow">
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{book.title}</h3>
                        <p className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{book.author}</p>
                        
                        {/* CLASIFICACIÓN DE LIBRO */}
                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <Badge className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <span className="bg-indigo-100 dark:bg-indigo-700/50 px-3 py-1 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-300">{book.category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Landmark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <span className="bg-teal-100 dark:bg-teal-700/50 px-3 py-1 rounded-full text-xs font-medium text-teal-600 dark:text-teal-300">{book.ageRange}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold text-gray-700 dark:text-gray-200">{book.rating}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Zap className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${book.status === 'Disponible' ? 'bg-emerald-100 dark:bg-emerald-700/50 text-emerald-600 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-700/50 text-red-600 dark:text-red-300'}`}>{book.status}</span>
                            </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4">{book.description}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <a
                        href={book.readOnlineUrl && book.readOnlineUrl !== '#' ? book.readOnlineUrl : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${buttonClass} bg-emerald-600 hover:bg-emerald-700 ${!book.readOnlineUrl || book.readOnlineUrl === '#' ? 'opacity-50 cursor-not-allowed' : ''} flex-grow`}
                        onClick={(e) => { if (!book.readOnlineUrl || book.readOnlineUrl === '#') e.preventDefault(); }}
                    >
                        <BookOpenCheck className="w-5 h-5 mr-2" />
                        {book.readOnlineUrl && book.readOnlineUrl !== '#' ? 'Leer en Línea' : 'Préstamo Físico'}
                    </a>
                    <button
                        onClick={() => onToggleFavorite(book.id)}
                        className={`${buttonClass} flex-shrink-0 w-full sm:w-auto ${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
                    </button>
                    <button
                        onClick={() => onBookReadComplete(book.id)}
                        className={`${buttonClass} flex-shrink-0 w-full sm:w-auto ${isRead ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                        title={isRead ? 'Marcar como No Leído' : 'Marcar como Leído'}
                    >
                        {isRead ? <Eraser className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    </button>
                    
                    {/* BOTÓN DE ELIMINAR (ADMIN) */}
                    {isAdminLoggedIn && (
                         <button
                            onClick={() => onDelete(book.id)} 
                            className={`${buttonClass} flex-shrink-0 w-full sm:w-auto bg-red-600 hover:bg-red-700`}
                            title="Eliminar Libro (Admin)"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Te gustó el libro?</h4>
                    <div className="flex items-center space-x-4">
                        <IconButton
                            icon={ThumbsUp}
                            onClick={handleVoteUp}
                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                            title="Votar Positivo"
                        />
                        <IconButton
                            icon={ThumbsDown}
                            onClick={handleVoteDown}
                            className="bg-red-500 text-white hover:bg-red-600"
                            title="Votar Negativo"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Ayuda a otros lectores a descubrir.
                        </span>
                    </div>
                </div>

            </div>
        </ModalWrapper>
    );
};


// --- COMPONENTES MODALES ADMINISTRATIVOS ---

const AdminLoginModal = ({ onClose, onLogin }) => {
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        setTimeout(() => {
            if (key === ADMIN_KEY_SECRET) {
                onLogin(key);
                onClose();
            } else {
                setError('Clave incorrecta.');
            }
            setLoading(false);
        }, 500);
    };

    return (
        <ModalWrapper title="Acceso de Administrador" onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <ShieldCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Solo para personal autorizado.
                    </p>
                </div>
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Introduce la clave secreta de administrador"
                    required
                    className="input-field"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Key className="mr-2 w-5 h-5" />}
                    {loading ? 'Verificando...' : 'Acceder'}
                </button>
                {error && <p className="text-sm text-center text-red-500 font-semibold">{error}</p>}
            </form>
        </ModalWrapper>
    );
};

const PublishBookModal = ({ onClose, onPublish }) => {
    const [formData, setFormData] = useState({
        title: '', author: '', category: '', cover: '', description: '', ageRange: '', readOnlineUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        onPublish(formData)
            .then(() => {
                setMessage('Libro publicado exitosamente!');
                setFormData({ title: '', author: '', category: '', cover: '', description: '', ageRange: '', readOnlineUrl: '' });
                setTimeout(onClose, 1500);
            })
            .catch((error) => {
                setMessage(`Error: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <ModalWrapper title="Publicar Nuevo Libro" onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Título del Libro" required className="input-field" />
                <input type="text" name="author" value={formData.author} onChange={handleChange} placeholder="Autor" required className="input-field" />
                <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Categoría (Ej: Fantasía, Novela)" required className="input-field" />
                <input type="text" name="ageRange" value={formData.ageRange} onChange={handleChange} placeholder="Rango de Edad (Ej: 10-14 años)" required className="input-field" />
                <input type="url" name="cover" value={formData.cover} onChange={handleChange} placeholder="URL de la Portada (Imagen)" required className="input-field" />
                <input type="url" name="readOnlineUrl" value={formData.readOnlineUrl} onChange={handleChange} placeholder="URL de Lectura en Línea (Opcional)" className="input-field" />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción breve del libro" required className="input-field h-24"></textarea>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Rocket className="mr-2 w-5 h-5" />}
                    {loading ? 'Publicando...' : 'Publicar Libro'}
                </button>
                {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
            </form>
        </ModalWrapper>
    );
};

const CreateEventModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        title: '', date: '', description: '', type: 'Club de Lectura'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        onCreate(formData)
            .then(() => {
                setMessage('Evento creado exitosamente!');
                setFormData({ title: '', date: '', description: '', type: 'Club de Lectura' });
                setTimeout(onClose, 1500);
            })
            .catch((error) => {
                setMessage(`Error: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <ModalWrapper title="Crear Nuevo Evento" onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Título del Evento" required className="input-field" />
                <input type="text" name="date" value={formData.date} onChange={handleChange} placeholder="Fecha y Hora (Ej: Sábado 10 Nov, 2025 - 4:00 PM)" required className="input-field" />
                
                <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                    <option value="Club de Lectura">Club de Lectura</option>
                    <option value="Taller">Taller</option>
                    <option value="Cuentacuentos">Cuentacuentos</option>
                    <option value="Conferencia">Conferencia/Charla</option>
                    <option value="General">General</option>
                </select>

                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción completa del evento" required className="input-field h-16"></textarea>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Megaphone className="mr-2 w-5 h-5" />}
                    {loading ? 'Creando Evento...' : 'Crear Evento'}
                </button>
                {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
            </form>
        </ModalWrapper>
    );
};

// Modal con campo documentUrl
const PublishReadingPlanModal = ({ onClose, onPublish }) => {
    const [formData, setFormData] = useState({
        title: '', description: '', level: '', durationWeeks: '', books: '', documentUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!formData.title || !formData.description || !formData.level || !formData.durationWeeks || !formData.books) {
            setMessage('Por favor, completa todos los campos obligatorios (*).');
            setLoading(false);
            return;
        }

        let booksArray;
        try {
            booksArray = JSON.parse(formData.books);
            if (!Array.isArray(booksArray) || booksArray.length === 0 || !booksArray.every(item => item.bookId && item.week)) {
                throw new Error('Formato de libros incorrecto');
            }
        } catch (error) {
            setMessage('El campo "Libros JSON" debe ser un array JSON válido con la estructura: [{"bookId": 1, "week": 1, "note": "Nota"}].');
            setLoading(false);
            return;
        }

        const planToSubmit = {
            ...formData,
            durationWeeks: parseInt(formData.durationWeeks),
            books: booksArray,
            documentUrl: formData.documentUrl || null
        };

        onPublish(planToSubmit)
            .then(() => {
                setMessage('Plan de Lectura publicado exitosamente!');
                setFormData({ title: '', description: '', level: '', durationWeeks: '', books: '', documentUrl: '' });
                setTimeout(onClose, 1500);
            })
            .catch((error) => {
                setMessage(`Error: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <ModalWrapper title="Publicar Plan Lector" onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                    * Campos obligatorios. La URL del Documento es opcional.
                </p>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="* Título del Plan (Ej: Novelas para el Verano)" required className="input-field" />
                <input type="text" name="level" value={formData.level} onChange={handleChange} placeholder="* Nivel (Ej: Básico, Intermedio, Adultos)" required className="input-field" />
                <input type="number" name="durationWeeks" value={formData.durationWeeks} onChange={handleChange} placeholder="* Duración (Semanas)" required className="input-field" min="1" />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="* Descripción breve del Plan" required className="input-field h-16"></textarea>
                
                {/* CAMPO DE URL DE DOCUMENTO */}
                <input type="url" name="documentUrl" value={formData.documentUrl} onChange={handleChange} placeholder="URL de Documento/PDF del Plan (Opcional)" className="input-field" /> 
                
                <textarea name="books" value={formData.books} onChange={handleChange} placeholder='* Libros JSON. Ejemplo: [{"bookId": 1, "week": 1, "note": "Nota"}]' required className="input-field h-24 font-mono text-xs"></textarea>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <NotebookText className="mr-2 w-5 h-5" />}
                    {loading ? 'Publicando Plan...' : 'Publicar Plan'}
                </button>
                {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
            </form>
        </ModalWrapper>
    );
};


// ----------------------------------------------------------------------
// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN (App) ---
// ----------------------------------------------------------------------

const pages = {
    HOME: 'Inicio',
    LIBRARY: 'Biblioteca',
    EVENTS: 'Eventos',
    PLANS: 'Planes Lectores',
    PROFILE: 'Mi Perfil',
};

export default function App() {
    const [books, setBooks] = useState(DEMO_BOOKS);
    const [events, setEvents] = useState(DEMO_EVENTS);
    const [profile, setProfile] = useState(DEMO_PROFILE);
    const [readingPlans, setReadingPlans] = useState(DEMO_READING_PLANS);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(pages.HOME);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notification, setNotification] = useState(null);
    const menuRef = useRef(null);
    const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [adminKey, setAdminKey] = useState(null);
    const [isPublishBookModalOpen, setIsPublishBookModalOpen] = useState(false);
    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [isPublishPlanModalOpen, setIsPublishPlanModalOpen] = useState(false);


    // --- HOOKS DE EFECTO ---

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        // Cierra el menú si se hace clic fuera de él
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);
    
    // --- LÓGICA DE DATOS Y ESTADO ---

    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
    }, []);

    const navigate = useCallback((page) => {
        setCurrentPage(page);
        setIsMenuOpen(false);
        setSelectedBook(null);
    }, []);
    
    const isFavorite = useCallback((bookId) => {
        return profile?.favorites?.includes(bookId) || false;
    }, [profile]);
    
    // --- FUNCIÓN DE CARGA DE DATOS ---
    const loadInitialData = useCallback(async () => {
        setLoading(true);
        try {
            // Intentar cargar datos del backend
            const [booksData, eventsData, profileData, plansData] = await Promise.all([
                fetchWithRetry(`${API_BASE_URL}/books`),
                fetchWithRetry(`${API_BASE_URL}/events`),
                fetchWithRetry(`${API_BASE_URL}/profile/${DEMO_USER_ID}`),
                fetchWithRetry(`${API_BASE_URL}/reading-plan`),
            ]);

            // Usar datos del backend si existen, si no, usar fallbacks
            setBooks(booksData || DEMO_BOOKS);
            setEvents(eventsData || DEMO_EVENTS);
            setProfile(profileData || DEMO_PROFILE);
            setReadingPlans(plansData || DEMO_READING_PLANS);

        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            showNotification('Error al conectar con el servidor. Usando datos de demostración.', 'error');
            // Ya se están usando fallbacks si fetchWithRetry devuelve null.
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);


    // --- FUNCIONES DE ACCIÓN DE USUARIO ---

    const toggleFavorite = useCallback(async (bookId) => {
        const isCurrentlyFavorite = isFavorite(bookId);
        const newFavorites = isCurrentlyFavorite
            ? profile.favorites.filter(id => id !== bookId)
            : [...profile.favorites, bookId];
            
        try {
            const updatedProfile = await fetchWithRetry(`${API_BASE_URL}/profile/${DEMO_USER_ID}/favorites`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorites: newFavorites }),
            });

            if (updatedProfile) {
                setProfile(updatedProfile.profile);
                showNotification(isCurrentlyFavorite ? 'Eliminado de favoritos.' : 'Añadido a favoritos!', 'success');
            }
        } catch (error) {
            showNotification(`Error al actualizar favoritos: ${error.message}`, 'error');
        }
    }, [profile, isFavorite, showNotification]);

    const handleBookReadComplete = useCallback(async (bookId) => {
        const isCurrentlyRead = profile.read.some(r => r.bookId === bookId);
        let newRead;

        if (isCurrentlyRead) {
            newRead = profile.read.filter(r => r.bookId !== bookId);
        } else {
            newRead = [...profile.read, { bookId, date: new Date().toISOString() }];
        }
            
        try {
            const updatedProfile = await fetchWithRetry(`${API_BASE_URL}/profile/${DEMO_USER_ID}/read`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: newRead }),
            });

            if (updatedProfile) {
                setProfile(updatedProfile.profile);
                showNotification(isCurrentlyRead ? 'Libro marcado como no leído.' : '¡Felicidades, libro completado!', 'success');
            }
        } catch (error) {
            showNotification(`Error al actualizar libros leídos: ${error.message}`, 'error');
        }
    }, [profile, showNotification]);

    const handleVote = useCallback(async (bookId, type) => {
        try {
            const response = await fetchWithRetry(`${API_BASE_URL}/books/${bookId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });

            if (response && response.book) {
                setBooks(prev => prev.map(b => b.id === bookId ? response.book : b));
                setSelectedBook(prev => prev?.id === bookId ? response.book : prev);
                showNotification(`Voto registrado. Nuevo rating: ${response.book.rating}`, 'success');
            }
        } catch (error) {
            showNotification(`Error al votar: ${error.message}`, 'error');
        }
    }, [showNotification]);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            if (newMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return newMode;
        });
    }, []);

    // --- FUNCIONES DE ADMINISTRACIÓN ---

    const handleAdminLogin = useCallback((key) => {
        setAdminKey(key);
        setIsAdminLoggedIn(true);
        showNotification('Acceso de administrador concedido.', 'success');
    }, [showNotification]);

    const handleLogoutAdmin = useCallback(() => {
        setAdminKey(null);
        setIsAdminLoggedIn(false);
        showNotification('Sesión de administrador cerrada.', 'info');
    }, [showNotification]);

    const postAdminData = useCallback(async (endpoint, data) => {
        if (!adminKey) throw new Error("Clave de administrador no disponible.");

        const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': adminKey,
            },
            body: JSON.stringify(data),
        });

        if (!response || response.message.startsWith('Error')) {
            throw new Error(response?.message || 'Fallo desconocido en la publicación.');
        }
        return response;
    }, [adminKey]);

    const handlePublishBook = useCallback(async (bookData) => {
        const response = await postAdminData('/books', bookData);
        setBooks(prev => [...prev, response.book]);
        return response;
    }, [postAdminData]);

    const handleCreateEvent = useCallback(async (eventData) => {
        const response = await postAdminData('/events', eventData);
        setEvents(prev => [...prev, response.event]);
        return response;
    }, [postAdminData]);

    const handlePublishPlan = useCallback(async (planData) => {
        const response = await postAdminData('/reading-plan', planData);
        setReadingPlans(prev => [...prev, response.plan]);
        return response;
    }, [postAdminData]);

    // FUNCIONES ADMINISTRATIVAS (DELETE)

    const deleteAdminData = useCallback(async (endpoint, id) => {
        if (!adminKey) throw new Error("Clave de administrador no disponible.");

        const shouldDelete = window.confirm(`⚠️ ¿Estás seguro de que deseas eliminar el elemento con ID ${id} en ${endpoint}? Esta acción es irreversible.`);
        if (!shouldDelete) return;

        try {
            const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-key': adminKey,
                },
            });

            if (!response || response.message.startsWith('Error')) {
                throw new Error(response?.message || 'Fallo desconocido en la eliminación.');
            }
            return response;
        } catch (error) {
            throw error;
        }
        
    }, [adminKey]);

    const handleDeleteBook = useCallback(async (bookId) => {
        try {
            await deleteAdminData('/books', bookId);
            setBooks(prev => prev.filter(b => b.id !== bookId));
            setSelectedBook(null); // Cerrar modal después de eliminar
            showNotification('Libro eliminado exitosamente.', 'success');
        } catch (error) {
            showNotification(`Error al eliminar libro: ${error.message}`, 'error');
        }
    }, [deleteAdminData, showNotification]);

    const handleDeleteEvent = useCallback(async (eventId) => {
        try {
            await deleteAdminData('/events', eventId);
            setEvents(prev => prev.filter(e => e.id !== eventId));
            showNotification('Evento eliminado exitosamente.', 'success');
        } catch (error) {
            showNotification(`Error al eliminar evento: ${error.message}`, 'error');
        }
    }, [deleteAdminData, showNotification]);

    const handleDeletePlan = useCallback(async (planId) => {
        try {
            await deleteAdminData('/reading-plan', planId);
            setReadingPlans(prev => prev.filter(p => p.id !== planId));
            showNotification('Plan de lectura eliminado exitosamente.', 'success');
        } catch (error) {
            showNotification(`Error al eliminar plan: ${error.message}`, 'error');
        }
    }, [deleteAdminData, showNotification]);


    // --- COMPONENTES DE PÁGINA MEMORIZADOS ---

    const LibraryPage = useMemo(() => () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">📚 Biblioteca General ({books.length})</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Explora nuestro catálogo completo de tesoros literarios.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {books.map(book => (
                        <BookCard
                            key={book.id}
                            book={book}
                            onClick={() => setSelectedBook(book)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {isAdminLoggedIn && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => setIsPublishBookModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-200 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Publicar Nuevo Libro
                    </button>
                </div>
            )}
        </motion.div>
    ), [books, isAdminLoggedIn]);

    const EventsPage = useMemo(() => () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">📣 Próximos Eventos ({events.length})</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Participa en nuestros clubes de lectura, talleres y cuentacuentos.</p>

            <div className="grid grid-cols-1 gap-6">
                {events.map(event => (
                    <motion.div
                        key={event.id}
                        className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col md:flex-row items-start transition-shadow hover:shadow-xl relative"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* BOTÓN DE ELIMINAR (ADMIN) */}
                        {isAdminLoggedIn && (
                            <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800 transition z-10"
                                title="Eliminar Evento"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}

                        <Calendar className="w-10 h-10 text-purple-500 flex-shrink-0 mr-4 mt-1" />
                        <div className="flex-grow">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                            <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">{event.date}</p>
                            <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
                            <div className="mt-3">
                                <Pill text={event.type} icon={event.type === 'Club de Lectura' ? BookOpenCheck : Mic} color="bg-purple-100 dark:bg-purple-700/50" textColor="text-purple-600 dark:text-purple-300" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {isAdminLoggedIn && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => setIsCreateEventModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-200 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Crear Nuevo Evento
                    </button>
                </div>
            )}
        </motion.div>
    ), [events, isAdminLoggedIn, handleDeleteEvent]);

    const ReadingPlansPage = useMemo(() => () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">📚 Planes de Lectura</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Guías de lectura estructurada para alcanzar tus metas literarias.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readingPlans.length > 0 ? (
                    readingPlans.map(plan => (
                        <motion.div
                            key={plan.id}
                            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-pink-500 hover:shadow-xl transition-shadow relative"
                            whileHover={{ y: -3 }}
                        >
                            {/* BOTÓN DE ELIMINAR (ADMIN) */}
                            {isAdminLoggedIn && (
                                <button
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="absolute top-3 right-3 p-1.5 rounded-full bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800 transition z-10"
                                    title="Eliminar Plan"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}

                            <NotebookText className="w-8 h-8 text-pink-500 mb-3" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Pill text={`Nivel: ${plan.level}`} color="bg-pink-100 dark:bg-pink-700/50" textColor="text-pink-600 dark:text-pink-300" />
                                <Pill text={`${plan.durationWeeks} Semanas`} color="bg-indigo-100 dark:bg-indigo-700/50" textColor="text-indigo-600 dark:text-indigo-300" />
                                <Pill text={`${plan.books.length} Libros`} icon={Book} color="bg-emerald-100 dark:bg-emerald-700/50" textColor="text-emerald-600 dark:text-emerald-300" />
                            </div>

                            <div className="mt-4">
                                {/* Link al Documento del Plan (si existe) */}
                                {plan.documentUrl && (
                                     <a href={plan.documentUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4">
                                        <Globe className="w-4 h-4 mr-1" />
                                        Ver Documento del Plan
                                    </a>
                                )}
                                
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Libros Destacados:</h4>
                                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    {plan.books.slice(0, 3).map((bookItem, index) => {
                                        // Usamos `books` del estado para obtener el detalle
                                        const bookDetail = books.find(b => b.id === bookItem.bookId);
                                        return (
                                            <li key={index} className="flex items-center">
                                                <ChevronRight className="w-4 h-4 mr-1 text-pink-500" />
                                                {bookDetail ? bookDetail.title : `Libro ID ${bookItem.bookId} (No encontrado)`} (Semana {bookItem.week})
                                            </li>
                                        );
                                    })}
                                    {plan.books.length > 3 && (
                                        <li className="text-xs italic text-gray-500">...y {plan.books.length - 3} más.</li>
                                    )}
                                </ul>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="md:col-span-3 text-center p-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <Wind className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No hay planes de lectura activos en este momento. ¡Vuelve pronto!</p>
                    </div>
                )}
            </div>

            {isAdminLoggedIn && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => setIsPublishPlanModalOpen(true)}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-200 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Publicar Nuevo Plan Lector
                    </button>
                </div>
            )}
        </motion.div>
    ), [readingPlans, books, isAdminLoggedIn, handleDeletePlan]);


    const ProfilePage = useMemo(() => () => {
        const favoriteBooks = books.filter(b => profile.favorites.includes(b.id));
        const readBooks = books.filter(b => profile.read.some(r => r.bookId === b.id));

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
            >
                {/* Cabecera del Perfil */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
                    <img
                        src={profile.avatar}
                        alt={`Avatar de ${profile.name}`}
                        className="w-32 h-32 rounded-full border-4 border-indigo-500 p-1 bg-white dark:bg-gray-700 flex-shrink-0"
                    />
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
                        <p className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold mb-3">Lector Activo</p>
                        <p className="text-gray-600 dark:text-gray-300 italic">"{profile.bio}"</p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                            <Pill icon={Heart} text={`${favoriteBooks.length} Favoritos`} color="bg-red-100 dark:bg-red-900/50" textColor="text-red-600 dark:text-red-300" />
                            <Pill icon={BookOpenCheck} text={`${readBooks.length} Leídos`} color="bg-blue-100 dark:bg-blue-900/50" textColor="text-blue-600 dark:text-blue-300" />
                            <Pill icon={Calendar} text={`Miembro desde: ${new Date(profile.joinedAt).toLocaleDateString()}`} color="bg-gray-100 dark:bg-gray-700/50" />
                        </div>
                    </div>
                </div>

                {/* Sección Favoritos */}
                <section className="space-y-4">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Heart className="w-7 h-7 mr-2 text-red-500 fill-red-500" />
                        Mis Libros Favoritos
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {favoriteBooks.length > 0 ? (
                            favoriteBooks.map(book => (
                                <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 col-span-full italic">Aún no has añadido ningún libro a tus favoritos.</p>
                        )}
                    </div>
                </section>

                {/* Sección Leídos */}
                <section className="space-y-4">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <BookOpenCheck className="w-7 h-7 mr-2 text-blue-500" />
                        Libros Leídos ({readBooks.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {readBooks.length > 0 ? (
                            readBooks.map(book => (
                                <div key={book.id} className="relative">
                                    <BookCard book={book} onClick={() => setSelectedBook(book)} />
                                    <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-br-lg shadow-lg">LEÍDO</div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 col-span-full italic">¡Es hora de empezar a leer! Marca tus libros completados.</p>
                        )}
                    </div>
                </section>
            </motion.div>
        );
    }, [profile, books]);

    const HomePage = useMemo(() => () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
        >
            <header className="text-center py-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-xl text-white">
                <h1 className="text-6xl font-extrabold mb-4 animate-pulse">BiblioSueños</h1>
                <p className="text-2xl font-light">Donde las palabras se encuentran con la imaginación.</p>
                <button
                    onClick={() => navigate(pages.LIBRARY)}
                    className="mt-8 px-8 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 flex items-center mx-auto"
                >
                    <Book className="w-5 h-5 mr-2" /> Explorar la Biblioteca
                </button>
            </header>

            {/* Sección de Selección del Staff */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Sparkles className="w-7 h-7 mr-2 text-yellow-500 fill-yellow-500" />
                    Selección del Staff
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {books.filter(b => b.isStaffPick).slice(0, 4).map(book => (
                        <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
                    ))}
                </div>
            </section>

            {/* Sección de Eventos Recientes */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-7 h-7 mr-2 text-purple-500" />
                    Próximos Eventos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.slice(0, 2).map(event => (
                        <motion.div key={event.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-purple-500 flex items-start space-x-3">
                            <Megaphone className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{event.date}</p>
                                <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{event.description}</p>
                                <button
                                    onClick={() => navigate(pages.EVENTS)}
                                    className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center"
                                >
                                    Ver Detalles <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Área de Administración (Visible solo para Admin) */}
            {isAdminLoggedIn && (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 flex items-center mb-4">
                        <ShieldCheck className="w-6 h-6 mr-2 fill-red-500" /> PANEL DE ADMINISTRADOR
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Acceso total a gestión de contenido y eliminación.</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <button onClick={() => setIsPublishBookModalOpen(true)} className="admin-btn bg-green-500 hover:bg-green-600"><Plus className="w-4 h-4 mr-1" /> Libro</button>
                        <button onClick={() => setIsCreateEventModalOpen(true)} className="admin-btn bg-purple-500 hover:bg-purple-600"><Plus className="w-4 h-4 mr-1" /> Evento</button>
                        <button onClick={() => setIsPublishPlanModalOpen(true)} className="admin-btn bg-pink-500 hover:bg-pink-600"><Plus className="w-4 h-4 mr-1" /> Plan Lector</button>
                        <button onClick={handleLogoutAdmin} className="admin-btn bg-gray-500 hover:bg-gray-600"><XCircle className="w-4 h-4 mr-1" /> Salir</button>
                    </div>
                </div>
            )}
        </motion.div>
    ), [books, events, isAdminLoggedIn, handleLogoutAdmin, navigate]);

    const renderPage = useCallback(() => {
        switch (currentPage) {
            case pages.LIBRARY:
                return <LibraryPage />;
            case pages.EVENTS:
                return <EventsPage />;
            case pages.PLANS:
                return <ReadingPlansPage />;
            case pages.PROFILE:
                return <ProfilePage />;
            case pages.HOME:
            default:
                return <HomePage />;
        }
    }, [currentPage, LibraryPage, EventsPage, ReadingPlansPage, ProfilePage, HomePage]);

    const contextValue = useMemo(() => ({
        books,
        events,
        profile,
        readingPlans,
        isDarkMode,
        toggleFavorite,
        isFavorite,
        navigate,
        showNotification,
    }), [books, events, profile, readingPlans, isDarkMode, toggleFavorite, isFavorite, navigate, showNotification]);


    // --- RENDERIZADO PRINCIPAL ---
    if (loading) return <LoadingScreen />;

    return (
        <AppContext.Provider value={contextValue}>
            <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

                {/* Estilos CSS para inputs */}
                <style dangerouslySetInnerHTML={{__html: `
                    .input-field {
                        @apply w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition duration-150;
                    }
                    .admin-btn {
                         @apply text-white font-semibold py-2 rounded-lg text-sm transition duration-150 flex items-center justify-center;
                    }
                `}} />

                {/* --- NOTIFICACIÓN --- */}
                <AnimatePresence>
                    {notification && (
                        <Notification
                            message={notification.message}
                            type={notification.type}
                            onClose={() => setNotification(null)}
                        />
                    )}
                </AnimatePresence>


                {/* --- Contenedor principal de la aplicación --- */}
                <div className="min-h-screen flex flex-col">
                    
                    {/* --- HEADER/NAVBAR --- */}
                    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg">
                        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                            {/* Logo/Título */}
                            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(pages.HOME)}>
                                <BookOpenCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-2xl font-extrabold text-gray-900 dark:text-white hidden sm:block">BiblioSueños</span>
                            </div>

                            {/* Navegación (Escritorio) */}
                            <nav className="hidden lg:flex space-x-6">
                                {Object.values(pages).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => navigate(page)}
                                        className={`font-semibold text-lg transition duration-150 p-2 rounded-lg ${
                                            currentPage === page
                                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700/50'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </nav>

                            {/* Controles de Usuario/Admin */}
                            <div className="flex items-center space-x-3">
                                <IconButton
                                    icon={isDarkMode ? Sun : Moon}
                                    onClick={toggleDarkMode}
                                    className="text-yellow-500 dark:text-yellow-400 bg-gray-100 dark:bg-gray-700"
                                    title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                                />
                                
                                {/* Botón de Admin */}
                                {!isAdminLoggedIn ? (
                                    <IconButton
                                        icon={ShieldCheck}
                                        onClick={() => setIsAdminLoginModalOpen(true)}
                                        className="text-red-600 bg-red-100 dark:bg-red-900/50 hover:bg-red-200"
                                        title="Acceso Admin"
                                    />
                                ) : (
                                     <Pill text="ADMIN" icon={ShieldCheck} color="bg-red-500" textColor="text-white" />
                                )}

                                {/* Menú Hamburguesa (Móvil) */}
                                <IconButton
                                    icon={Menu}
                                    onClick={() => setIsMenuOpen(true)}
                                    className="lg:hidden text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50"
                                    title="Abrir Menú"
                                />
                            </div>
                        </div>
                    </header>

                    {/* Menú Móvil */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                ref={menuRef}
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "tween", duration: 0.3 }}
                                className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 z-[100] shadow-2xl p-6 lg:hidden"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Navegación</h3>
                                    <IconButton
                                        icon={X}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-gray-500 bg-gray-100 dark:bg-gray-700"
                                        title="Cerrar Menú"
                                    />
                                </div>
                                <nav className="flex flex-col space-y-4">
                                    {Object.values(pages).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => navigate(page)}
                                            className={`font-semibold text-xl text-left p-3 rounded-lg transition duration-150 ${
                                                currentPage === page
                                                    ? 'text-white bg-indigo-600 dark:bg-indigo-500'
                                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    {isAdminLoggedIn && (
                                         <button
                                            onClick={handleLogoutAdmin}
                                            className="font-semibold text-xl text-left p-3 rounded-lg transition duration-150 text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                                        >
                                            <XCircle className="w-5 h-5 mr-2 inline" /> Salir Admin
                                        </button>
                                    )}
                                </nav>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* --- CONTENIDO PRINCIPAL --- */}
                    <main className="container mx-auto px-4 py-8 flex-grow">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderPage()}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    {/* --- FOOTER --- */}
                    <footer className="container mx-auto px-4 py-6 mt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 relative z-10">
                        <p>© {new Date().getFullYear()} BiblioSueños. Un proyecto con ❤️ para la comunidad de Colombia.</p>
                    </footer>
                </div>
                
                {/* --- MODALES --- */}
                {/* Modal del Libro - Se pasan las props de Admin */}
                <AnimatePresence>
                    {selectedBook && <BookModal
                        book={books.find(b => b.id === selectedBook.id) || selectedBook}
                        onClose={() => setSelectedBook(null)}
                        onVote={handleVote}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={isFavorite(selectedBook.id)}
                        onBookReadComplete={handleBookReadComplete}
                        isAdminLoggedIn={isAdminLoggedIn}
                        onDelete={handleDeleteBook}
                    />}
                </AnimatePresence>
                
                {/* Modales Administrativos */}
                <AnimatePresence>
                    {isAdminLoginModalOpen && !isAdminLoggedIn && <AdminLoginModal
                        onClose={() => setIsAdminLoginModalOpen(false)}
                        onLogin={handleAdminLogin}
                    />}
                    {isPublishBookModalOpen && isAdminLoggedIn && <PublishBookModal
                        onClose={() => setIsPublishBookModalOpen(false)}
                        onPublish={handlePublishBook}
                    />}
                    {isCreateEventModalOpen && isAdminLoggedIn && <CreateEventModal
                        onClose={() => setIsCreateEventModalOpen(false)}
                        onCreate={handleCreateEvent}
                    />}
                    {isPublishPlanModalOpen && isAdminLoggedIn && <PublishReadingPlanModal
                        onClose={() => setIsPublishPlanModalOpen(false)}
                        onPublish={handlePublishPlan}
                    />}
                </AnimatePresence>
                    
            </div>
        </AppContext.Provider>
    );
}