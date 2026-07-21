import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { STORAGE_KEYS } from '../constants/storage.js';
import { MASCOT_EVENTS, IDLE_CHATTER, pick } from '../constants/mascot.js';

const MascotContext = createContext(null);

export function MascotProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [mood, setMood] = useState('neutral');
  const [action, setAction] = useState(null);
  const [visible, setVisible] = useState(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.SOFI_DISMISSED);
    if (dismissed) {
      const today = new Date().toDateString();
      return dismissed !== today;
    }
    return true;
  });

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
    localStorage.setItem(STORAGE_KEYS.SOFI_DISMISSED, new Date().toDateString());
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

  const react = useCallback((eventType, customMessage = null) => {
    const def = MASCOT_EVENTS[eventType];
    const msg = customMessage || (def ? pick(def.variants) : '¡Qué bien! 😊');
    const nextMood = def?.mood || 'curiosa';
    const nextAction = def?.action || null;
    showMessage(msg, nextMood, 5000, nextAction);
  }, [showMessage]);

  const sayHi = useCallback((name, extra = '') => {
    const today = new Date().toDateString();
    if (localStorage.getItem(STORAGE_KEYS.SOFI_GREETED) === today) return;
    localStorage.setItem(STORAGE_KEYS.SOFI_GREETED, today);

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
