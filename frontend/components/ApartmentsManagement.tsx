import { Search, Mail, MapPin, MoreVertical, Edit2, Copy, CheckCircle2, Users as UsersIcon, Ruler, AlertTriangle, Check, X, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';
import { unitService, type UnitResponseFromAPI } from '../services/unitService';
import { toast } from 'sonner';
import { useSelection } from '../contexts/SelectionContext';
import { buildingService } from '../services/buildingService';
import { authService } from '../services/authService';

export function ApartmentsManagement() {
  const { selectedBuilding } = useSelection();
  const [searchTerm, setSearchTerm] = useState('');
  const [units, setUnits] = useState<UnitResponseFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<UnitResponseFromAPI | null>(null);
  const [formData, setFormData] = useState({ area: 0, residentsCount: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedBuilding) {
      loadUnits();
    }
  }, [selectedBuilding]);

  // Затваряне на менюто при клик извън него
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const loadUnits = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoading(true);
      const data = await unitService.getAllByBuilding(selectedBuilding.id);
      setUnits(data);
    } catch (err) {
      console.error('Error loading units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleEdit = (unit: UnitResponseFromAPI) => {
    console.log('Редактиране на:', unit);
    setEditingUnit(unit);
    setFormData({ area: unit.area || 0, residentsCount: unit.residents || 0 });
    setOpenMenuId(null);
  };

  const handleVerify = async (unit: UnitResponseFromAPI) => {
    try {
      await unitService.verify(unit.id);
      toast.success('Данните са потвърдени успешно');
      await loadUnits(); // Презареждане на данните
    } catch (err) {
      console.error('Грешка при потвърждаване:', err);
      toast.error('Грешка при потвърждаване на данните');
    }
  };

  const handleTransferManager = async (unit: UnitResponseFromAPI) => {
    if (!selectedBuilding || !unit.ownerInfo) return;

    // Проверка дали текущият потребител е същият като жителя
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === unit.ownerInfo.id) {
      toast.error('Не можете да прехвърлите управлението на себе си');
      setOpenMenuId(null);
      return;
    }

    const residentName = `${unit.ownerInfo.firstName} ${unit.ownerInfo.lastName}`;
    
    if (window.confirm(`Сигурни ли сте, че искате да прехвърлите управлението на входа към ${residentName}?\n\nСлед това той ще стане домоуправител и вие ще загубите достъп до управлението.`)) {
      try {
        await buildingService.transferManager(selectedBuilding.id, unit.ownerInfo.id);
        toast.success(`Управлението е прехвърлено успешно към ${residentName}`);
        // След прехвърляне потребителят ще загуби достъп, затова препращаме към dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (err) {
        console.error('Грешка при прехвърляне на управлението:', err);
        toast.error('Грешка при прехвърляне на управлението');
      }
    }
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUnit) return;

    try {
      setIsSaving(true);
      await unitService.update(editingUnit.id, formData);
      toast.success('Данните са актуализирани успешно');
      await loadUnits();
      setEditingUnit(null);
    } catch (err) {
      console.error('Грешка при актуализация:', err);
      toast.error('Грешка при актуализация на данните');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.unitNumber.toString().includes(searchTerm) ||
    (unit.ownerInfo && `${unit.ownerInfo.firstName} ${unit.ownerInfo.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане на апартаменти...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Управление на апартаменти</h1>
          <p className="text-gray-600">Общо {units.length} апартамента</p>
        </div>
      </div>

      {/* Търсене */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Търси по име или апартамент..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Таблица с апартаменти */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Апартамент</th>
                <th className="px-6 py-3 text-left text-gray-700">Код за достъп</th>
                <th className="px-6 py-3 text-left text-gray-700">Име</th>
                <th className="px-6 py-3 text-left text-gray-700">Контакти</th>
                <th className="px-6 py-3 text-left text-gray-700">Квадратура</th>
                <th className="px-6 py-3 text-left text-gray-700">Жители</th>
                <th className="px-6 py-3 text-left text-gray-700">Статус</th>
                <th className="px-6 py-3 text-right text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
                    {searchTerm ? 'Няма намерени апартаменти' : 'Няма апартаменти'}
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => {
                  const isOccupied = !!unit.ownerInfo;
                  return (
                    <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4" />
                          <span>№ {unit.unitNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 px-3 py-1 rounded border border-gray-300">
                            <code className="text-gray-900 tracking-wide">
                              {unit.accessCode || 'N/A'}
                            </code>
                          </div>
                          {unit.accessCode && (
                            <button
                              onClick={() => handleCopyCode(unit.accessCode!)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors"
                              title="Копирай код"
                            >
                              {copiedCode === unit.accessCode ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isOccupied && unit.ownerInfo ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600">
                                {unit.ownerInfo.firstName[0]}{unit.ownerInfo.lastName[0]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900">{unit.ownerInfo.firstName} {unit.ownerInfo.lastName}</span>
                              {unit.isVerified === false && (
                                <button
                                  onClick={() => handleVerify(unit)}
                                  className="p-1 hover:bg-yellow-100 rounded transition-colors"
                                  title="Потвърди данни"
                                >
                                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Няма информация</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isOccupied && unit.ownerInfo ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Mail className="w-4 h-4" />
                              <span>{unit.ownerInfo.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {unit.area ? (
                          <div className="flex items-center gap-1 text-gray-700">
                            <Ruler className="w-4 h-4" />
                            <span>{unit.area} кв.м</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {unit.residents ? (
                          <div className="flex items-center gap-1 text-gray-700">
                            <UsersIcon className="w-4 h-4" />
                            <span>{unit.residents}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {unit.isVerified === true ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <Check className="w-4 h-4" />
                            Потвърден
                          </span>
                        ) : unit.isVerified === false && unit.ownerInfo ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            Непотвърден
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            Няма информация
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right relative action-menu">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setOpenMenuId(openMenuId === unit.id ? null : unit.id)}
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {openMenuId === unit.id && (
                          <div className="absolute right-6 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => handleEdit(unit)}
                              >
                                <Edit2 className="w-4 h-4" />
                                Редактирай
                              </button>
                              {unit.isVerified === false && unit.ownerInfo && (
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                  onClick={() => handleVerify(unit)}
                                >
                                  <Check className="w-4 h-4" />
                                  Потвърди
                                </button>
                              )}
                              {unit.ownerInfo && (
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                  onClick={() => handleTransferManager(unit)}
                                >
                                  <UserCog className="w-4 h-4" />
                                  Прехвърли управлението
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модал за редактиране */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-gray-900">Редактиране на апартамент</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Апатамент № {editingUnit.unitNumber}
                </p>
              </div>
              <button
                onClick={() => setEditingUnit(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Квадратура (кв.м)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.area || ''}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Брой жители
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.residentsCount || ''}
                  onChange={(e) => setFormData({ ...formData, residentsCount: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUnit(null)}
                disabled={isSaving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Отказ
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Запазване...' : 'Запази'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}