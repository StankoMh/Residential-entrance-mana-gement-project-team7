import { Receipt, CheckCircle, AlertCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import type { UnitFeeWithDetails } from '../types/database';
import { FundType } from '../types/database';

export function PaymentsPage() {
  const navigate = useNavigate();
  const [fees, setFees] = useState<UnitFeeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getMyFees();
      setFees(data);
    } catch (err) {
      console.error('Error loading fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (fee: UnitFeeWithDetails) => {
    if (fee.isPaid) return 'paid';
    const dueDate = new Date(fee.dueTo);
    const now = new Date();
    return dueDate < now ? 'overdue' : 'pending';
  };

  const getFundName = (fundType: FundType) => {
    return fundType === FundType.MAINTENANCE ? 'Фонд Поддръжка' : 'Фонд Ремонти';
  };

  const handlePayClick = (fee: UnitFeeWithDetails) => {
    navigate('/payment/checkout', { state: { fee } });
  };

  const filteredFees = fees.filter(fee => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !fee.isPaid;
    if (filter === 'paid') return fee.isPaid;
    return true;
  });

  // Статистики
  const totalPending = fees.filter(f => !f.isPaid).reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter(f => f.isPaid).reduce((sum, f) => sum + f.amount, 0);
  const pendingCount = fees.filter(f => !f.isPaid).length;

  // Групиране по фонд
  const maintenanceFees = fees.filter(f => f.fundType === FundType.MAINTENANCE);
  const repairFees = fees.filter(f => f.fundType === FundType.REPAIR);
  const maintenancePending = maintenanceFees.filter(f => !f.isPaid).reduce((sum, f) => sum + f.amount, 0);
  const repairPending = repairFees.filter(f => !f.isPaid).reduce((sum, f) => sum + f.amount, 0);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане на плащания...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Плащания</h1>
        <p className="text-gray-600">Преглед на всички такси и плащания</p>
      </div>

      {/* Статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">{totalPending.toFixed(2)} лв</div>
          <div className="text-gray-600 text-sm mb-1">За плащане</div>
          <div className="text-gray-500 text-xs">{pendingCount} неплатени</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">{totalPaid.toFixed(2)} лв</div>
          <div className="text-gray-600 text-sm mb-1">Платени</div>
          <div className="text-gray-500 text-xs">{fees.filter(f => f.isPaid).length} плащания</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="text-gray-900 mb-1">{(totalPending + totalPaid).toFixed(2)} лв</div>
          <div className="text-gray-600 text-sm mb-1">Обща сума</div>
          <div className="text-gray-500 text-xs">{fees.length} такси</div>
        </div>
      </div>

      {/* Статистики по фондове */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-gray-900">Фонд Поддръжка</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">За плащане:</span>
              <span className="text-orange-600">{maintenancePending.toFixed(2)} лв</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Платени:</span>
              <span className="text-green-600">
                {maintenanceFees.filter(f => f.isPaid).reduce((sum, f) => sum + f.amount, 0).toFixed(2)} лв
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-gray-900">Фонд Ремонти</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">За плащане:</span>
              <span className="text-orange-600">{repairPending.toFixed(2)} лв</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Платени:</span>
              <span className="text-green-600">
                {repairFees.filter(f => f.isPaid).reduce((sum, f) => sum + f.amount, 0).toFixed(2)} лв
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Филтри */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Всички
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Неплатени
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'paid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Платени
          </button>
        </div>
      </div>

      {/* Списък с плащания */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {filteredFees.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              Няма налични плащания
            </div>
          ) : (
            filteredFees.map((fee) => {
              const status = getStatus(fee);
              return (
                <div key={fee.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-gray-900">
                          {getFundName(fee.fundType)} - {new Date(fee.month).toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
                        </h3>
                        {status === 'paid' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {status === 'overdue' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        {status === 'pending' && (
                          <Clock className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {fee.fundType === FundType.MAINTENANCE ? 'Месечна такса за поддръжка' : 'Месечна такса за ремонти'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        {status === 'paid' ? (
                          <span className="text-green-600">
                            Платено
                          </span>
                        ) : status === 'overdue' ? (
                          <span className="text-red-600">
                            Просрочено от {new Date(fee.dueTo).toLocaleDateString('bg-BG')}
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            Падеж: {new Date(fee.dueTo).toLocaleDateString('bg-BG')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl mb-2 ${
                        status === 'paid' ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {fee.amount.toFixed(2)} лв
                      </div>
                      {status !== 'paid' && (
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() => handlePayClick(fee)}
                        >
                          Плати
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}