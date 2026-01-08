import { Building2, User, LogOut, ChevronDown, MapPin, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { User as UserType } from '../types/database';
import { useSelection } from '../contexts/SelectionContext';

interface DashboardHeaderProps {
  onLogout: () => void;
  isAdmin?: boolean;
}

export function DashboardHeader({ onLogout, isAdmin = false }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedBuilding, selectedUnit } = useSelection();

  useEffect(() => {
    // Зареди текущия потребител от backend
    const loadUser = async () => {
      try {
        const user = await authService.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load user:', error);
        // Fallback към localStorage
        const user = authService.getCurrentUser();
        setCurrentUser(user);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Затваряне на профилното меню при клик извън него
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    // Навигираме към правилния профил според режима
    if (isAdmin) {
      navigate('/admin/dashboard/profile');
    } else {
      navigate('/dashboard/profile');
    }
  };

  return (
    <header className="bg-white border-b fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Лого */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <span className="text-blue-600 block"><b>SmartEntrance</b></span>
              <span className="text-gray-500 text-sm">
                Панел за управление
              </span>
            </div>
          </div>
          
          {/* Информация за избрания вход/апартамент */}
          {isAdmin && selectedBuilding && (
            <>
              <div className="ml-9 h-8 w-px bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="text-gray-900">{selectedBuilding.name}</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedBuilding.address}, Вход: {selectedBuilding.entrance}</span>
                </div>
              </div>
            </>
          )}
          
          {!isAdmin && selectedUnit && (
            <>
              <div className="ml-9 h-8 w-px bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="text-gray-900">Апартамент {selectedUnit.unitNumber}</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Home className="w-3 h-3" />
                  <span>{selectedUnit.buildingAddress}, {selectedUnit.buildingName}</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Профил отдясно */}
        <div className="flex items-center gap-4">
          {/* Профилно меню */}
          <div className="relative profile-menu">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left hidden md:block">
                <div className="text-gray-900">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Потребител'}
                </div>
                <div className="text-gray-500 text-sm">
                  {currentUser?.email}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Dropdown меню */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-6 w-56 bg-white rounded-lg shadow-lg border py-2">
                <button 
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                >
                  <User className="w-4 h-4" />
                  Моят профил
                </button>
                
                <div className="border-t my-1"></div>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Изход
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}