import { Dashboard } from '../components/Dashboard';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useSelection } from '../contexts/SelectionContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { clearSelection } = useSelection();

  const handleLogout = () => {
    authService.logout();
    clearSelection();
    navigate('/');
  };

  return <Dashboard onLogout={handleLogout} />;
}