import { Building2, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация на паролите
    if (formData.password !== formData.confirmPassword) {
      setError('Паролите не съвпадат');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        rememberMe,
      });

      // Успешна регистрация - пренасочи към dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Обработка на различни типове грешки
      if (err.status === 409) {
        setError('Потребител с този имейл вече съществува. Моля, използвайте друг имейл или влезте в профила си.');
      } else if (err.message) {
        if (err.message.toLowerCase().includes('already exists') || 
            err.message.toLowerCase().includes('вече съществува') ||
            err.message.toLowerCase().includes('email already in use')) {
          setError('Потребител с този имейл вече съществува. Моля, използвайте друг имейл или влезте в профила си.');
        } else if (err.message.toLowerCase().includes('failed to fetch')) {
          setError('Не може да се свърже със сървъра. Моля, опитайте отново по-късно.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Грешка при регистрация. Моля опитайте отново.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Лого и заглавие */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="mb-2 text-gray-900">Създайте акаунт</h2>
            <p className="text-gray-600">Присъединете се към платформата</p>
          </div>

          {/* Съобщение за грешка */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Форма за регистрация */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Име */}
            <div>
              <label className="block text-gray-700 mb-2">Име</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Иван"
                />
              </div>
            </div>

            {/* Фамилия */}
            <div>
              <label className="block text-gray-700 mb-2">Фамилия</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Иванов"
                />
              </div>
            </div>

            {/* Имейл */}
            <div>
              <label className="block text-gray-700 mb-2">Имейл</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="ivan@example.com"
                />
              </div>
            </div>

            {/* Парола */}
            <div>
              <label className="block text-gray-700 mb-2">Парола</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Потвърждение на парола */}
            <div>
              <label className="block text-gray-700 mb-2">Потвърдете паролата</label>
              <div className="relative mb-15">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Бутон за регистрация */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Регистрация...' : 'Регистрирай се'}
            </button>
          </form>

          {/* Връзка към вход */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Вече имате акаунт?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700">
                Влезте тук
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
