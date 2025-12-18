import { HelpCircle, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ЧСВ отляво */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-gray-900">Често задавани въпроси</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-900">Как да регистрирам моя вход?</p>
                <p className="text-gray-600">Кликнете на бутона "Регистрация" и попълнете необходимата информация за вашия вход.</p>
              </div>
              <div>
                <p className="text-gray-900">Безплатна ли е платформата?</p>
                <p className="text-gray-600">Предлагаме безплатен базов план и премиум опции с разширени функции.</p>
              </div>
              <div>
                <p className="text-gray-900">Как се управляват плащанията?</p>
                <p className="text-gray-600">Управителят на входа може да въвежда разходи и да следи плащанията на жителите.</p>
              </div>
            </div>
          </div>
          
          {/* Контакти отдясно */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <h3 className="text-gray-900">Контакти</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="text-gray-900">Имейл</p>
                  <p className="text-gray-600">info@smartentrance.bg</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="text-gray-900">Телефон</p>
                  <p className="text-gray-600">+359 2 123 4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="text-gray-900">Адрес</p>
                  <p className="text-gray-600">гр. София, бул. Витоша 1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>&copy; 2025 SmartEntrance. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
}
