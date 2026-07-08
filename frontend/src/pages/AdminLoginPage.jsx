import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { Input } from '../components/ui/Input.jsx';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      showNotification('Acceso de administrador concedido.', 'success');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
    >
      <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700 mb-6">
        <ShieldCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        <p className="text-sm text-yellow-800 dark:text-yellow-200">Solo para personal autorizado.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" required />
        <Input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
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
    </motion.div>
  );
}
