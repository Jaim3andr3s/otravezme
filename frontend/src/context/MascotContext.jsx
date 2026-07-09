import { createContext, useContext, useState, useCallback } from 'react';

const MascotContext = createContext(null);
const DISMISS_KEY = 'sofi_dismissed_today';

// Mensajes predefinidos para cada tipo de evento
const DEFAULT_MESSAGES = {
  logro: '¡Has ganado una nueva insignia! 🌟',
  juego_ok: '¡Bien jugado! Sigue así. 📚',
  juego_animo: '¡Inténtalo de nuevo, seguro que mejoras! 💪',
  reto_completo: '¡Has completado un reto de lectura! 🎯',
  diploma: '¡Has obtenido un diploma! 🏅',
  curiosidad: 'Aquí hay algo interesante para ti. 👀',
};

export function MascotProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [mood, setMood] = useState('neutral');
  const [visible, setVisible] = useState(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const today = new Date().toDateString();
      return dismissed !== today;
    }
    return true;
  });

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, new Date().toDateString());
  }, []);

  const showMessage = useCallback((text, newMood = 'curiosa', duration = 5000) => {
    setMessage(text);
    setMood(newMood);
    setVisible(true);
    if (duration > 0) {
      setTimeout(() => {
        setMessage(null);
        setMood('neutral');
      }, duration);
    }
  }, []);

  // React ahora acepta un segundo argumento opcional para mensaje personalizado
  const react = useCallback((eventType, customMessage = null) => {
    const msg = customMessage || DEFAULT_MESSAGES[eventType] || '¡Qué bien!';
    let mood = 'curiosa';
    if (eventType === 'logro' || eventType === 'reto_completo' || eventType === 'diploma') {
      mood = 'celebrando';
    } else if (eventType === 'juego_ok') {
      mood = 'animando';
    } else if (eventType === 'juego_animo') {
      mood = 'animando';
    }
    showMessage(msg, mood, 5000);
  }, [showMessage]);

  const sayHi = useCallback((name, extra = '') => {
    const hour = new Date().getHours();
    let greeting = 'Buenas noches';
    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 19) greeting = 'Buenas tardes';
    let text = `${greeting}, ${name}!`;
    if (extra) text += ` ${extra}`;
    showMessage(text, 'animando', 6000);
  }, [showMessage]);

  return (
    <MascotContext.Provider value={{ message, mood, visible, sayHi, react, dismiss, showMessage }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error('useMascot debe usarse dentro de MascotProvider');
  return ctx;
}