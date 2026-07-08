import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext.jsx';

export function RequireAdmin({ children }) {
  const { isAuthenticated, role, checkingSession } = useUserAuth();

  if (checkingSession) return null; // o un spinner
  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/ingresar" replace />;
  }
  return children;
}