import { createContext, useContext, useState, useCallback, useRef } from 'react';

const MascotContext = createContext(null);
const DISMISS_KEY = 'sofi_dismissed_today';
const GREETED_KEY = 'sofi_greeted_today';

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Banco de eventos: cada uno con 2-3 variantes de frase, un mood, y una
// acción opcional (botón rápido que navega a la sección relevante).
export const MASCOT_EVENTS = {
  logro: {
    mood: 'celebrando',
    variants: [
      '¡Has ganado una nueva insignia! 🌟',
      '¡Wow, insignia nueva en tu colección! 🏆',
      '¡Lo lograste! Esa insignia ya es tuya. ✨',
    ],
  },
  juego_ok: {
    mood: 'animando',
    variants: [
      '¡Bien jugado! Sigue así. 📚',
      '¡Excelente puntaje! Se nota que practicas. 🎉',
      '¡Así se hace! Vamos por el siguiente juego. 🙌',
    ],
  },
  juego_animo: {
    mood: 'animando',
    variants: [
      '¡Inténtalo de nuevo, seguro que mejoras! 💪',
      'Casi lo tienes, ¡una vez más! 🦊',
      'No pasa nada, cada intento cuenta. ¡Tú puedes! ✨',
    ],
  },
  reto_completo: {
    mood: 'celebrando',
    variants: [
      '¡Has completado un reto de lectura! 🎯',
      '¡Reto superado! Eres un lector imparable. 📖',
      '¡Lo lograste! Ese reto ya quedó en el pasado. 🎉',
    ],
    action: { label: 'Ver mis retos', to: '/club-de-lectura/retos' },
  },
  diploma: {
    mood: 'celebrando',
    variants: [
      '¡Has obtenido un diploma! 🏅',
      '¡Felicitaciones, tienes un diploma nuevo! 🎓',
      '¡Qué orgullo! Un diploma más para ti. 🏅',
    ],
    action: { label: 'Ver mi diploma', to: '/perfil/diplomas' },
  },
  curiosidad: {
    mood: 'curiosa',
    variants: [
      'Aquí hay algo interesante para ti. 👀',
      '¿Ya viste esta sección? Te va a gustar. ✨',
      'Ven, te muestro algo por aquí. 🦊',
    ],
  },
};

// Frases sueltas para cuando el usuario toca a Sofi sin que haya un evento
// activo — así siempre tiene algo que decir, no se queda muda.
export const IDLE_CHATTER = [
  '¿Buscamos tu próxima lectura? 📖',
  '¡Hola! ¿Ya viste los libros nuevos de esta semana? 🦊',
  '¿Sabías que puedes ganar insignias jugando? 🏅',
  'Cuéntame, ¿qué te gustaría leer hoy? ✨',
  '¡Aquí estoy! Toca el ícono de juegos si quieres divertirte un rato. 🎮',
  '¿Ya revisaste tu plan de lectura? Puede que tengas algo pendiente. 📚',
];

export function MascotProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [mood, setMood] = useState('neutral');
  const [action, setAction] = useState(null);
  const [visible, setVisible] = useState(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const today = new Date().toDateString();
      return dismissed !== today;
    }
    return true;
  });

  // Ref al timeout activo: si llega un mensaje nuevo antes de que expire el anterior,
  // hay que cancelar el timer viejo o terminaría borrando el mensaje nuevo antes de tiempo.
  const hideTimerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setMessage(null);
    setAction(null);
  }, []);

  const dismissToday = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, new Date().toDateString());
  }, []);

  const showMessage = useCallback((text, newMood = 'curiosa', duration = 5000, newAction = null) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setMessage(text);
    setMood(newMood);
    setAction(newAction);
    setVisible(true);
    if (duration > 0) {
      hideTimerRef.current = setTimeout(() => {
        setMessage(null);
        setMood('neutral');
        setAction(null);
        hideTimerRef.current = null;
      }, duration);
    }
  }, []);

  // React acepta un segundo argumento opcional para forzar un mensaje personalizado
  // (se conserva el mood/acción del evento salvo que no exista definición).
  const react = useCallback((eventType, customMessage = null) => {
    const def = MASCOT_EVENTS[eventType];
    const msg = customMessage || (def ? pick(def.variants) : '¡Qué bien! 😊');
    const nextMood = def?.mood || 'curiosa';
    const nextAction = def?.action || null;
    showMessage(msg, nextMood, 5000, nextAction);
  }, [showMessage]);

  const sayHi = useCallback((name, extra = '') => {
    // No repetir el saludo si Sofi ya saludó hoy en esta sesión (ida y vuelta al Home).
    const today = new Date().toDateString();
    if (localStorage.getItem(GREETED_KEY) === today) return;
    localStorage.setItem(GREETED_KEY, today);

    const hour = new Date().getHours();
    let greetings = ['Buenas noches'];
    if (hour < 12) greetings = ['Buenos días', '¡Buenos días', 'Qué bueno verte esta mañana'];
    else if (hour < 19) greetings = ['Buenas tardes', '¡Hola de nuevo', 'Qué alegría verte por la tarde'];
    else greetings = ['Buenas noches', 'Hola, noctámbulo lector', '¡Qué bueno tenerte por aquí'];

    let text = `${pick(greetings)}, ${name}! 🦊`;
    let extraAction = null;
    if (extra && typeof extra === 'object') {
      if (extra.text) text += ` ${extra.text}`;
      extraAction = extra.action || null;
    } else if (extra) {
      text += ` ${extra}`;
    }
    showMessage(text, 'animando', 6000, extraAction);
  }, [showMessage]);

  return (
    <MascotContext.Provider value={{ message, mood, action, visible, sayHi, react, dismiss, dismissToday, showMessage }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error('useMascot debe usarse dentro de MascotProvider');
  return ctx;
}
