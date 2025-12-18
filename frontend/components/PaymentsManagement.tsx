import { Plus, Download, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';

const payments = [
  { id: 1, resident: 'Иван Иванов', apartment: '12', description: 'Такса поддръжка - Декември', amount: 85.00, status: 'paid', date: '2025-12-01' },
  { id: 2, resident: 'Мария Петрова', apartment: '5', description: 'Такса поддръжка - Декември', amount: 85.00, status: 'paid', date: '2025-12-01' },
  { id: 3, resident: 'Георги Стоянов', apartment: '8', description: 'Такса поддръжка - Декември', amount: 85.00, status: 'pending', dueDate: '2025-12-10' },
  { id: 4, resident: 'Петър Димитров', apartment: '3', description: 'Такса поддръжка - Ноември', amount: 85.00, status: 'overdue', dueDate: '2025-11-10' },
  { id: 5, resident: 'Елена Георгиева', apartment: '15', description: 'Такса поддръжка - Декември', amount: 85.00, status: 'pending', dueDate: '2025-12-10' }
];

export function PaymentsManagement() {
  const [showAddModal, setShowAddModal] = useState(false);

  const statusConfig = {
    paid: { label: 'Платено', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { label: 'Очаква се', color: 'bg-orange-100 text-orange-700', icon: Clock },
    overdue: { label: 'Просрочено', color: 'bg-red-100 text-red-700', icon: XCircle }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Управление на плащания</h1>
          <p className="text-gray-600">Създаване и проследяване на такси</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            Филтри
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            Експорт
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Добави такса
          </button>
        </div>
      </div>

      {/* Статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Платени</div>
          <div className="text-gray-900">2 / 5</div>
          <div className="text-green-600 text-sm">170.00 лв</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Очаквани</div>
          <div className="text-gray-900">2</div>
          <div className="text-orange-600 text-sm">170.00 лв</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Просрочени</div>
          <div className="text-gray-900">1</div>
          <div className="text-red-600 text-sm">85.00 лв</div>
        </div>
      </div>

      {/* Таблица с плащания */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Жител</th>
                <th className="px-6 py-3 text-left text-gray-700">Апартамент</th>
                <th className="px-6 py-3 text-left text-gray-700">Описание</th>
                <th className="px-6 py-3 text-left text-gray-700">Сума</th>
                <th className="px-6 py-3 text-left text-gray-700">Статус</th>
                <th className="px-6 py-3 text-left text-gray-700">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => {
                const status = statusConfig[payment.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{payment.resident}</td>
                    <td className="px-6 py-4 text-gray-700">№ {payment.apartment}</td>
                    <td className="px-6 py-4 text-gray-700">{payment.description}</td>
                    <td className="px-6 py-4 text-gray-900">{payment.amount.toFixed(2)} лв</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full text-sm ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {payment.status === 'paid' 
                        ? new Date(/*payment.date*/).toLocaleDateString('bg-BG')
                        : `Падеж: ${new Date(payment.dueDate!).toLocaleDateString('bg-BG')}`
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модал за добавяне на такса */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-gray-900 mb-4">Добави нова такса</h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-700">Вид такса</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Такса поддръжка, Ремонт и т.н."
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700">Сума (лв)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="85.00"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700">Падеж</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700">Приложи за</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Всички жители</option>
                  <option>Избрани жители</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Създай
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
