import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthRedirectProps {
  children: React.ReactNode;
}

// Пренасочва вече влезли потребители към техния dashboard
export function AuthRedirect({ children }: AuthRedirectProps) {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
