import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="pt-20 pb-8 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto text-center max-w-3xl">
        <h1 className="mb-6 text-blue-900">
          Управлявайте жилищния си вход лесно и ефективно
        </h1>
        <p className="mb-8 text-gray-600 text-lg">
          Модерна платформа за събития, гласувания, плащания и документи - всичко необходимо за управление на жилищни входове
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            to="/login"
            className="w-40 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вход
          </Link>
          <Link 
            to="/register"
            className="w-40 px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Регистрация
          </Link>
        </div>
        
        {/* Елегантна разделителна секция */}
        <div className="flex items-center justify-center gap-4 mt-16">
          <div className="flex-1 max-w-xs">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300"></div>
          </div>
          <div className="relative">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute inset-0 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}