import { Calendar, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { eventService, type Notice } from '../services/eventService';
import { useSelection } from '../contexts/SelectionContext';

interface EventsPanelProps {
  expanded?: boolean;
}

export function EventsPanel({ expanded = false }: EventsPanelProps) {
  const { selectedUnit } = useSelection();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedUnit?.buildingId) {
      loadNotices();
    }
  }, [selectedUnit]);

  const loadNotices = async () => {
    if (!selectedUnit?.buildingId) {
      setNotices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await eventService.getActive(selectedUnit.buildingId);
      setNotices(data);
    } catch (err) {
      console.error('Error loading notices:', err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const displayNotices = expanded ? notices : notices.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center">Зареждане на събития...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-gray-900">Предстоящи събития</h2>
            <p className="text-gray-600 text-sm">Срещи и дейности</p>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {displayNotices.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            Няма предстоящи събития
          </div>
        ) : (
          displayNotices.map((notice) => {
            const noticeDate = new Date(notice.noticeDateTime);
            return (
              <div key={notice.id} className="p-4 hover:bg-gray-50 transition-colors">
                <h3 className="text-gray-900 mb-2">{notice.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{notice.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{noticeDate.toLocaleDateString('bg-BG', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{noticeDate.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {notice.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{notice.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!expanded && notices.length > 3 && (
        <div className="p-4 border-t">
          <button className="w-full text-center text-blue-600 hover:text-blue-700">
            Виж всички събития
          </button>
        </div>
      )}
    </div>
  );
}