import { DashboardHeader } from './DashboardHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { ApartmentsManagement } from './ApartmentsManagement';
import { PaymentsManagement } from './PaymentsManagement';
import { EventsManagement } from './EventsManagement';
import { VotingManagement } from './VotingManagement';
import { ArchiveManagement } from './ArchiveManagement';
import { HomesAndBuildings } from './HomesAndBuildings';
import { ProfilePage } from './ProfilePage';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminView, adminViews } from '../types/views';
import { useSelection } from '../contexts/SelectionContext';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { view } = useParams<{ view: string }>();
  const navigate = useNavigate();
  const currentView = (view as AdminView) || 'overview';
  const { selectionType } = useSelection();

  // Validate view parameter
  useEffect(() => {
    if (view && !adminViews.includes(view as AdminView)) {
      navigate('/admin/dashboard/overview', { replace: true });
    }
  }, [view, navigate]);

  const handleViewChange = (newView: AdminView) => {
    navigate(`/admin/dashboard/${newView}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden pt-[73px]">
      <DashboardHeader onLogout={onLogout} isAdmin />
      
      <div className="flex">
        <AdminSidebar currentView={currentView} onViewChange={handleViewChange} />
        
        <main className="flex-1 p-6 ml-64 overflow-x-hidden">
          {currentView === 'homes' && <HomesAndBuildings />}
          {currentView === 'overview' && <AdminOverview />}
          {currentView === 'apartments' && <ApartmentsManagement />}
          {currentView === 'payments' && <PaymentsManagement />}
          {currentView === 'events' && <EventsManagement />}
          {currentView === 'voting' && <VotingManagement />}
          {currentView === 'archive' && <ArchiveManagement />}
          {currentView === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}