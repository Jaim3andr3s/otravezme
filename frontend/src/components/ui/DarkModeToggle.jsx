import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { IconButton } from './IconButton.jsx';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <IconButton
      icon={isDarkMode ? Sun : Moon}
      onClick={toggleDarkMode}
      className="text-yellow-500 dark:text-yellow-400 bg-gray-100 dark:bg-gray-700"
      title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
    />
  );
}
