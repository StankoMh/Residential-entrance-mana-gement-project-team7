import { Search, Mail, MapPin, MoreVertical, Edit2, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { unitService } from '../services/unitService';
import type { Unit } from '../types/database';

export function ApartmentsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadUnits();
  }, []);

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
    try {
      setLoading(true);
      const data = await unitService.getAll();
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

  const handleEdit = (unit: Unit) => {
    console.log('Редактиране на:', unit);
    // TODO: Отваряне на модал за редактиране
    setOpenMenuId(null);
  };

  const handleDelete = async (unit: Unit) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете апартамент ${unit.unitNumber}?`)) {
      try {
        await unitService.delete(unit.id);
        await loadUnits(); // Презареждане на данните
        console.log('Изтрит апартамент:', unit);
      } catch (err) {
        console.error('Грешка при изтриване:', err);
        alert('Грешка при изтриване на апартамент');
      }
    }
    setOpenMenuId(null);
  };

  const filteredUnits = units.filter(unit =>
    (unit.unitNumber && unit.unitNumber.includes(searchTerm)) ||
    (unit.resident && `${unit.resident.firstName} ${unit.resident.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареж��ане на апартаменти...</p>
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
                <th className="px-6 py-3 text-left text-gray-700">Баланс</th>
                <th className="px-6 py-3 text-left text-gray-700">Статус</th>
                <th className="px-6 py-3 text-right text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    {searchTerm ? 'Няма намерени апартаменти' : 'Няма апартаменти'}
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => {
                  const balance = unit.balance?.balance || 0;
                  const isOccupied = !!unit.resident;
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
                        {isOccupied && unit.resident ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600">
                                {unit.resident.firstName[0]}{unit.resident.lastName[0]}
                              </span>
                            </div>
                            <span className="text-gray-900">{unit.resident.firstName} {unit.resident.lastName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Свободен</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isOccupied && unit.resident ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Mail className="w-4 h-4" />
                              <span>{unit.resident.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${
                          balance > 0
                            ? 'text-green-600'
                            : balance < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {balance > 0 ? '+' : ''}{balance.toFixed(2)} лв
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isOccupied ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            Активен
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            Свободен
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
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                onClick={() => handleDelete(unit)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Изтрий
                              </button>
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
    </div>
  );
}