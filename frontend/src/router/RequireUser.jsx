import { Navigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export function RequireUser({ children }) {
  const { isAuthenticated, checkingSession } = useUserAuth();
  const location = useLocation();

  if (checkingSession) return <FullPageLoader label="Cargando tu sesión..." />;
  if (!isAuthenticated) return <Navigate to="/ingresar" state={{ from: location.pathname }} replace />;
  return children;
}
