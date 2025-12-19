import { Home } from 'lucide-react';
import { PaymentsPanel } from './PaymentsPanel';
import { EventsPanel } from './EventsPanel';
import { useSelection } from '../contexts/SelectionContext';
import { useNavigate } from 'react-router-dom';

export function Overview() {
  const { selectedUnit } = useSelection();
  const navigate = useNavigate();

  // Ако няма избран апартамент, покажи съобщение
  if (!selectedUnit) {
    return (
      <div className="space-y-6">
        <h1 className="text-gray-900 mb-2">Преглед</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Home className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">Изберете апартамент</h2>
          <p className="text-gray-600 mb-4">
            Моля, изберете апартамент за да видите информация
          </p>
          <button
            onClick={() => navigate('/dashboard/homes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Избери апартамент
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Преглед</h1>
        <p className="text-gray-600">Обобщена информация за апартамента</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentsPanel />
        <EventsPanel />
      </div>
    </div>
  );
}