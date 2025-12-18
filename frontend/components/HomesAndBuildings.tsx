import { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Building, Home, Plus, Users, MapPin } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { buildingService, type CreateBuildingRequest } from '../services/buildingService';
import { unitService, type JoinUnitRequest } from '../services/unitService';
import type { DashboardData } from '../types/database';
import { useSelection } from '../contexts/SelectionContext';
import { useNavigate } from 'react-router-dom';

export function HomesAndBuildings() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateBuilding, setShowCreateBuilding] = useState(false);
  const [showJoinHome, setShowJoinHome] = useState(false);
  const { selectBuilding, selectUnit } = useSelection();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboardData = await dashboardService.getDashboard();
      setData(dashboardData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleBuildingClick = (building: any) => {
    selectBuilding(building);
    navigate('/admin/dashboard/overview');
  };

  const handleUnitClick = (unit: any) => {
    selectUnit(unit);
    navigate('/dashboard/overview');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Моите жилища и входове</h1>
        <p className="text-gray-600">
          Управлявайте вашите апартаменти и входове на едно място
        </p>
      </div>

      {/* Managed Buildings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Управлявани входове</h2>
          </div>
          <button
            onClick={() => setShowCreateBuilding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Създай вход
          </button>
        </div>

        {data?.managedBuildings && data.managedBuildings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.managedBuildings.map((building) => (
              <button
                key={building.id}
                onClick={() => handleBuildingClick(building)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{building.name}</h3>
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{building.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{building.totalUnits} апартамента</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Все още не управлявате входове</p>
            <p className="text-gray-500 text-sm">
              Създайте нов вход за да започнете управлението
            </p>
          </div>
        )}
      </section>

      {/* My Homes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-green-600" />
            <h2 className="text-gray-900">Моите жилища</h2>
          </div>
          <button
            onClick={() => setShowJoinHome(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добави жилище
          </button>
        </div>

        {data?.myHomes && data.myHomes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.myHomes.map((home) => (
              <button
                key={home.unitId}
                onClick={() => handleUnitClick(home)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Home className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">Апартамент {home.unitNumber}</h3>
                    <p className="text-gray-600 text-sm mb-1">{home.buildingName}</p>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{home.buildingAddress}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Все още не сте добавили жилища</p>
            <p className="text-gray-500 text-sm">
              Използвайте код за достъп за да добавите апартамент
            </p>
          </div>
        )}
      </section>

      {/* Create Building Modal */}
      {showCreateBuilding && (
        <CreateBuildingModal
          onClose={() => {
            setShowCreateBuilding(false);
          }}
          onSuccess={() => {
            setShowCreateBuilding(false);
            loadData();
          }}
        />
      )}

      {/* Join Home Modal */}
      {showJoinHome && (
        <JoinHomeModal
          onClose={() => setShowJoinHome(false)}
          onSuccess={() => {
            setShowJoinHome(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Create Building Modal
function CreateBuildingModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    entrance: '',
    totalUnits: 1,
    googlePlaceId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isAddressFromGoogle, setIsAddressFromGoogle] = useState(false);

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (!place?.formatted_address || !place.place_id || !place.address_components) {
      setIsAddressFromGoogle(false);
      return;
    }

    const components = place.address_components;

    const hasStreet = components.some(c =>
      c.types.includes('route')
    );

    const hasStreetNumber = components.some(c =>
      c.types.includes('street_number')
    );

    const hasNeighborhood = components.some(c =>
      c.types.includes('neighborhood') ||
      c.types.includes('sublocality')
    );

    // ❌ задължително улица + номер
    if (!hasStreet || !hasStreetNumber) {
      setError('Моля, въведете точен адрес с улица и номер (блок).');
      setIsAddressFromGoogle(false);
      return;
    }

    setError('');

    setFormData(prev => ({
      ...prev,
      address: place.formatted_address!,
      googlePlaceId: place.place_id!,
    }));

    setIsAddressFromGoogle(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      if (!isAddressFromGoogle) {
        setError('Моля, изберете адрес от списъка на Google.');
        setLoading(false);
        return;
      }

      const response = await buildingService.create(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Грешка при създаване на вход');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-gray-900 mb-4">Създаване на нов вход</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Име на входа</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Вход А"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Адрес</label>
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
              options={{
                componentRestrictions: { country: 'bg' },
                types: ['address'],
                fields: [
                  'formatted_address',
                  'place_id',
                  'address_components',
                ],
              }}
            >
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  setIsAddressFromGoogle(false);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="кв. Лозенец, ул. Крум Попов 12"
              />
            </Autocomplete>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Вход</label>
            <input
              type="text"
              required
              value={formData.entrance}
              onChange={(e) => setFormData({ ...formData, entrance: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="А"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Брой апартаменти</label>
            <input
              type="number"
              required
              min="1"
              value={formData.totalUnits}
              onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading || !isAddressFromGoogle}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Създаване...' : 'Създай'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Join Home Modal
function JoinHomeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    accessCode: '',
    residentsCount: 1,
    area: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await unitService.join(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Грешка при присъединяване към жилище');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-gray-900 mb-4">Добавяне на жилище</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Код за достъп</label>
            <input
              type="text"
              required
              value={formData.accessCode}
              onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="12345678"
              maxLength={8}
            />
            <p className="text-gray-500 text-sm mt-1">
              Въведете 8-цифрения код получен от управителя
            </p>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Брой живущи</label>
            <input
              type="number"
              required
              min="1"
              value={formData.residentsCount}
              onChange={(e) => setFormData({ ...formData, residentsCount: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Площ (кв.м)</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Добавяне...' : 'Добави'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}