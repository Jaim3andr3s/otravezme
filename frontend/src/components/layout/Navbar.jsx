import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenCheck, X, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUserAuth } from '../../context/UserAuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { DarkModeToggle } from '../ui/DarkModeToggle.jsx';
import { IconButton } from '../ui/IconButton.jsx';
import { MenuToggle } from '../ui/MenuToggle.jsx';
import { Badge } from '../ui/Badge.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/biblioteca', label: 'Biblioteca' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/planes-lectores', label: 'Planes Lectores' },
  { to: '/juegos', label: 'Juegos' },
  { to: '/perfil', label: 'Mi Perfil' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, logout } = useAuth();
  const { isAuthenticated, logout: logoutUser } = useUserAuth();
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

  const handleUserLogout = () => {
    logoutUser();
    showNotification('Sesión cerrada.', 'info');
    navigate('/');
  };

  const desktopLinkClass = ({ isActive }) =>
    `font-semibold text-lg transition duration-150 p-2 rounded-lg ${
      isActive ? 'text-accent bg-accent-soft' : 'text-ink-muted hover:text-accent'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `font-semibold text-xl text-left p-3 rounded-lg transition duration-150 ${
      isActive ? 'text-accent-ink bg-accent' : 'text-ink hover:bg-surface-alt'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md shadow-sm border-b border-edge">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <NavLink to="/" className="flex items-center space-x-3">
          <BookOpenCheck className="w-8 h-8 text-accent" />
          <span className="text-2xl font-serif font-semibold text-ink hidden sm:block">BiblioSueños</span>
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
              className="text-ink-muted bg-surface-alt hover:text-accent"
              title="Acceso Admin"
            />
          ) : (
            <button onClick={() => navigate('/admin')} title="Panel de administrador">
              <Badge text="ADMIN" icon={ShieldCheck} color="bg-accent" textColor="text-accent-ink" />
            </button>
          )}

          <MenuToggle open={isMenuOpen} onClick={() => setIsMenuOpen((prev) => !prev)} />
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
            className="fixed inset-y-0 right-0 w-64 bg-surface z-[100] shadow-2xl p-6 lg:hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-serif font-semibold text-accent">Navegación</h3>
              <IconButton icon={X} onClick={() => setIsMenuOpen(false)} className="text-ink-muted bg-surface-alt" title="Cerrar Menú" />
            </div>
            <nav className="flex flex-col space-y-4">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass}>
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <button onClick={handleUserLogout} className="font-semibold text-xl text-left p-3 rounded-lg transition duration-150 text-ink-muted hover:bg-surface-alt flex items-center gap-2">
                  <LogOut className="w-5 h-5" /> Cerrar Sesión
                </button>
              )}
              {isAdmin && (
                <button onClick={handleLogout} className="font-semibold text-xl text-left p-3 rounded-lg transition duration-150 text-danger hover:bg-danger-soft">
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
