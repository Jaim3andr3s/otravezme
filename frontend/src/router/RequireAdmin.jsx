import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export function RequireAdmin({ children }) {
  const { isAuthenticated, role, checkingSession } = useUserAuth();
  if (checkingSession) return <FullPageLoader label="Verificando acceso..." />;
  if (!isAuthenticated || role !== 'admin') return <Navigate to="/ingresar" replace />;
  return children;
}
