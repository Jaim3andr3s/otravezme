import { createContext, useContext, useState, useCallback, useRef } from 'react';

const MascotContext = createContext(null);
const DISMISS_KEY = 'sofi_dismissed_today';
const GREETED_KEY = 'sofi_greeted_today';

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

  // Ref al timeout activo: si llega un mensaje nuevo antes de que expire el anterior,
  // hay que cancelar el timer viejo o terminaría borrando el mensaje nuevo antes de tiempo.
  const hideTimerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setMessage(null);
  }, []);

  const dismissToday = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, new Date().toDateString());
  }, []);

  const showMessage = useCallback((text, newMood = 'curiosa', duration = 5000) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setMessage(text);
    setMood(newMood);
    setVisible(true);
    if (duration > 0) {
      hideTimerRef.current = setTimeout(() => {
        setMessage(null);
        setMood('neutral');
        hideTimerRef.current = null;
      }, duration);
    }
  }, []);

  // React ahora acepta un segundo argumento opcional para mensaje personalizado
  const react = useCallback((eventType, customMessage = null) => {
    const msg = customMessage || DEFAULT_MESSAGES[eventType] || '¡Qué bien!';
    let nextMood = 'curiosa';
    if (eventType === 'logro' || eventType === 'reto_completo' || eventType === 'diploma') {
      nextMood = 'celebrando';
    } else if (eventType === 'juego_ok' || eventType === 'juego_animo') {
      nextMood = 'animando';
    }
    showMessage(msg, nextMood, 5000);
  }, [showMessage]);

  const sayHi = useCallback((name, extra = '') => {
    // No repetir el saludo si Sofi ya saludó hoy en esta sesión (ida y vuelta al Home).
    const today = new Date().toDateString();
    if (localStorage.getItem(GREETED_KEY) === today) return;
    localStorage.setItem(GREETED_KEY, today);

    const hour = new Date().getHours();
    let greeting = 'Buenas noches';
    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 19) greeting = 'Buenas tardes';
    let text = `${greeting}, ${name}!`;
    if (extra) text += ` ${extra}`;
    showMessage(text, 'animando', 6000);
  }, [showMessage]);

  return (
    <MascotContext.Provider value={{ message, mood, visible, sayHi, react, dismiss, dismissToday, showMessage }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error('useMascot debe usarse dentro de MascotProvider');
  return ctx;
}