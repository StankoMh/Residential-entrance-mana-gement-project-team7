import { LayoutDashboard, Receipt, Vote, Calendar, Home, Archive, TrendingUp } from 'lucide-react';
import { DashboardView } from '../types/views';
import { useSelection } from '../contexts/SelectionContext';

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const menuItems = [
  { id: 'homes' as DashboardView, label: 'Моите жилища', icon: Home },
  { id: 'overview' as DashboardView, label: 'Преглед', icon: LayoutDashboard },
  { id: 'payments' as DashboardView, label: 'Плащания', icon: Receipt },
  { id: 'events' as DashboardView, label: 'Събития', icon: Calendar },
  { id: 'voting' as DashboardView, label: 'Гласувания', icon: Vote },
  { id: 'archive' as DashboardView, label: 'Архив', icon: Archive },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { selectedUnit } = useSelection();

  return (
    <aside className="w-64 bg-white border-r fixed left-0 top-[85px] bottom-0 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            // Показва само "Моите жилища" ако няма избран апартамент
            const shouldShow = !selectedUnit ? item.id === 'homes' : true;
            
            if (!shouldShow) return null;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}