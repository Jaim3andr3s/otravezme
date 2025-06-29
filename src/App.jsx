// --- IMPORTACIONES ---
// React, hooks, y librerías para animación e iconos.
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Book, Award, Users, User, Sun, Moon, Menu, X,
    Sparkles, BookHeart, Wind, Feather, Star, XCircle,
    Search, Calendar, MessageSquare, BookOpenCheck, ChevronRight,
    PlayCircle, PauseCircle, StopCircle, UserSquare2, BrainCircuit, Loader2,
    Wand2, MessageCircleHeart, StarHalf, Mic, Badge,
    ShieldCheck, Gem, Rocket, Send, ThumbsUp, ThumbsDown, MessageCircleQuestion,
    Gamepad2, Palette, Trophy, Loader, ChevronLeft, Volume2, VolumeX, Eraser, Check
} from 'lucide-react';

// --- CONTEXTO DE LA APLICACIÓN ---
// MEJORA: Ahora también gestiona favoritos, XP y el avatar del usuario.
const AppContext = createContext();

// --- DATOS AMPLIADOS Y ENRIQUECIDOS DE LA BIBLIOTECA ---
const masterBookList = [
    { id: 1, title: 'El Principito', author: 'Antoine de Saint-Exupéry', category: 'Infantil', cover: 'https://images.cdn1.buscalibre.com/fit-in/360x360/34/29/34292c8e89f726f2ef8924073ff4c382.jpg', description: 'Un cuento poético y filosófico sobre la amistad, el amor y la pérdida.', status: 'Disponible', ageRange: '8-12 años', isStaffPick: false, readOnlineUrl: 'https://web.seducoahuila.gob.mx/biblioweb/upload/el%20principito.pdf', dateAdded: '2025-06-20T10:00:00Z', rating: 4.9, reviews: 124 },
    { id: 2, title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', category: 'Novela', cover: 'https://images.cdn3.buscalibre.com/fit-in/520x520/90/d6/90d6455083f95cb36dc10052fe29f2ea.jpg', description: 'La obra maestra del realismo mágico que narra la historia de la familia Buendía en Macondo.', status: 'Disponible', ageRange: 'Adultos', isStaffPick: true, readOnlineUrl: 'https://www.secst.cl/upfiles/documentos/19072016_1207am_578dc39115fe9.pdf', dateAdded: '2025-06-18T10:00:00Z', rating: 4.8, reviews: 210 },
    { id: 3, title: 'Cartilla "Aprende a Leer"', author: 'Recurso Educativo Abierto', category: 'Aprender a leer', cover: 'https://panamericana.vtexassets.com/arquivos/ids/333632/nacho-libro-inicial-de-lectura-9789580700425.jpg?v=637010406948870000', description: 'Una cartilla de dominio público con ejercicios para guiar a los nuevos lectores.', status: 'Disponible', ageRange: '4-7 años', isStaffPick: true, readOnlineUrl: 'https://www.suescun.com.co/wp-content/uploads/2022/06/Cartilla-Nacho-PDF.pdf', dateAdded: '2025-06-15T10:00:00Z', rating: 4.5, reviews: 45 },
    { id: 4, title: '¿A qué sabe la luna?', author: 'Michael Grejniec', category: 'Infantil', cover: 'https://images.cdn1.buscalibre.com/fit-in/360x360/16/8b/168b4cca7ee5e4ba2aaff982778ce1dd.jpg', description: 'Un maravilloso cuento sobre la cooperación para alcanzar un sueño común.', status: 'Disponible', ageRange: '3-6 años', isStaffPick: false, readOnlineUrl: 'https://jmhuarte.educacion.navarra.es/web1/wp-content/uploads/2020/04/A-QUE-SABE-LA-LUNA-PDF.pdf.pdf.pdf', dateAdded: '2025-06-12T10:00:00Z', rating: 4.9, reviews: 98 },
    { id: 5, title: 'El Monstruo de Colores', author: 'Anna Llenas', category: 'Infantil', cover: 'https://images.cdn2.buscalibre.com/fit-in/360x360/cc/12/cc12b7f5a825d75f07d9ec7ad393d8a8.jpg', description: 'Una encantadora historia que ayuda a los niños a identificar y gestionar sus emociones a través de colores.', status: 'Disponible', ageRange: '3-6 años', isStaffPick: true, readOnlineUrl: 'https://www.educacionbc.edu.mx/materialdeapoyo/public/site/pdf/educacionbasica/preescolar/libromonstruodecolores.pdf', dateAdded: '2025-07-01T10:00:00Z', rating: 4.8, reviews: 150 },
    { id: 6, title: 'Donde viven los monstruos', author: 'Maurice Sendak', category: 'Infantil', cover: 'https://0.academia-photos.com/attachment_thumbnails/64582498/mini_magick20201002-15602-8t9qco.png?1601657771', description: 'La historia de Max y su viaje a una isla habitada por monstruos, explorando de forma magistral las emociones infantiles.', status: 'Prestado', ageRange: '4-8 años', isStaffPick: false, readOnlineUrl: 'https://www.formarse.com.ar/libros/Libros-recomendados-pdf/Donde%20viven%20los%20monstruos-Maurice%20Sendak.pdf', dateAdded: '2025-06-10T10:00:00Z', rating: 4.7, reviews: 88 },
    { id: 7, title: 'Breve historia del tiempo', author: 'Stephen Hawking', category: 'Ciencia', cover: 'https://images.cdn2.buscalibre.com/fit-in/360x360/b2/f6/b2f6f1943485f7c3527a44f808546b53.jpg', description: 'Una introducción accesible a los misterios del universo, desde el Big Bang hasta los agujeros negros.', status: 'Disponible', ageRange: 'Jóvenes y Adultos', isStaffPick: true, readOnlineUrl: 'https://www.fisica.net/relatividad/stephen_hawking_-_historia_del_tiempo.pdf', dateAdded: '2025-05-28T10:00:00Z', rating: 4.9, reviews: 180 },
    { id: 9, title: 'Fahrenheit 451', author: 'Ray Bradbury', category: 'Ciencia Ficción', cover: 'https://images.cdn3.buscalibre.com/fit-in/360x360/23/e3/23e3b0699ae46fc450e85f4354328c3a.jpg', description: 'Una novela distópica que presenta una sociedad futura donde los libros están prohibidos.', status: 'Disponible', ageRange: 'Jóvenes y Adultos', isStaffPick: false, readOnlineUrl: 'https://proletarios.org/books/Bradbury-Fahrenheit-451-novela-grafica.pdf', dateAdded: '2025-07-02T11:00:00Z', rating: 4.7, reviews: 195 },
    { id: 10, title: 'El Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasía', cover: 'https://online.fliphtml5.com/mpfea/buqd/files/large/1.webp?1592859127&1592859127', description: 'La aventura de Bilbo Bolsón, un hobbit que se embarca en un viaje inesperado para recuperar un tesoro.', status: 'Disponible', ageRange: 'Jóvenes y Adultos', isStaffPick: true, readOnlineUrl: 'https://web.seducoahuila.gob.mx/biblioweb/upload/J.R.R.%20Tolkien%20-%20El%20Hobbit.pdf', dateAdded: '2025-07-05T10:00:00Z', rating: 4.9, reviews: 320 },
    { id: 11, title: 'Harry Potter y la piedra filosofal', author: 'J.K. Rowling', category: 'Fantasía', cover: 'https://www.tornamesa.co/imagenes/9789585/978958523404.GIF', description: 'El inicio de la saga del joven mago que descubre su verdadera identidad y su destino en Hogwarts.', status: 'Prestado', ageRange: '10-14 años', isStaffPick: false, readOnlineUrl: 'https://biblioteca-digital.universidadcolumbia.edu.mx/acervo/LITERATURA/Harry_Potter_y_la_Piedra_Filosofal-J_K_Rowling.pdf', dateAdded: '2025-07-04T10:00:00Z', rating: 4.9, reviews: 450 },
    { id: 12, title: 'Poesía Completa', author: 'Jorge Luis Borges', category: 'Poesía', cover: 'https://images.cdn3.buscalibre.com/fit-in/360x360/b1/4b/b14bf4593f0b2f70b616421c97ac388a.jpg', description: 'Una recopilación esencial de la obra poética de uno de los escritores más influyentes del siglo XX.', status: 'Disponible', ageRange: 'Adultos', isStaffPick: true, readOnlineUrl: '#', dateAdded: '2025-04-20T10:00:00Z', rating: 4.8, reviews: 130 },
    { id: 13, title: 'Cosmos', author: 'Carl Sagan', category: 'Ciencia', cover: 'https://images.cdn1.buscalibre.com/fit-in/360x360/a6/53/a6532454a8e6f1f440536c642878c75d.jpg', description: 'Un viaje inspirador a través del espacio y el tiempo, explorando las maravillas del universo.', status: 'Disponible', ageRange: 'Jóvenes y Adultos', isStaffPick: false, readOnlineUrl: '#', dateAdded: '2025-03-10T10:00:00Z', rating: 5.0, reviews: 255 },
];

// --- NUEVO: Datos para Citas Célebres y Autores ---
const quotes = [
    { quote: "Un lector vive mil vidas antes de morir... El que nunca lee vive solo una.", author: "George R.R. Martin" },
    { quote: "Siempre imaginé que el Paraíso sería algún tipo de biblioteca.", author: "Jorge Luis Borges" },
    { quote: "Los libros son espejos: sólo se ve en ellos lo que uno ya lleva dentro.", author: "Carlos Ruiz Zafón" },
    { quote: "No hay amigo tan leal como un libro.", author: "Ernest Hemingway" }
];

const authors = [
    { id: 1, name: 'Gabriel García Márquez', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Gabriel_Garcia_Marquez.jpg/800px-Gabriel_Garcia_Marquez.jpg', bio: 'Escritor colombiano, premio Nobel de Literatura en 1982. Figura central del realismo mágico, su obra "Cien Años de Soledad" es un hito de la literatura universal.', books: [2] },
    { id: 2, name: 'J.R.R. Tolkien', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/J._R._R._Tolkien%2C_1940s.jpg/800px-J._R._R._Tolkien%2C_1940s.jpg', bio: 'Escritor y filólogo británico, conocido por sus obras de fantasía épica "El Hobbit" y "El Señor de los Anillos".', books: [10] },
    { id: 3, name: 'J.K. Rowling', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/J._K._Rowling_2010.jpg/800px-J._K._Rowling_2010.jpg', bio: 'Autora británica, creadora de la mundialmente famosa saga de Harry Potter, que ha inspirado a una generación de lectores.', books: [11] },
    { id: 4, name: 'Carl Sagan', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Carl_Sagan_in_1980.jpg/800px-Carl_Sagan_in_1980.jpg', bio: 'Astrónomo y divulgador científico. Su libro y serie "Cosmos" acercaron las maravillas del universo a millones de personas.', books: [13] }
];

// NUEVO: Avatares disponibles
const avatars = [
    { id: 'avatar1', name: 'Explorador', src: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Annie&flip=true' },
    { id: 'avatar2', name: 'Mago', src: 'https://api.dicebear.com/8.x/bottts/svg?seed=Bandit&mouth=smile&eyes=hearts' },
    { id: 'avatar3', name: 'Estudiante', src: 'https://api.dicebear.com/8.x/fun-emoji/svg?seed=Princess&eyes=closed&mouth=cute' },
    { id: 'avatar4', name: 'Sabio', src: 'https://api.dicebear.com/8.x/notionists/svg?seed=Buddy&glasses=true' },
    { id: 'avatar5', name: 'Artista', src: 'https://api.dicebear.com/8.x/personas/svg?seed=Felix&earrings=true' },
    { id: 'avatar6', name: 'Científico', src: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Leo&accessories=true&beard=true' },
];

// Palabras para el juego "Adivina la Palabra"
const gameWords = [
    { word: "BIBLIOTECA", hint: "Un lugar lleno de libros." },
    { word: "LECTURA", hint: "La acción de descifrar letras." },
    { word: "NOVELA", hint: "Un género literario extenso." },
    { word: "POESIA", hint: "Arte de expresar la belleza por medio de la palabra." },
    { word: "AUTOR", hint: "Quien escribe un libro." },
    { word: "IMAGINACION", hint: "Lo que se usa para crear historias." },
    { word: "CUENTO", hint: "Una narración breve." },
    { word: "CONOCIMIENTO", hint: "Lo que adquieres al leer." }
];


// --- HOOKS MEJORADOS Y NUEVOS ---
const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState([]);
    const [spanishVoice, setSpanishVoice] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false); // Nuevo estado para silenciar

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                const esVoice = availableVoices.find(v => v.lang.startsWith('es-')) || availableVoices.find(v => v.lang.startsWith('es'));
                setVoices(availableVoices);
                setSpanishVoice(esVoice);
                setIsLoading(false);
                speechSynthesis.onvoiceschanged = null; // Remove listener after loading
            }
        };

        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            speechSynthesis.cancel();
        }
    }, []);

    const speak = (text) => {
        if (isLoading || !text || isMuted) return; // No hablar si está silenciado

        if (speechSynthesis.paused && isPaused) {
            speechSynthesis.resume();
            setIsPaused(false);
            return;
        }

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (spanishVoice) {
            utterance.voice = spanishVoice;
            utterance.lang = spanishVoice.lang;
        } else {
            utterance.lang = 'es-ES';
        }
        utterance.pitch = 1;
        utterance.rate = 1;

        utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
        utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
        utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };

        speechSynthesis.speak(utterance);
    };

    const pause = () => {
        if (isSpeaking && !isPaused) {
            speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const cancel = () => {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const toggleMute = () => { // Nueva función para silenciar/desilenciar
        if (!isMuted) {
            cancel(); // Detener cualquier habla actual si se va a silenciar
        }
        setIsMuted(prev => !prev);
    };

    return { speak, pause, cancel, isSpeaking, isPaused, isLoading, isMuted, toggleMute };
};


// --- NUEVO: Hook para la lógica del Asistente (Chatbot) ---
const useChatbot = () => {
    const [messages, setMessages] = useState([{ from: 'bot', text: '¡Hola! Soy BiblioBot. ¿En qué te puedo ayudar?' }]);
    const [isTyping, setIsTyping] = useState(false);
    const sendMessage = async (text) => {
        setMessages(prev => [...prev, { from: 'user', text }]);
        setIsTyping(true);
        try {
            const aiPrompt = `Eres BiblioBot, un asistente amigable. Responde de forma breve y útil. El usuario dijo: "${text}"`;
            const payload = { contents: [{ role: "user", parts: [{ text: aiPrompt }] }] };
            const apiKey = ""; // Dejar vacío para que el entorno lo gestione
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude procesar eso.';
            setMessages(prev => [...prev, { from: 'bot', text: botResponse }]);
        } catch (error) {
            console.error("Error en chatbot:", error);
            setMessages(prev => [...prev, { from: 'bot', text: 'Hay un problema de conexión.' }]);
        } finally {
            setIsTyping(false);
        }
    };
    return { messages, sendMessage, isTyping }; 
};

// --- COMPONENTES REUTILIZABLES ---

const SplashScreen = () => (
    <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, transition: { delay: 2.5, duration: 0.5 } }}
        className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-[200]"
    >
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.5 } }}
        >
            <BookHeart size={80} className="text-indigo-500" />
        </motion.div>
        <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 1.2 } }}
            className="mt-6 text-3xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500"
        >
            BiblioSueños
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400">Tu comunidad para leer y soñar.</p>
    </motion.div>
);

const StarRating = ({ rating, totalReviews }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} size={16} className="text-amber-400 fill-amber-400" />)}
                {hasHalfStar && <StarHalf size={16} className="text-amber-400 fill-amber-400" />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} size={16} className="text-gray-300 dark:text-gray-600" />)}
            </div>
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span>({totalReviews} reseñas)</span>
        </div>
    );
};

const BookModal = ({ book, onClose, onVote, onToggleFavorite, isFavorite, onBookReadComplete }) => {
    if (!book) return null;
    const { speak, pause, cancel, isSpeaking, isPaused, isLoading: isVoiceLoading, isMuted, toggleMute } = useSpeechSynthesis();
    const [voted, setVoted] = useState(null);
    const [hasRead, setHasRead] = useState(false); // Estado para simular la lectura

    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    const handleVote = (type) => {
        if (!voted) {
            onVote(book.id, type);
            setVoted(type);
        }
    };

    // Simular que el libro se ha "leído" al abrir el modal y luego cerrarlo
    const handleCloseModal = () => {
        if (!hasRead) {
            onBookReadComplete(book.id);
            setHasRead(true);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
                onClick={handleCloseModal} // Usar el nuevo manejador de cierre
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate font-poppins">{book.title}</h2>
                        <button onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors">
                            <XCircle size={28} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 grid md:grid-cols-10 gap-8 overflow-y-auto">
                        <div className="md:col-span-3 flex flex-col items-center">
                            <motion.img
                                src={book.cover}
                                alt={`Portada de ${book.title}`}
                                className="rounded-lg shadow-lg w-full max-w-xs object-cover aspect-[2/3]"
                                layoutId={`book-cover-${book.id}`}
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x450/cccccc/ffffff?text=Imagen+no+disponible'; }}
                            />
                        </div>
                        <div className="md:col-span-7 flex flex-col space-y-4">
                            <div>
                                <h3 className="text-4xl font-extrabold text-gray-800 dark:text-white font-poppins">{book.title}</h3>
                                <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <StarRating rating={book.rating} totalReviews={book.reviews} />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">¿Te gustó?</span>
                                        <button onClick={() => handleVote('up')} disabled={!!voted} className={`p-2 rounded-full transition-colors ${voted === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-green-100 disabled:opacity-50'}`}>
                                            <ThumbsUp size={18} />
                                        </button>
                                        <button onClick={() => handleVote('down')} disabled={!!voted} className={`p-2 rounded-full transition-colors ${voted === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-red-100 disabled:opacity-50'}`}>
                                            <ThumbsDown size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className={`text-gray-600 dark:text-gray-300 transition-colors duration-300 ${isSpeaking && !isPaused ? 'text-indigo-600 dark:text-indigo-300' : ''}`}>
                                    {book.description}
                                </p>
                                <div className="flex items-center gap-2 pt-2">
                                    <button onClick={() => speak(book.description)} disabled={isVoiceLoading || (isSpeaking && !isPaused) || isMuted} className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-200 transition-colors">
                                        {isVoiceLoading ? <Loader2 size={16} className="animate-spin" /> : isSpeaking && !isPaused ? <Mic size={16} /> : <PlayCircle size={16} />}
                                        {isVoiceLoading ? 'Cargando...' : isSpeaking && !isPaused ? 'Hablando...' : 'Escuchar'}
                                    </button>
                                    <button onClick={pause} disabled={!isSpeaking || isPaused || isMuted} className="flex items-center gap-1 text-sm text-yellow-600 disabled:opacity-50"><PauseCircle size={18} /> Pausar</button>
                                    <button onClick={cancel} disabled={!isSpeaking && !isPaused || isMuted} className="flex items-center gap-1 text-sm text-red-600 disabled:opacity-50"><StopCircle size={18} /> Detener</button>
                                    <button onClick={toggleMute} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        {isMuted ? 'Desmutear' : 'Mutear'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200"><MessageCircleHeart size={20} /> Reseñas de la Comunidad</h4>
                                <div className="space-y-3 max-h-32 overflow-y-auto pr-2">
                                    <div className="text-sm p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <p className="text-gray-600 dark:text-gray-300">"Una obra que te cambia la perspectiva. La narrativa es simplemente sublime."</p>
                                        <p className="font-semibold text-gray-500 dark:text-gray-400 text-right mt-1">- Lector Anónimo</p>
                                    </div>
                                    <div className="text-sm p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <p className="text-gray-600 dark:text-gray-300">"Perfecto para leer con los niños antes de dormir. ¡Nos encantó!"</p>
                                        <p className="font-semibold text-gray-500 dark:text-gray-400 text-right mt-1">- Familia G.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                <a href={book.readOnlineUrl} target="_blank" rel="noopener noreferrer" className="flex-grow text-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                                    <BookOpenCheck size={20} />
                                    {book.readOnlineUrl.includes('youtube') ? 'Ver Video-Cuento' : 'Leer Online'}
                                </a>
                                <button onClick={() => onToggleFavorite(book.id)} className={`p-3 rounded-lg border-2 transition-colors ${isFavorite ? 'bg-pink-500 border-pink-500 text-white' : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-pink-400 hover:text-pink-400'}`} title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
                                    <BookHeart size={20} className={isFavorite ? 'fill-current' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const BookCard = ({ book, onCardClick }) => (
    <motion.div
        className="cursor-pointer group relative"
        onClick={() => onCardClick(book)}
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300 }}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
        {book.isStaffPick && (
            <div className="absolute top-2 right-2 bg-amber-400 text-white p-2 rounded-full z-10 shadow-lg" title="Selección del Equipo">
                <Star size={16} />
            </div>
        )}
        <motion.img
            src={book.cover}
            alt={`Portada de ${book.title}`}
            className="rounded-lg shadow-lg group-hover:shadow-xl transition-shadow w-full h-auto aspect-[2/3] object-cover bg-gray-200"
            layoutId={`book-cover-${book.id}`}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x450/cccccc/ffffff?text=Error'; }}
        />
        <h3 className="mt-3 font-bold text-gray-800 dark:text-white group-hover:text-indigo-500 transition-colors truncate">{book.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
    </motion.div>
);

const PageHeader = ({ title, subtitle, icon: Icon }) => (
    <div className="mb-12 text-center">
        {Icon && <Icon size={48} className="mx-auto text-indigo-400 mb-4" />}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-poppins">{title}</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{subtitle}</p>
    </div>
);

const QuoteOfTheDay = () => {
    const [quote, setQuote] = useState({ quote: '', author: '' });

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <div className="my-16 text-center bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl">
            <blockquote className="text-xl italic text-gray-700 dark:text-gray-300">"{quote.quote}"</blockquote>
            <cite className="block mt-2 text-md text-gray-500 dark:text-gray-400 font-semibold">- {quote.author}</cite>
        </div>
    );
}

// --- PÁGINAS DE LA APLICACIÓN ---

const HomePage = ({ onNavigate, onBookClick }) => {
    const { books } = useContext(AppContext);
    const newestBooks = [...books].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);
    const bookOfTheDay = books.find(b => b.id === 5) || books[0];

    return (
        <div>
            <div className="text-center p-10 md:p-16 bg-gradient-to-br from-indigo-100 to-pink-100 dark:from-gray-800 dark:to-indigo-900/50 rounded-3xl mb-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full filter blur-2xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-300/20 dark:bg-pink-500/10 rounded-full filter blur-3xl opacity-60 translate-x-1/4 translate-y-1/4"></div>
                <motion.h1
                    className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white font-poppins relative"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >
                    BiblioYene
                </motion.h1>
                <motion.p
                    className="mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto relative"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                >
                    Tu espacio de encuentro con la imaginación, el conocimiento y la comunidad. 
                </motion.p>
            </div>

            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white font-poppins flex items-center gap-3"><Star className="text-amber-400" /> Libro del Día</h2>
                <div onClick={() => onBookClick(bookOfTheDay)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-8 cursor-pointer hover:shadow-xl transition-shadow border border-transparent hover:border-indigo-300 dark:hover:border-indigo-600">
                    <motion.img src={bookOfTheDay.cover} layoutId={`book-cover-${bookOfTheDay.id}-day`} className="w-32 h-auto rounded-lg shadow-md" />
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{bookOfTheDay.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-semibold mb-2">{bookOfTheDay.author}</p>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-lg">{bookOfTheDay.description}</p>
                        <StarRating rating={bookOfTheDay.rating} totalReviews={bookOfTheDay.reviews} />
                    </div>
                </div>
            </section>

            <QuoteOfTheDay />

            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white font-poppins">Recién Llegados</h2>
            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10"
                initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
            >
                {newestBooks.map(book => <BookCard key={book.id} book={book} onCardClick={onBookClick} />)}
            </motion.div>
        </div>
    );
};

const AiStoryGeneratorPage = () => {
    const [prompt, setPrompt] = useState('');
    const [story, setStory] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => { // Marked as async
        if (!prompt) return;
        setIsLoading(true);
        setStory('');

        try {
            let chatHistory = [];
            // Create a more engaging prompt for the AI
            const aiPrompt = `Genera un cuento corto y creativo basado en la siguiente idea, que sea apto para niños y contenga un mensaje positivo. La idea principal es: "${prompt}". Debe tener una extensión de unos 3-5 párrafos.`;
            chatHistory.push({ role: "user", parts: [{ text: aiPrompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json(); // Await the JSON parsing
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setStory(text);
            } else {
                console.error("AI response structure is unexpected or content is missing:", result);
                setStory("Lo siento, no pude generar una historia con esa idea. Intenta con algo diferente.");
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setStory("Hubo un error al generar la historia. Por favor, inténtalo de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <PageHeader title="Crea tu Propio Cuento" subtitle="Escribe una idea y deja que la magia de la IA cree una historia única para ti." icon={Wand2} />
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ej: un dragón que horneaba galletas, una princesa astronauta..."
                        className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        rows="3"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        {isLoading ? 'Creando Magia...' : 'Generar Historia'}
                    </button>
                </div>

                {story && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-l-4 border-indigo-400"
                    >
                        <h4 className="font-bold text-lg mb-2">Tu Historia:</h4>
                        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{story}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};


const CatalogPage = ({ onBookClick }) => {
    const { books } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const categories = ['Todos', ...new Set(books.map(book => book.category))];

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || book.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            <PageHeader title="Nuestro Catálogo" subtitle="Encuentra tu próxima aventura entre nuestras estanterías virtuales." icon={Book} />
            <div className="mb-8 flex flex-col md:flex-row gap-4 sticky top-[85px] bg-gray-100/80 dark:bg-gray-950/80 backdrop-blur-sm py-4 z-20">
                <div className="relative flex-grow">
                    <input type="text" placeholder="Busca por título o autor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    />
                    <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            <div className="mb-8 flex items-center justify-center flex-wrap gap-2">
                {categories.map(category => (
                    <button key={category} onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${selectedCategory === category ? 'bg-indigo-600 text-white shadow-md scale-110' : 'bg-white dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            {filteredBooks.length > 0 ? (
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10"
                    initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredBooks.map(book => <BookCard key={book.id} book={book} onCardClick={onBookClick} />)}
                </motion.div>
            ) : (
                <p className="text-center text-gray-500 mt-16">No se encontraron libros que coincidan con tu búsqueda.</p>
            )}
        </div>
    );
};

const AuthorsPage = ({ onBookClick }) => {
    const { books } = useContext(AppContext);

    return (
        <div>
            <PageHeader title="Autores Destacados" subtitle="Conoce a las mentes maestras detrás de tus historias favoritas." icon={Feather} />
            <div className="space-y-12">
                {authors.map(author => (
                    <motion.div
                        key={author.id}
                        className="grid md:grid-cols-3 gap-8 items-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5 }}
                    >
                        <img src={author.image} alt={author.name} className="rounded-full w-40 h-40 object-cover mx-auto md:mx-0 shadow-md border-4 border-white dark:border-gray-700" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/160x160/cccccc/ffffff?text=Autor'; }} />
                        <div className="md:col-span-2 text-center md:text-left">
                            <h3 className="text-3xl font-bold font-poppins text-indigo-600 dark:text-indigo-400">{author.name}</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">{author.bio}</p>
                            <div className="mt-4">
                                <h4 className="font-bold text-sm uppercase text-gray-500">Libros en nuestra colección:</h4>
                                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                                    {author.books.map(bookId => {
                                        const book = books.find(b => b.id === bookId);
                                        return book ? (
                                            <button key={bookId} onClick={() => onBookClick(book)} className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">
                                                {book.title}
                                            </button>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
};


const ProfilePage = () => {
    const { favorites, books, onBookClick, user, setUser } = useContext(AppContext);
    const favoriteBooks = books.filter(book => favorites.includes(book.id));

    // Calculate level based on XP (example: 100 XP per level)
    const level = Math.floor(user.xp / 100) + 1;
    const xpForNextLevel = 100;
    const xpProgress = (user.xp % 100); // XP within current level

    const badges = [
        { id: 1, icon: BookHeart, name: "Lector Pionero", description: "Leíste tu primer libro", color: "text-pink-500", condition: user.booksRead > 0 },
        { id: 2, icon: Rocket, name: "Viajero de Géneros", description: "Exploraste 3 géneros", color: "text-purple-500", condition: user.booksRead >= 3 }, // Simplified condition
        { id: 3, icon: ShieldCheck, name: "Héroe del Verano", description: "Completaste el reto de verano", color: "text-green-500", condition: user.xp >= 300 }, // Example XP condition
        { id: 4, icon: Gem, name: "Amigo de la Biblioteca", description: "Participaste en un evento", color: "text-sky-500", condition: user.playedGames > 0 }, // Example: played at least one game
    ];

    const handleAvatarSelect = (avatarId) => {
        setUser(prevUser => ({ ...prevUser, avatar: avatarId }));
    };

    const currentAvatar = avatars.find(a => a.id === user.avatar) || avatars[0];

    return (
        <div>
            <PageHeader title="Mi Perfil" subtitle="¡Hola, Lector Entusiasta! Aquí puedes ver tu progreso y tus logros." icon={User} />

            <div className="max-w-5xl mx-auto space-y-16">
                {/* Sección de Avatar y Progreso XP */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0 relative">
                        <img src={currentAvatar.src} alt="User Avatar" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-indigo-400 shadow-xl" />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => document.getElementById('avatar-modal').showModal()} // Abre el modal de avatares
                            className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 border-2 border-white dark:border-gray-800 shadow-md hover:bg-indigo-700 transition-colors"
                            title="Cambiar avatar"
                        >
                            <Palette size={20} />
                        </motion.button>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white font-poppins">{user.name}</h2>
                        <div className="mt-4">
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Nivel: {level}</p>
                            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 mt-2">
                                <motion.div
                                    className="bg-indigo-500 h-3 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(xpProgress / xpForNextLevel) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                ></motion.div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{xpProgress} / {xpForNextLevel} XP para el siguiente nivel</p>
                        </div>
                        <p className="text-md text-gray-600 dark:text-gray-400 mt-4">Libros leídos: <span className="font-bold text-indigo-500">{user.booksRead}</span></p>
                        <p className="text-md text-gray-600 dark:text-gray-400">Juegos completados: <span className="font-bold text-indigo-500">{user.gamesCompleted}</span></p>
                    </div>
                </div>

                {/* Modal de selección de avatar */}
                <dialog id="avatar-modal" className="modal bg-black bg-opacity-50">
                    <div className="modal-box bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-lg mx-auto">
                        <h3 className="font-bold text-2xl mb-6 text-gray-900 dark:text-white">Selecciona tu Avatar</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {avatars.map(avatar => (
                                <motion.button
                                    key={avatar.id}
                                    onClick={() => handleAvatarSelect(avatar.id)}
                                    className={`p-2 rounded-full border-4 ${user.avatar === avatar.id ? 'border-indigo-500 ring-4 ring-indigo-300' : 'border-transparent hover:border-indigo-300'}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <img src={avatar.src} alt={avatar.name} className="w-20 h-20 rounded-full object-cover" />
                                </motion.button>
                            ))}
                        </div>
                        <div className="modal-action mt-6">
                            <form method="dialog">
                                <button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">Cerrar</button>
                            </form>
                        </div>
                    </div>
                </dialog>


                {/* Sección de Insignias */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white font-poppins">Mis Insignias</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {badges.map(badge => (
                            <motion.div
                                key={badge.id}
                                className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transition-opacity duration-300 ${badge.condition ? 'opacity-100' : 'opacity-50 grayscale'}`}
                                whileHover={{ scale: badge.condition ? 1.05 : 1 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: badge.condition ? 1 : 0.5, y: 0 }}
                            >
                                <div className={`p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 ${badge.color}`}>
                                    <badge.icon size={40} />
                                </div>
                                <h3 className="font-bold text-gray-800 dark:text-white">{badge.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sección de Libros Favoritos */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white font-poppins">Mis Libros Favoritos</h2>
                    {favoriteBooks.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10"
                            initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        >
                            {favoriteBooks.map(book => <BookCard key={book.id} book={book} onCardClick={onBookClick} />)}
                        </motion.div>
                    ) : (
                        <div className="text-center text-gray-500 bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
                            <BookHeart size={40} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="font-bold text-lg">Aún no tienes favoritos</h3>
                            <p>¡Explora el catálogo y añade los libros que más te gusten!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const CommunityPage = () => {
    const mockEvents = [
        { id: 1, title: 'Club de Lectura "Macondo"', date: 'Sábado 29 Jun, 2025 - 10:00 AM', description: 'Analizaremos "Cien años de soledad".', type: 'Club de Lectura', icon: BookHeart },
        { id: 2, title: 'Taller de Creatividad IA', date: 'Miércoles 2 Jul, 2025 - 4:00 PM', description: 'Aprende a usar nuestro generador de cuentos.', type: 'Taller', icon: Wand2 },
        { id: 3, title: 'Cuentacuentos Mágico', date: 'Viernes 4 Jul, 2025 - 3:00 PM', description: 'Nuestros voluntarios narrarán "¿A qué sabe la luna?".', type: 'Cuentacuentos', icon: Star },
    ];
    return (
        <div>
            <PageHeader title="Nuestra Comunidad" subtitle="Eventos, testimonios y oportunidades para unirte." icon={Users} />
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white font-poppins">Próximos Eventos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockEvents.map(event => (
                    <motion.div
                        key={event.id}
                        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.2), 0 4px 6px -2px rgba(99, 102, 241, 0.1)" }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-full"><event.icon size={24} className="text-indigo-500" /></div>
                            <span className="text-sm font-bold uppercase text-indigo-500">{event.type}</span>
                        </div>
                        <h4 className="font-bold text-xl mt-2 text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2"><Calendar size={14} /> {event.date}</p>
                        <p className="text-gray-600 dark:text-gray-300 mt-3 flex-grow">{event.description}</p>
                        <button className="w-full mt-4 text-center bg-indigo-50 text-indigo-600 font-bold py-2 px-4 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors">
                            Unirse al evento
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const ChatbotWindow = ({ isOpen, onClose }) => {
    const { messages, sendMessage, isTyping } = useChatbot();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-24 right-5 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-96 z-[150]"
                >
                    <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="text-indigo-500" />
                            <h3 className="font-bold text-lg">BiblioBot</h3>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={18} /></button>
                    </header>
                    <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                                <p className={`max-w-[80%] text-sm px-3 py-2 rounded-xl ${msg.from === 'bot' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-indigo-500 text-white'}`}>
                                    {msg.text}
                                </p>
                            </div>
                        ))}
                        {isTyping && <div className="flex justify-start"><Loader2 className="animate-spin text-gray-400 ml-2" /></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="p-2 border-t border-gray-200 dark:border-gray-700 flex gap-2 flex-shrink-0">
                        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe tu pregunta..." className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400" disabled={!input.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// NUEVO: Componente del juego "Adivina la Palabra"
const GuessTheWordGame = () => {
    const { addXp, user } = useContext(AppContext);
    const [currentWord, setCurrentWord] = useState(null);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [message, setMessage] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const maxWrongGuesses = 6;
    const inputRef = useRef(null);

    useEffect(() => {
        startNewGame();
    }, []);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentWord]);

    const startNewGame = () => {
        const randomIndex = Math.floor(Math.random() * gameWords.length);
        setCurrentWord(gameWords[randomIndex]);
        setGuessedLetters([]);
        setWrongGuesses(0);
        setMessage('');
        setIsGameOver(false);
        setWin(false);
    };

    const displayWord = currentWord ? currentWord.word.split('').map(letter =>
        guessedLetters.includes(letter) ? letter : '_'
    ).join(' ') : '';

    const handleGuess = (e) => {
        e.preventDefault();
        const guess = e.target.elements.letterInput.value.toUpperCase();
        e.target.elements.letterInput.value = ''; // Clear input field

        if (isGameOver || !currentWord || !guess.match(/^[A-Z]$/)) {
            setMessage('Por favor, ingresa una sola letra válida (A-Z).');
            return;
        }

        if (guessedLetters.includes(guess)) {
            setMessage(`Ya adivinaste la letra "${guess}".`);
            return;
        }

        setGuessedLetters(prev => [...prev, guess]);

        if (currentWord.word.includes(guess)) {
            setMessage(`¡Correcto! La letra "${guess}" está en la palabra.`);
            if (currentWord.word.split('').every(letter => guessedLetters.includes(letter) || letter === guess)) {
                setMessage('¡Felicidades! ¡Has adivinado la palabra!');
                setWin(true);
                setIsGameOver(true);
                addXp(50); // Ganar XP por completar el juego
            }
        } else {
            setWrongGuesses(prev => prev + 1);
            setMessage(`Incorrecto. La letra "${guess}" no está.`);
            if (wrongGuesses + 1 >= maxWrongGuesses) {
                setMessage(`¡Juego Terminado! La palabra era: ${currentWord.word}`);
                setIsGameOver(true);
                setWin(false);
            }
        }
    };

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
        <div>
            <PageHeader title="Adivina la Palabra" subtitle="¡Demuestra tu conocimiento y gana XP! Adivina la palabra oculta letra por letra." icon={Gamepad2} />
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                <h3 className="text-3xl font-bold font-poppins text-indigo-600 dark:text-indigo-400 mb-4 tracking-wider">{displayWord}</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Pista: {currentWord?.hint}</p>

                <div className="text-lg font-semibold mb-4">
                    Intentos Incorrectos: <span className="text-red-500">{wrongGuesses}</span> / {maxWrongGuesses}
                </div>

                <div className="flex justify-center items-center gap-2 mb-6">
                    {alphabet.map(letter => (
                        <button
                            key={letter}
                            onClick={() => handleGuess({ preventDefault: () => { }, target: { elements: { letterInput: { value: letter } } } })}
                            disabled={guessedLetters.includes(letter) || isGameOver}
                            className={`w-8 h-8 md:w-10 md:h-10 text-sm font-bold rounded-md transition-all
                                ${guessedLetters.includes(letter)
                                    ? currentWord?.word.includes(letter)
                                        ? 'bg-green-200 text-green-800 cursor-not-allowed'
                                        : 'bg-red-200 text-red-800 cursor-not-allowed'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                                } disabled:opacity-50`}
                        >
                            {letter}
                        </button>
                    ))}
                </div>


                <form onSubmit={handleGuess} className="flex gap-2 justify-center mb-6">
                    <input
                        type="text"
                        name="letterInput"
                        maxLength="1"
                        ref={inputRef}
                        className="w-20 text-center text-3xl font-bold p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase"
                        disabled={isGameOver}
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isGameOver}
                    >
                        Adivinar
                    </button>
                </form>

                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 text-lg font-semibold ${win ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {message}
                    </motion.p>
                )}

                {isGameOver && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        onClick={startNewGame}
                        className="mt-8 bg-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700 transition-transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                    >
                        <Gamepad2 size={24} /> Jugar de Nuevo
                    </motion.button>
                )}
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
export default function BiblioSuenosApp() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('inicio');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const [books, setBooks] = useState(masterBookList);
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('biblioFavorites');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });
    const [isChatOpen, setIsChatOpen] = useState(false);

    // NUEVO: Estado del usuario con XP, nivel y avatar
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('biblioUser');
            return savedUser ? JSON.parse(savedUser) : {
                name: 'Lector Entusiasta',
                xp: 0,
                booksRead: 0,
                gamesCompleted: 0,
                avatar: avatars[0].id // Default avatar
            };
        } catch (error) {
            return {
                name: 'Lector Entusiasta',
                xp: 0,
                booksRead: 0,
                gamesCompleted: 0,
                avatar: avatars[0].id
            };
        }
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Guardar los datos del usuario en localStorage
    useEffect(() => {
        try {
            localStorage.setItem('biblioUser', JSON.stringify(user));
        } catch (error) {
            console.error("Error saving user data to localStorage:", error);
        }
    }, [user]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedMode);
    }, []);

    useEffect(() => {
        localStorage.setItem('biblioFavorites', JSON.stringify(favorites));
    }, [favorites]);

    const handleVote = (bookId, type) => {
        setBooks(prevBooks => prevBooks.map(b => {
            if (b.id === bookId) {
                const newRating = type === 'up' ? Math.min(5, b.rating + 0.1) : Math.max(0.1, b.rating - 0.1);
                return { ...b, reviews: b.reviews + 1, rating: parseFloat(newRating.toFixed(2)) };
            }
            return b;
        }));
    };

    const toggleFavorite = (bookId) => {
        setFavorites(prev =>
            prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
        );
    };

    const navigateTo = (page) => {
        setCurrentPage(page);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    // NUEVO: Función para añadir XP
    const addXp = (amount) => {
        setUser(prevUser => ({
            ...prevUser,
            xp: prevUser.xp + amount,
            // Opcional: Si el XP es para un libro leído
            booksRead: currentPage === 'catalogo' || currentPage === 'inicio' ? prevUser.booksRead + 1 : prevUser.booksRead,
            // Opcional: Si el XP es por completar un juego
            gamesCompleted: currentPage === 'jueguitos' ? prevUser.gamesCompleted + 1 : prevUser.gamesCompleted
        }));
    };

    // Función para manejar la finalización de la lectura de un libro
    const handleBookReadComplete = (bookId) => {
        // Asegúrate de que no se agregue XP por el mismo libro múltiples veces si se abre y cierra
        // Aquí simplificamos, asumiendo que al abrir el modal y luego cerrarlo, se "lee"
        // En una app real, podrías tener un botón "Marcar como leído"
        if (!user.readBookIds || !user.readBookIds.includes(bookId)) {
            setUser(prevUser => ({
                ...prevUser,
                xp: prevUser.xp + 20, // Ejemplo: 20 XP por libro leído
                booksRead: prevUser.booksRead + 1,
                readBookIds: [...(prevUser.readBookIds || []), bookId] // Track IDs of read books
            }));
        }
    };


    const renderPage = () => {
        switch (currentPage) {
            case 'inicio': return <HomePage onNavigate={navigateTo} onBookClick={setSelectedBook} />;
            case 'catalogo': return <CatalogPage onBookClick={setSelectedBook} />;
            case 'autores': return <AuthorsPage onBookClick={setSelectedBook} />;
            case 'crear-cuento': return <AiStoryGeneratorPage />;
            case 'comunidad': return <CommunityPage />;
            case 'perfil': return <ProfilePage />;
            case 'jueguitos': return <GuessTheWordGame />; // NUEVO: Página de juegos
            default: return <HomePage onNavigate={navigateTo} onBookClick={setSelectedBook} />;
        }
    };

    const navLinks = [
        { id: 'inicio', text: 'Inicio', icon: Home },
        { id: 'catalogo', text: 'Catálogo', icon: Book },
        { id: 'autores', text: 'Autores', icon: Feather },
        { id: 'crear-cuento', text: 'Crear Cuento', icon: Wand2 },
        { id: 'jueguitos', text: 'Jueguitos', icon: Gamepad2 }, // NUEVO: Enlace a juegos
        { id: 'comunidad', text: 'Comunidad', icon: Users },
        { id: 'perfil', text: 'Mi Perfil', icon: User },
    ];

    const appContextValue = { books, user, setUser, favorites, toggleFavorite, onBookClick: setSelectedBook, addXp };

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <AppContext.Provider value={appContextValue}>
            <div className="bg-gray-100 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Nunito+Sans:wght@400;600;700&display=swap');
                    :root { --font-sans: 'Nunito Sans', sans-serif; --font-display: 'Poppins', sans-serif; }
                    body { font-family: var(--font-sans); }
                    .dark body { background-color: #030712; }
                    h1, h2, h3, h4, .font-poppins { font-family: var(--font-display); }
                    /* Estilos para el modal del avatar */
                    .modal {
                        display: none; /* Hidden by default */
                        position: fixed; /* Stay in place */
                        z-index: 200; /* Sit on top */
                        left: 0;
                        top: 0;
                        width: 100%; /* Full width */
                        height: 100%; /* Full height */
                        overflow: auto; /* Enable scroll if needed */
                        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
                        justify-content: center;
                        align-items: center;
                    }
                    .modal[open] {
                        display: flex;
                    }
                    .modal-box {
                        position: relative;
                        margin: auto;
                        padding: 1.5rem;
                        border-radius: 0.75rem;
                        background-color: #fff; /* Default light mode */
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    }
                    .dark .modal-box {
                        background-color: #1f2937; /* Dark mode background */
                    }
                    .modal-action {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 1.5rem;
                    }
                `}</style>

                <header className="sticky top-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-sm z-50 border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo('inicio')}>
                                <BookHeart size={28} className="text-indigo-500" />
                                <span className="text-xl font-bold text-gray-800 dark:text-white font-poppins">BiblioSueños</span>
                            </div>

                            <nav className="hidden lg:flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                                {navLinks.map(link => (
                                    <button key={link.id} onClick={() => navigateTo(link.id)} className={`relative flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-colors text-sm ${currentPage === link.id ? 'text-indigo-600 dark:text-white' : 'hover:text-black dark:hover:text-white'}`}>
                                        {currentPage === link.id && (
                                            <motion.div layoutId="active-nav-pill" className="absolute inset-0 bg-white dark:bg-indigo-600 rounded-full shadow-md"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                                        )}
                                        <link.icon size={18} className="relative z-10" />
                                        <span className="relative z-10">{link.text}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="flex items-center space-x-2">
                                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2"> <Menu size={24} /> </button>
                            </div>
                        </div>
                    </div>
                </header>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-800 shadow-xl z-[60] p-6"
                        >
                            <nav className="flex flex-col space-y-2">
                                {navLinks.map(link => (
                                    <button key={link.id} onClick={() => navigateTo(link.id)} className={`flex items-center space-x-3 p-3 rounded-lg font-semibold text-lg transition-colors ${currentPage === link.id ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                        <link.icon size={22} />
                                        <span>{link.text}</span>
                                        {currentPage === link.id && <ChevronRight size={20} className="ml-auto" />}
                                    </button>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main className="container mx-auto px-4 py-8 md:py-12 relative z-10 main-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                        >
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <footer className="container mx-auto px-4 py-6 mt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 relative z-10">
                    <p>© {new Date().getFullYear()} BiblioSueños. Un proyecto con ❤️ para la comunidad de Colombia.</p>
                </footer>

                <AnimatePresence>
                    {selectedBook && <BookModal book={books.find(b => b.id === selectedBook.id)} onClose={() => setSelectedBook(null)} onVote={handleVote} onToggleFavorite={toggleFavorite} isFavorite={favorites.includes(selectedBook.id)} onBookReadComplete={handleBookReadComplete} />}
                </AnimatePresence>

                <div className="fixed bottom-5 right-5 z-[100]">
                    <motion.button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110"
                        whileHover={{ rotate: 15 }}
                        title="Abrir Asistente"
                    >
                        {isChatOpen ? <X size={28} /> : <MessageCircleQuestion size={28} />}
                    </motion.button>
                </div>
                <ChatbotWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            </div>
        </AppContext.Provider>
    );
}