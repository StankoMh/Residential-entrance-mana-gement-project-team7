import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Лого отляво */}
        <Link 
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Building2 className="w-8 h-8 text-blue-600" />
          <span className="text-blue-600"><b>SmartEntrance</b></span>
        </Link>
        
        {/* Вход/Регистрация отдясно */}
        <div className="flex items-center gap-3">
          <Link 
            to="/login"
            className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            Вход
          </Link>
          <Link 
            to="/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  );
}