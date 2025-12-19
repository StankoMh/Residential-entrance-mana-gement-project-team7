import { Plus, Calendar, Clock, MapPin, Trash2, Edit2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { eventService, type Notice, type CreateNoticeRequest, type NoticeType } from '../services/eventService';
import { useSelection } from '../contexts/SelectionContext';
import { toast } from 'sonner';

export function EventsManagement() {
  const { selectedBuilding } = useSelection();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NoticeType>('ACTIVE');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (selectedBuilding) {
      loadNotices();
    }
  }, [selectedBuilding, filter]);

  const loadNotices = async () => {
    if (!selectedBuilding) return;

    try {
      setLoading(true);
      const data = await eventService.getAll(selectedBuilding.id, filter);
      setNotices(data);
    } catch (error) {
      console.error('Error loading notices:', error);
      toast.error('Грешка при зареждане на събитията');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noticeId: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това събитие?')) {
      return;
    }

    try {
      await eventService.delete(noticeId);
      toast.success('Събитието беше изтрито успешно');
      loadNotices();
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Грешка при изтриване на събитието');
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNotice(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    loadNotices();
  };

  if (!selectedBuilding) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 mb-2">Няма избрана сграда</h3>
        <p className="text-gray-600">
          Моля, изберете сграда за да управлявате събития
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Управление на събития</h1>
          <p className="text-gray-600">Създаване и организиране на събития за {selectedBuilding.name}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добави събитие
        </button>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-lg shadow p-2 inline-flex gap-2">
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'ACTIVE'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Активни
        </button>
        <button
          onClick={() => setFilter('HISTORY')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'HISTORY'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Минали
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Всички
        </button>
      </div>

      {/* Списък със събития */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">Зареждане на събития...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">Няма събития</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'ACTIVE' && 'Няма предстоящи събития за момента'}
            {filter === 'HISTORY' && 'Няма минали събития'}
            {filter === 'ALL' && 'Няма създадени събития'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Създай първо събитие
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notices.map((notice) => {
            const noticeDate = new Date(notice.noticeDateTime);
            const isPast = noticeDate < new Date();

            return (
              <div key={notice.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">{notice.title}</h3>
                      {isPast && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          Минало събитие
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(notice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Редактирай"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Изтрий"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{notice.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{noticeDate.toLocaleDateString('bg-BG', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{noticeDate.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {notice.location && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{notice.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal за добавяне/редактиране */}
      {showModal && (
        <NoticeModal
          buildingId={selectedBuilding.id}
          notice={editingNotice}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

// Modal component за създаване/редактиране на събитие
interface NoticeModalProps {
  buildingId: number;
  notice: Notice | null;
  onClose: () => void;
  onSuccess: () => void;
}

function NoticeModal({ buildingId, notice, onClose, onSuccess }: NoticeModalProps) {
  const [formData, setFormData] = useState({
    title: notice?.title || '',
    description: notice?.description || '',
    location: notice?.location || '',
    date: notice ? notice.noticeDateTime.split('T')[0] : '',
    time: notice ? notice.noticeDateTime.split('T')[1]?.substring(0, 5) : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Заглавието е задължително';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описанието е задължително';
    }

    if (!formData.date) {
      newErrors.date = 'Датата е задължителна';
    }

    if (!formData.time) {
      newErrors.time = 'Часът е задължителен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const noticeDateTime = `${formData.date}T${formData.time}:00`;
      const requestData: CreateNoticeRequest = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        noticeDateTime,
      };

      if (notice) {
        await eventService.update(notice.id, requestData);
        toast.success('Събитието беше обновено успешно!');
      } else {
        await eventService.create(buildingId, requestData);
        toast.success('Събитието беше създадено успешно!');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving notice:', error);
      toast.error(error.message || 'Грешка при запазване на събитието');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">
              {notice ? 'Редактиране на събитие' : 'Добавяне на ново събитие'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block mb-2 text-gray-700">Заглавие *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Общо събрание"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block mb-2 text-gray-700">Описание *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Кратко описание..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-gray-700">Дата *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block mb-2 text-gray-700">Час *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.time ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700">Място</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Партер, вход А"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (notice ? 'Запазване...' : 'Създаване...') : (notice ? 'Запази' : 'Създай')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
