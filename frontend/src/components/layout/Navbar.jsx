import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenCheck, X, LogOut, ShieldCheck, 
  Image, Star, BookOpen, Target, Newspaper 
} from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { DarkModeToggle } from '../ui/DarkModeToggle.jsx';
import { IconButton } from '../ui/IconButton.jsx';
import { MenuToggle } from '../ui/MenuToggle.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/biblioteca', label: 'Biblioteca' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/juegos', label: 'Juegos' },
  { to: '/perfil', label: 'Mi Perfil' },
];

const DROPDOWN_LINKS = [
  { to: '/galeria', label: 'Galería', icon: Image },
  { to: '/libro-del-mes', label: 'Libro del Mes', icon: Star },
  { to: '/planes-lectores', label: 'Planes Lectores', icon: BookOpen },
  { to: '/club-de-lectura/retos', label: 'Retos de Lectura', icon: Target },
  { to: '/periodico', label: 'Periódico', icon: Newspaper },
  { to: '/revista-digital', label: 'Revista Digital', icon: BookOpen },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, role, logout } = useUserAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const isAdmin = role === 'admin';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showNotification('Sesión cerrada.', 'info');
    navigate('/ingresar');
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

        <nav className="hidden lg:flex space-x-6 items-center">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="font-semibold text-lg transition duration-150 p-2 rounded-lg text-ink-muted hover:text-accent flex items-center gap-1"
            >
              Club de Lectura
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-surface border border-edge rounded-xl shadow-lg py-2 z-50"
                >
                  {DROPDOWN_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-accent bg-accent-soft'
                              : 'text-ink-muted hover:text-accent hover:bg-accent-soft/50'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </NavLink>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center space-x-3">
          <DarkModeToggle />

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover transition"
              title="Panel de administrador"
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-danger transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Salir</span>
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
            className="fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-white dark:bg-gray-800 z-[200] shadow-2xl p-6 lg:hidden border-l border-edge overflow-y-auto overscroll-contain"
            style={{
              height: '100dvh', // Ocupa toda la altura visible
              paddingTop: 'clamp(60px, 10vh, 80px)', // Espacio para el header
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold text-ink">Navegación</h3>
              <IconButton icon={X} onClick={() => setIsMenuOpen(false)} className="text-ink-muted bg-surface-alt" title="Cerrar Menú" />
            </div>
            <nav className="flex flex-col space-y-3 pb-32">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setIsMenuOpen(false)}
                  className={mobileLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}
              
              <div className="border-t border-edge pt-4 mt-2">
                <p className="text-xs uppercase tracking-wider text-ink-muted font-semibold mb-3">Club de Lectura</p>
                {DROPDOWN_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 text-left p-3 rounded-lg transition duration-150 ${
                          isActive
                            ? 'text-accent-ink bg-accent'
                            : 'text-ink hover:bg-surface-alt'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-semibold text-xl text-left p-3 rounded-lg transition duration-150 text-accent hover:bg-accent-soft flex items-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" /> Panel Admin
                </NavLink>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="font-semibold text-xl text-left p-3 rounded-lg transition duration-150 text-danger hover:bg-danger-soft flex items-center gap-2 mt-2"
                >
                  <LogOut className="w-5 h-5" /> Cerrar Sesión
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}