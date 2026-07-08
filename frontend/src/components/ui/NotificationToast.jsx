import { useEffect } from 'react';
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

  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(clearNotification, 3000);
    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  const Icon = notification ? ICONS[notification.type] : null;

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl font-semibold flex items-center space-x-3 z-[150] ${COLORS[notification.type]} border-b-4`}
        >
          <Icon className="w-6 h-6" />
          <span>{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
