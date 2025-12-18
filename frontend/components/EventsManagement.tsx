import { Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

const events = [
  {
    id: 1,
    title: 'Общо събрание на собствениците',
    date: '2025-12-15',
    time: '18:00',
    location: 'Партер, вход А',
    description: 'Годишно отчетно събрание',
    attendees: 18
  },
  {
    id: 2,
    title: 'Почистване на входа',
    date: '2025-12-08',
    time: '10:00',
    location: 'Цялата сграда',
    description: 'Генерално почистване преди празниците',
    attendees: 12
  },
  {
    id: 3,
    title: 'Ремонт на асансьора',
    date: '2025-12-12',
    time: '09:00',
    location: 'Асансьор',
    description: 'Планово обслужване',
    attendees: 0
  }
];

export function EventsManagement() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Управление на събития</h1>
          <p className="text-gray-600">Създаване и организиране на събития</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добави събитие
        </button>
      </div>

      {/* Списък със събития */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-gray-900">{event.title}</h3>
                <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors">
                  Редактирай
                </button>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{event.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString('bg-BG', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees} потвърдили присъствие</span>
                </div>
              </div>
            </div>
            <div className="border-t p-4 bg-gray-50 flex gap-3">
              <button className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Виж детайли
              </button>
              <button className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Изтрий
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модeл за добавяне на събитие */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-gray-900 mb-4">Добави ново събитие</h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-700">Заглавие</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Общо събрание"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700">Описание</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Кратко описание..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-2 text-gray-700">Дата</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Час</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-gray-700">Място</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Партер, вход А"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Създай
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
