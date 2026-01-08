import { DollarSign, Save, Zap, FileText, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelection } from '../contexts/SelectionContext';
import { buildingService } from '../services/buildingService';
import type { BudgetData } from '../services/buildingService';

export function BudgetSettings() {
  const { selectedBuilding } = useSelection();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [budget, setBudget] = useState<BudgetData>({
    repairBudget: 0,
    maintenanceBudget: 0,
    protocolFileUrl: null
  });
  const [formData, setFormData] = useState({
    repairBudget: '',
    maintenanceBudget: '',
    protocolFileUrl: ''
  });

  useEffect(() => {
    if (selectedBuilding) {
      loadBudget();
    }
  }, [selectedBuilding]);

  const loadBudget = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoading(true);
      const data = await buildingService.getBudget(selectedBuilding.id);
      setBudget(data);
      setFormData({
        repairBudget: data.repairBudget.toString(),
        maintenanceBudget: data.maintenanceBudget.toString(),
        protocolFileUrl: data.protocolFileUrl || ''
      });
    } catch (err) {
      console.error('Error loading budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedBuilding) return;

    const repairBudget = parseFloat(formData.repairBudget);
    const maintenanceBudget = parseFloat(formData.maintenanceBudget);

    if (isNaN(repairBudget) || isNaN(maintenanceBudget)) {
      alert('Моля, въведете валидни числа');
      return;
    }

    if (repairBudget < 0 || maintenanceBudget < 0) {
      alert('Таксите не могат да бъдат отрицателни');
      return;
    }

    setSaving(true);
    
    try {
      await buildingService.updateBudget(selectedBuilding.id, {
        repairBudget,
        maintenanceBudget,
        protocolFileUrl: formData.protocolFileUrl || null
      });
      
      alert('Месечните такси са обновени успешно!');
      loadBudget();
    } catch (err: any) {
      console.error('Error saving budget:', err);
      alert('Грешка при запазване на таксите');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerFees = async () => {
    if (!selectedBuilding) return;

    if (!confirm('Сигурни ли сте, че искате да генерирате месечни такси за всички апартаменти? Това обикновено се случва автоматично всеки месец.')) {
      return;
    }

    setTriggering(true);
    
    try {
      const response = await buildingService.triggerMonthlyFees(selectedBuilding.id);
      alert(response || 'Месечните такси са генерирани успешно!');
    } catch (err: any) {
      console.error('Error triggering fees:', err);
      alert('Грешка при генериране на такси');
    } finally {
      setTriggering(false);
    }
  };

  if (!selectedBuilding) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Моля, изберете вход за настройка на такси</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Месечни такси</h1>
        <p className="text-gray-600">Настройване на месечни такси за всички апартаменти</p>
      </div>

      {/* Текущи настройки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Фонд Поддръжка</h3>
              <p className="text-sm text-gray-600">Месечна такса за общи разходи</p>
            </div>
          </div>
          <div className="text-gray-900 mb-1">Текуща такса</div>
          <div className="text-blue-600">{budget.maintenanceBudget.toFixed(2)} лв на м²</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Фонд Ремонти</h3>
              <p className="text-sm text-gray-600">Месечна такса за бъдещи ремонти</p>
            </div>
          </div>
          <div className="text-gray-900 mb-1">Текуща такса</div>
          <div className="text-purple-600">{budget.repairBudget.toFixed(2)} лв на м²</div>
        </div>
      </div>

      {/* Форма за редактиране */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-6">Актуализация на такси</h2>
        
        <div className="space-y-6">
          {/* Такса поддръжка */}
          <div>
            <label className="block text-gray-700 mb-2">
              Такса Фонд Поддръжка (лв на м²) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.maintenanceBudget}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceBudget: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">лв/м²</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ще се начислява автоматично на всички апартаменти според тяхната квадратура
            </p>
            {formData.maintenanceBudget && parseFloat(formData.maintenanceBudget) > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                💡 Пример: Апартамент от 80 м² ще плаща {(parseFloat(formData.maintenanceBudget) * 80).toFixed(2)} лв месечно
              </p>
            )}
          </div>

          {/* Такса ремонти */}
          <div>
            <label className="block text-gray-700 mb-2">
              Такса Фонд Ремонти (лв на м²) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.repairBudget}
                onChange={(e) => setFormData(prev => ({ ...prev, repairBudget: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">лв/м²</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ще се начислява автоматично на всички апартаменти според тяхната квадратура
            </p>
            {formData.repairBudget && parseFloat(formData.repairBudget) > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                💡 Пример: Апартамент от 80 м² ще плаща {(parseFloat(formData.repairBudget) * 80).toFixed(2)} лв месечно
              </p>
            )}
          </div>

          {/* Протокол */}
          <div>
            <label className="block text-gray-700 mb-2">
              Линк към протокол (опционално)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.protocolFileUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, protocolFileUrl: e.target.value }))}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/protocol.pdf"
              />
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              URL към протокол от общо събрание за одобрение на таксите
            </p>
          </div>

          {/* Информационна рамка */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-900 mb-2">ℹ️ Как работят таксите?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Таксите се изчисляват автоматично според квадратурата на всеки апартамент</li>
              <li>• Месечните такси се генерират автоматично в началото на всеки месец</li>
              <li>• Промените в таксите ще се отразят при следващото генериране</li>
              <li>• Жителите ще получат известие за новите такси</li>
            </ul>
          </div>

          {/* Бутони */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Запазване...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Запази промените
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Debug секция */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 mb-2">⚠️ Debug: Генериране на такси</h3>
            <p className="text-gray-600 text-sm mb-4">
              Този бутон е предназначен само за тестови цели. Той принудително генерира месечни такси за всички апартаменти 
              в този вход, независимо от датата. В нормален режим таксите се генерират автоматично в началото на всеки месец.
            </p>
            <button
              onClick={handleTriggerFees}
              disabled={triggering}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
            >
              {triggering ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Генериране...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Генерирай такси сега (Debug)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}