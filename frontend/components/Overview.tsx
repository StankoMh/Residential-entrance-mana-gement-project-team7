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
        <h1 className="text-gray-900">Преглед</h1>
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
      {/* Красив индикатор за избраното жилище */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-600 mb-1">Моите жилища</p>
            <h2 className="text-gray-900 mb-1">Апартамент {selectedUnit.unitNumber}</h2>
            <p className="text-gray-600 text-sm">{selectedUnit.buildingName}</p>
          </div>
        </div>
      </div>

      <h1 className="text-gray-900">Преглед</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentsPanel />
        <EventsPanel />
      </div>
    </div>
  );
}