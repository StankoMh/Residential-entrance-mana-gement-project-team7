import { Receipt, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import type { UnitFeeWithDetails } from '../types/database';
import { FundType } from '../types/database';

interface PaymentsPanelProps {
  expanded?: boolean;
}

export function PaymentsPanel({ expanded = false }: PaymentsPanelProps) {
  const navigate = useNavigate();
  const [fees, setFees] = useState<UnitFeeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Грешка при зареждане на таксите');
    } finally {
      setLoading(false);
    }
  };

  const displayFees = expanded ? fees : fees.slice(0, 4);
  const pendingTotal = fees
    .filter(f => !f.isPaid)
    .reduce((sum, f) => sum + f.amount, 0);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center">Зареждане на плащания...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-gray-900">Плащания</h2>
              <p className="text-gray-600 text-sm">Текущи и минали такси</p>
            </div>
          </div>
        </div>
      </div>

      {/* Обобщение */}
      <div className="p-6 bg-blue-50 border-b">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Общо за плащане:</span>
          <span className="text-blue-600">{pendingTotal.toFixed(2)} лв</span>
        </div>
      </div>

      {/* Списък с плащания */}
      <div className="divide-y">
        {displayFees.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            Няма налични плащания
          </div>
        ) : (
          displayFees.map((fee) => {
            const status = getStatus(fee);
            return (
              <div key={fee.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">
                        {getFundName(fee.fundType)} - {new Date(fee.month).toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
                      </h3>
                      {status === 'paid' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {status === 'overdue' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {status === 'pending' && (
                        <Clock className="w-4 h-4 text-orange-500" />
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
                    <div className={`${
                      status === 'paid' ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {fee.amount.toFixed(2)} лв
                    </div>
                    {status !== 'paid' && (
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors" onClick={() => handlePayClick(fee)}>
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

      {!expanded && fees.length > 4 && (
        <div className="p-4 border-t">
          <button className="w-full text-center text-blue-600 hover:text-blue-700">
            Виж всички плащания
          </button>
        </div>
      )}
    </div>
  );
}