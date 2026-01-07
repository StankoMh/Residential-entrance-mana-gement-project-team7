import { DashboardHeader } from './DashboardHeader';
import { Sidebar } from './Sidebar';
import { Overview } from './Overview';
import { PaymentsPage } from './PaymentsPage';
import { EventsPage } from './EventsPage';
import { VotingPage } from './VotingPage';
import { Archives } from './Archives';
import { ProfilePage } from './ProfilePage';
import { HomesAndBuildings } from './HomesAndBuildings';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardView, dashboardViews } from '../types/views';
import { useSelection } from '../contexts/SelectionContext';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const { view } = useParams<{ view: string }>();
  const navigate = useNavigate();
  const currentView = (view as DashboardView) || 'overview';
  const { selectionType } = useSelection();

  // Validate view parameter
  useEffect(() => {
    if (view && !dashboardViews.includes(view as DashboardView)) {
      navigate('/dashboard/overview', { replace: true });
    }
  }, [view, navigate]);

  const handleViewChange = (newView: DashboardView) => {
    navigate(`/dashboard/${newView}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden pt-[73px]">
      <DashboardHeader onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={handleViewChange} />
        
        <main className="flex-1 p-6 ml-64 overflow-x-hidden">
          {currentView === 'homes' && <HomesAndBuildings />}
          
          {currentView === 'overview' && <Overview />}
          
          {currentView === 'payments' && <PaymentsPage />}
          
          {currentView === 'events' && <EventsPage />}
          
          {currentView === 'voting' && <VotingPage />}

          {currentView === 'archive' && <Archives />}

          {currentView === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}