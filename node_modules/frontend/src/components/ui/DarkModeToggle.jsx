import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { IconButton } from './IconButton.jsx';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <IconButton
      icon={isDarkMode ? Sun : Moon}
      onClick={toggleDarkMode}
      className="text-gold bg-surface-alt"
      title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
    />
  );
}
