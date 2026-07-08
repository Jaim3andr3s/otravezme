import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenCheck, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { DarkModeToggle } from '../ui/DarkModeToggle.jsx';
import { IconButton } from '../ui/IconButton.jsx';
import { Badge } from '../ui/Badge.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/biblioteca', label: 'Biblioteca' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/planes-lectores', label: 'Planes Lectores' },
  { to: '/perfil', label: 'Mi Perfil' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showNotification('Sesión de administrador cerrada.', 'info');
    navigate('/');
  };

  const desktopLinkClass = ({ isActive }) =>
    `font-semibold text-lg transition duration-150 p-2 rounded-lg ${
      isActive
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700/50'
        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `font-semibold text-xl text-left p-3 rounded-lg transition duration-150 ${
      isActive ? 'text-white bg-indigo-600 dark:bg-indigo-500' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <NavLink to="/" className="flex items-center space-x-3">
          <BookOpenCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white hidden sm:block">BiblioSueños</span>
        </NavLink>

        <nav className="hidden lg:flex space-x-6">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <DarkModeToggle />

          {!isAdmin ? (
            <IconButton
              icon={ShieldCheck}
              onClick={() => navigate('/admin/login')}
              className="text-red-600 bg-red-100 dark:bg-red-900/50 hover:bg-red-200"
              title="Acceso Admin"
            />
          ) : (
            <button onClick={() => navigate('/admin')} title="Panel de administrador">
              <Badge text="ADMIN" icon={ShieldCheck} color="bg-red-500" textColor="text-white" />
            </button>
          )}

          <IconButton
            icon={Menu}
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50"
            title="Abrir Menú"
          />
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 z-[100] shadow-2xl p-6 lg:hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Navegación</h3>
              <IconButton icon={X} onClick={() => setIsMenuOpen(false)} className="text-gray-500 bg-gray-100 dark:bg-gray-700" title="Cerrar Menú" />
            </div>
            <nav className="flex flex-col space-y-4">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass}>
                  {link.label}
                </NavLink>
              ))}
              {isAdmin && (
                <button onClick={handleLogout} className="font-semibold text-xl text-left p-3 rounded-lg transition duration-150 text-red-600 hover:bg-red-50 dark:hover:bg-red-900">
                  <X className="w-5 h-5 mr-2 inline" /> Salir Admin
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
