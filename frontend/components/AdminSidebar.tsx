import { LayoutDashboard, Users, Receipt, Calendar, Vote, Archive, Home, TrendingUp } from 'lucide-react';
import { AdminView } from '../types/views';
import { useSelection } from '../contexts/SelectionContext';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const menuItems = [
  { id: 'homes' as AdminView, label: 'Моите жилища', icon: Home },
  { id: 'overview' as AdminView, label: 'Преглед', icon: LayoutDashboard },
  { id: 'apartments' as AdminView, label: 'Апартаменти', icon: Users },
  { id: 'payments' as AdminView, label: 'Плащания', icon: Receipt },
  { id: 'events' as AdminView, label: 'Събития', icon: Calendar },
  { id: 'voting' as AdminView, label: 'Гласувания', icon: Vote },
  { id: 'archive' as AdminView, label: 'Архив', icon: Archive },
];

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const { selectedBuilding } = useSelection();

  return (
    <aside className="w-64 bg-white border-r fixed left-0 top-[85px] bottom-0 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            // Показва само "Моите жилища" ако няма избран вход (освен ако не сме на профил)
            const shouldShow = !selectedBuilding ? item.id === 'homes' : true;
            // Ако currentView е 'profile', третираме го като че има избран вход
            const isProfileView = currentView === 'profile';
            
            if (!shouldShow && !isProfileView) return null;
            
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