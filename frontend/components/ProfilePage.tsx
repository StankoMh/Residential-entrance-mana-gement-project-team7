import { useEffect, useState } from 'react';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../contexts/SelectionContext';
import type { User as UserType } from '../types/database';

export function ProfilePage() {
  const navigate = useNavigate();
  const { clearSelection } = useSelection();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await authService.me();
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Грешка при зареждане на профила');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearSelection();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Дори при грешка, пренасочваме към началната страница
      clearSelection();
      navigate('/');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане на профил...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || 'Потребителят не е намерен'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Моят профил</h1>
        <p className="text-gray-600">Преглед и управление на личните данни</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Основна информация */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <h2 className="text-gray-900">Основна информация</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Пълно име */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Пълно име</label>
              <p className="text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
          </div>

          {/* Имейл */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Имейл адрес</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>

          {/* Дата на създаване */}
          {user.createdAt && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Регистриран на</label>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          )}

          {/* Последна актуализация */}
          {user.updatedAt && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Последна актуализация</label>
                <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Информация за сигурността */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-gray-900">Изход</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="text-gray-900 mb-1">Излизане от профила</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Изход
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}