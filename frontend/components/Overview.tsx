import { Home } from 'lucide-react';
import { PaymentsPanel } from './PaymentsPanel';
import { EventsPanel } from './EventsPanel';
import { useSelection } from '../contexts/SelectionContext';

export function Overview() {
  const { selectedUnit } = useSelection();

  return (
    <div className="space-y-6">
      {/* Красив индикатор за избраното жилище */}
      {selectedUnit && (
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
      )}

      <h1 className="text-gray-900">Преглед</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentsPanel />
        <EventsPanel />
      </div>
    </div>
  );
}
