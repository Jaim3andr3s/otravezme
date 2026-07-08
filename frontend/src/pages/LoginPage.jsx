import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRound, Loader2, BookOpenCheck } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton.jsx';
import { IconTile } from '../components/ui/IconTile.jsx';

export default function LoginPage() {
  const { loginWithGoogle, loginAsGuest } = useUserAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from || '/perfil';

  const handleGoogleCredential = async (credential) => {
    setError('');
    try {
      await loginWithGoogle(credential);
      showNotification('¡Bienvenido de nuevo!', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuest = async () => {
    setLoadingGuest(true);
    setError('');
    try {
      await loginAsGuest();
      showNotification('Entraste como invitado. Tu progreso se guarda en este dispositivo.', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-surface rounded-2xl shadow-sm border border-edge p-8 text-center space-y-6"
    >
      <div className="flex flex-col items-center gap-3">
        <IconTile icon={BookOpenCheck} size="lg" className="bg-accent-soft text-accent" />
        <h2 className="text-3xl font-serif font-semibold text-ink">Entra a BiblioSueños</h2>
        <p className="text-ink-muted">Guarda tus favoritos, tu progreso de lectura y las insignias que ganes jugando.</p>
      </div>

      <div className="space-y-3">
        <GoogleSignInButton onCredential={handleGoogleCredential} />

        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex-grow h-px bg-edge" />
          o
          <span className="flex-grow h-px bg-edge" />
        </div>

        <button
          onClick={handleGuest}
          disabled={loadingGuest}
          className="w-full px-4 py-3 rounded-full font-semibold bg-surface-alt text-ink border border-edge hover:opacity-80 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingGuest ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserRound className="w-5 h-5" />}
          Continuar como Invitado
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-ink-muted">Como invitado tu progreso se guarda en este dispositivo y navegador.</p>
    </motion.div>
  );
}
