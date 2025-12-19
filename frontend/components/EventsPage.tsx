import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Filter, CalendarDays, X } from 'lucide-react';
import { eventService, type Notice, type NoticeType } from '../services/eventService';
import { useSelection } from '../contexts/SelectionContext';

export function EventsPage() {
  const { selectedUnit } = useSelection();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<NoticeType>('ACTIVE');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (selectedUnit?.buildingId) {
      loadNotices();
    }
  }, [selectedUnit, filterType]);

  const loadNotices = async () => {
    if (!selectedUnit?.buildingId) {
      setNotices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await eventService.getAll(selectedUnit.buildingId, filterType);
      setNotices(data);
    } catch (err) {
      console.error('Error loading notices:', err);
      setError('Грешка при зареждане на събитията');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (noticeDateTime: string) => {
    return new Date(noticeDateTime) > new Date();
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане на събития...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Събития</h1>
        <p className="text-gray-600">Срещи и дейности на входа</p>
      </div>

      {/* Филтри */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Всички
            </button>
            <button
              onClick={() => setFilterType('ACTIVE')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'ACTIVE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Предстоящи
            </button>
            <button
              onClick={() => setFilterType('HISTORY')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'HISTORY'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Минали
            </button>
          </div>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">
            {filterType === 'ACTIVE' && 'Няма предстоящи събития'}
            {filterType === 'HISTORY' && 'Няма минали събития'}
            {filterType === 'ALL' && 'Няма събития'}
          </h3>
          <p className="text-gray-600">
            {filterType === 'ACTIVE' && 'В момента няма предстоящи събития. Проверете отново по-късно.'}
            {filterType === 'HISTORY' && 'Все още няма минали събития.'}
            {filterType === 'ALL' && 'Все още няма създадени събития.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notices.map((notice) => {
            const noticeDate = new Date(notice.noticeDateTime);
            const upcoming = isUpcoming(notice.noticeDateTime);

            return (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-gray-900 flex-1 pr-2">{notice.title}</h3>
                    <div className="flex-shrink-0">
                      {upcoming ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm whitespace-nowrap">
                          <Calendar className="w-4 h-4" />
                          Предстоящо
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                          Минало
                        </span>
                      )}
                    </div>
                  </div>

                  {notice.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{notice.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {noticeDate.toLocaleDateString('bg-BG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' • '}
                      {noticeDate.toLocaleTimeString('bg-BG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal за детайли на събитие */}
      {selectedNotice && (
        <EventModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
          isUpcoming={isUpcoming}
        />
      )}
    </div>
  );
}

// Modal компонент за преглед на събитие
interface EventModalProps {
  notice: Notice;
  onClose: () => void;
  isUpcoming: (noticeDateTime: string) => boolean;
}

function EventModal({ notice, onClose, isUpcoming }: EventModalProps) {
  const noticeDate = new Date(notice.noticeDateTime);
  const upcoming = isUpcoming(notice.noticeDateTime);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-gray-900 mb-2">{notice.title}</h2>
            </div>
            <div className="flex items-center gap-3">
              {upcoming ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm whitespace-nowrap">
                  <Calendar className="w-4 h-4" />
                  Предстоящо
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                  Минало
                </span>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {notice.description && (
            <div className="mb-6">
              <h3 className="text-gray-700 mb-2">Описание</h3>
              <p className="text-gray-600">{notice.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-gray-700">Дата</div>
                <div className="text-gray-900">
                  {noticeDate.toLocaleDateString('bg-BG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-gray-700">Час</div>
                <div className="text-gray-900">
                  {noticeDate.toLocaleTimeString('bg-BG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {notice.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-700">Място</div>
                  <div className="text-gray-900">{notice.location}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}