import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { AdminSidebar } from '../components/AdminSidebar';
import { FinanceManagement } from '../components/FinanceManagement';
import { useSelection } from '../contexts/SelectionContext';
import { buildingService } from '../services/buildingService';
import { ArrowLeft } from 'lucide-react';

export function FinancePage() {
  const navigate = useNavigate();
  const { clearSelection } = useSelection();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = async () => {
    clearSelection();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    // Проверка дали потребителът е admin (има управлявани входове)
    const checkAccess = async () => {
      try {
        const managedBuildings = await buildingService.getManagedBuildings();
        
        if (managedBuildings.length === 0) {
          // Не е admin - връщане към dashboard
          navigate('/dashboard/overview', { replace: true });
          return;
        }
        
        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking access:', error);
        navigate('/login', { replace: true });
      }
    };

    checkAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden pt-[73px]">
      <DashboardHeader onLogout={handleLogout} isAdmin={isAdmin} />
      
      <div className="flex">
        <AdminSidebar currentView={'payments' as any} onViewChange={(view) => navigate(`/admin/dashboard/${view}`)} />
        
        <main className="flex-1 p-6 ml-64 overflow-x-hidden">
          {/* Бутон Назад */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/dashboard/payments')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад към плащания
            </button>
          </div>

          <FinanceManagement />
        </main>
      </div>
    </div>
  );
}