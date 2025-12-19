import { Users, DollarSign, TrendingUp, AlertCircle, Building2 } from 'lucide-react';
import { useSelection } from '../contexts/SelectionContext';
import { useNavigate } from 'react-router-dom';

const stats = [
  {
    label: 'Общо жители',
    value: '24',
    change: '+2 този месец',
    icon: Users,
    color: 'blue'
  },
  {
    label: 'Събрани средства',
    value: '2,450 лв',
    change: '87% събираемост',
    icon: DollarSign,
    color: 'green'
  },
  {
    label: 'Очаквани приходи',
    value: '2,820 лв',
    change: 'За този месец',
    icon: TrendingUp,
    color: 'purple'
  },
  {
    label: 'Просрочени плащания',
    value: '3',
    change: '370 лв общо',
    icon: AlertCircle,
    color: 'red'
  }
];

const recentPayments = [
  { name: 'Иван Иванов', apartment: 'Ап. 12', amount: 85.00, date: '2025-12-01', status: 'paid' },
  { name: 'Мария Петрова', apartment: 'Ап. 5', amount: 85.00, date: '2025-12-01', status: 'paid' },
  { name: 'Георги Стоянов', apartment: 'Ап. 8', amount: 85.00, date: '2025-11-28', status: 'paid' },
  { name: 'Петър Димитров', apartment: 'Ап. 3', amount: 85.00, date: '2025-11-25', status: 'paid' }
];

export function AdminOverview() {
  const { selectedBuilding } = useSelection();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Преглед</h1>
        <p className="text-gray-600">Обобщена информация за входа</p>
      </div>

      {/* Статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            red: 'bg-red-100 text-red-600'
          };
          
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors[stat.color as keyof typeof colors]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
              <div className="text-gray-500 text-xs">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последни плащания */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-gray-900">Последни плащания</h2>
          </div>
          <div className="divide-y">
            {recentPayments.map((payment, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-900">{payment.name}</div>
                    <div className="text-gray-600 text-sm">{payment.apartment}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900">{payment.amount.toFixed(2)} лв</div>
                    <div className="text-gray-500 text-sm">
                      {new Date(payment.date).toLocaleDateString('bg-BG')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Предстоящи задачи */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-gray-900">Предстоящи задачи</h2>
          </div>
          <div className="divide-y">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded" />
                <div>
                  <div className="text-gray-900">Подготовка за общо събрание</div>
                  <div className="text-gray-600 text-sm">Падеж: 15 дек 2025</div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded" />
                <div>
                  <div className="text-gray-900">Плащане на асансьорна компания</div>
                  <div className="text-gray-600 text-sm">Падеж: 10 дек 2025</div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded" />
                <div>
                  <div className="text-gray-900">Напомняне за неплатили</div>
                  <div className="text-gray-600 text-sm">Падеж: 8 дек 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}