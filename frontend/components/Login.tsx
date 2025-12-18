import { Building2, Mail, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // При зареждане на компонента, проверяваме дали имаме запазен имейл
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && wasRemembered) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password, rememberMe });
      // Ако rememberMe е true, запазваме имейла в localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Ако rememberMe е false, изтриваме запазения имейл
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      // Пренасочваме към dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Обработка на различни типове грешки
      if (err.message) {
        setError(err.message);
      } else {
        setError('Грешен имейл или парола. Моля опитайте отново.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white min-h-[calc(100vh-200px)] flex items-center">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Лого и заглавие */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="mb-2 text-gray-900">Добре дошли обратно</h2>
            <p className="text-gray-600">Влезте във вашия акаунт</p>
          </div>

          {/* Съобщение за грешка */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Форма за вход */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-2 text-gray-700">
                Имейл адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="vashemail@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-gray-700">
                Парола
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-gray-700">Запомни ме</span>
              </label>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Забравена парола?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Влизане...' : 'Вход'}
            </button>
          </form>

          {/* Линк към регистрация */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нямате акаунт?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Регистрирайте се
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}