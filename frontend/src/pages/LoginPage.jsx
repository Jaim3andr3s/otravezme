import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRound, Loader2, BookOpenCheck, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton.jsx';
import { IconTile } from '../components/ui/IconTile.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';

export default function LoginPage() {
  const { loginWithGoogle, loginAsGuest, register, loginUnified } = useUserAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password);
        showNotification('¡Cuenta creada exitosamente!', 'success');
        setMode('login');
        setPassword('');
        setError('');
        return;
      }

      // Login unificado (admin o usuario normal)
      await loginUnified(email.trim(), password);
      showNotification('¡Bienvenido!', 'success');

      // ✅ REDIRECCIÓN: tanto admin como usuario normal van a la raíz
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
    setLoading(true);
    setError('');
    try {
      await loginAsGuest();
      showNotification('Entraste como invitado.', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface rounded-2xl shadow-sm border border-edge p-8 text-center space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          <IconTile icon={BookOpenCheck} size="lg" className="bg-accent-soft text-accent" />
          <h2 className="text-3xl font-serif font-semibold text-ink">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <p className="text-ink-muted">
            {mode === 'login'
              ? 'Ingresa con tu correo y contraseña'
              : 'Regístrate para guardar tu progreso'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <Input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required={mode === 'register'}
                autoComplete="name"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              autoComplete={mode === 'login' ? 'email' : 'email'}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Iniciar sesión'
            ) : (
              'Crear cuenta'
            )}
          </Button>

          {error && <p className="text-sm text-danger text-center">{error}</p>}
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-accent hover:underline font-medium"
          >
            {mode === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex-grow h-px bg-edge" />
          o
          <span className="flex-grow h-px bg-edge" />
        </div>

        <div className="space-y-3">
          <GoogleSignInButton onCredential={handleGoogleCredential} />

          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full px-4 py-3 rounded-full font-semibold bg-surface-alt text-ink border border-edge hover:opacity-80 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserRound className="w-5 h-5" />}
            Continuar como Invitado
          </button>
        </div>

        <p className="text-xs text-ink-muted">
          Como invitado tu progreso se guarda en este dispositivo y navegador.
        </p>
      </motion.div>
    </div>
  );
}