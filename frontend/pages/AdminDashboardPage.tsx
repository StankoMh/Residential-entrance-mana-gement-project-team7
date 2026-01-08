import { AdminDashboard } from '../components/AdminDashboard';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useSelection } from '../contexts/SelectionContext';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { clearSelection } = useSelection();

  const handleLogout = async () => {
    // Първо изчистваме selection
    clearSelection();
    // После правим logout към backend
    await authService.logout();
    // Пренасочваме към login вместо към home page
    navigate('/login', { replace: true });
  };

  return <AdminDashboard onLogout={handleLogout} />;
}