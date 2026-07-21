import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Check, XCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext.jsx';

const ICONS = { info: MessageSquare, success: Check, error: XCircle };
const COLORS = {
  info: 'bg-ink text-bg border-ink-muted',
  success: 'bg-success text-white border-success',
  error: 'bg-danger text-white border-danger',
};

export function NotificationToast() {
  const { notification, clearNotification } = useNotification();
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(clearNotification, 3000);
  }, [clearNotification]);

  useEffect(() => {
    if (!notification) return;
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification, startTimer]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (notification) startTimer();
  };

  const Icon = notification ? ICONS[notification.type] : null;

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl font-semibold flex items-center space-x-3 z-[150] ${COLORS[notification.type]} border-b-4 cursor-pointer`}
          onClick={clearNotification}
        >
          <Icon className="w-6 h-6" />
          <span>{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
