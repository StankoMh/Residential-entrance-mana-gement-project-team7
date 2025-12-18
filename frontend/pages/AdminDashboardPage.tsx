import { AdminDashboard } from '../components/AdminDashboard';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useSelection } from '../contexts/SelectionContext';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { clearSelection } = useSelection();

  const handleLogout = () => {
    authService.logout();
    clearSelection();
    navigate('/');
  };

  return <AdminDashboard onLogout={handleLogout} />;
}