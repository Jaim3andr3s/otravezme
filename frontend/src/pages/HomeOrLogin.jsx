import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';
import HomePage from './HomePage.jsx';

export function HomeOrLogin() {
  const { isAuthenticated, checkingSession } = useUserAuth();

  if (checkingSession) {
    return <FullPageLoader label="Cargando..." />;
  }

  if (!isAuthenticated) {
    // Redirigir a la página de login
    return <Navigate to="/ingresar" replace />;
  }

  return <HomePage />;
}