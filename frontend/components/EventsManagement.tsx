import { Plus, Calendar, Clock, MapPin, Trash2, Edit2, X, Upload, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { eventService, type Notice, type CreateNoticeRequest, type NoticeType, type DocumentType } from '../services/eventService';
import { useSelection } from '../contexts/SelectionContext';
import { toast } from 'sonner';
import { DateTimePicker } from './ui/datetime-picker';

export function EventsManagement() {
  const { selectedBuilding } = useSelection();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NoticeType>('ACTIVE');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

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
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Всички
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ACTIVE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Предстоящи
            </button>
            <button
              onClick={() => setFilter('HISTORY')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'HISTORY'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Минали
            </button>
          </div>
        </div>
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
            {filter === 'ACTIVE' && 'В момента няма предстоящи събития. Проверете отново по-късно.'}
            {filter === 'HISTORY' && 'Все още няма минали събития.'}
            {filter === 'ALL' && 'Все още няма създадени събития.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Създай събитие
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((notice) => {
            const noticeDate = new Date(notice.noticeDateTime);
            const isPast = noticeDate < new Date();

            return (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-gray-900 flex-1 pr-2">{notice.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        {isPast ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                            Минало
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm whitespace-nowrap">
                            <Calendar className="w-4 h-4" />
                            Предстоящо
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isPast) {
                              handleEdit(notice);
                            } else {
                              toast.error('Не може да се редактира минало събитие');
                            }
                          }}
                          disabled={isPast}
                          className={`p-2 rounded-lg transition-colors ${
                            !isPast
                              ? 'hover:bg-blue-50 text-blue-600'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={!isPast ? 'Редактирай' : 'Не може да се редактира минало събитие'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isPast) {
                              handleDelete(notice.id);
                            } else {
                              toast.error('Не може да се изтрие минало събитие');
                            }
                          }}
                          disabled={isPast}
                          className={`p-2 rounded-lg transition-colors ${
                            !isPast
                              ? 'hover:bg-red-50 text-red-600'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={!isPast ? 'Изтрий' : 'Не може да се изтрие минало събитие'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                      })}{' '}
                      в {noticeDate.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {notice.document && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600">Има прикачен документ</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal за преглед на събитие */}
      {selectedNotice && (
        <EventManagementModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
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
  // При редактиране конвертираме UTC обратно в локално време
  const formatDateTimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: notice?.title || '',
    description: notice?.description || '',
    location: notice?.location || '',
    dateTime: notice ? formatDateTimeLocal(notice.noticeDateTime) : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Document upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('PROTOCOL');
  const [documentVisibleToResidents, setDocumentVisibleToResidents] = useState(true);
  const [showDocumentSection, setShowDocumentSection] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Моля, изберете PDF или изображение (JPG, PNG)');
      e.target.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Файлът е твърде голям. Максимален размер: 10MB');
      e.target.value = '';
      return;
    }

    setUploadFile(file);
    if (!documentTitle) {
      setDocumentTitle(file.name);
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setDocumentTitle('');
    setDocumentDescription('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Заглавието е задължително';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описанието е задължително';
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Датата и часът са задължителни';
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

      // Създаваме Date обект от локалното време и го конвертираме в ISO string (UTC)
      const localDateTime = new Date(formData.dateTime);
      const noticeDateTime = localDateTime.toISOString();

      const requestData: CreateNoticeRequest = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        noticeDateTime,
      };

      if (notice) {
        // Edit mode: JSON endpoint (no document support)
        await eventService.update(notice.id, requestData);
        toast.success('Събитието беше обновено успешно!');
      } else {
        // Create mode
        if (uploadFile) {
          await eventService.createWithDocument(
            buildingId,
            requestData,
            uploadFile,
            {
              title: documentTitle,
              description: documentDescription,
              type: documentType,
              visibleToResidents: documentVisibleToResidents,
            }
          );
        } else {
          await eventService.create(buildingId, requestData);
        }
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

          <div>
            <label className="flex items-center gap-2 mb-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              Дата и час *
            </label>
            <DateTimePicker
              value={formData.dateTime}
              onChange={(value) => setFormData({ ...formData, dateTime: value })}
              error={!!errors.dateTime}
            />
            {errors.dateTime && <p className="text-red-500 text-sm mt-1">{errors.dateTime}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 text-gray-700">
              <MapPin className="w-4 h-4" />
              Място
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
              placeholder="Партер, вход А"
            />
          </div>

          {/* Document upload section - only in create mode */}
          {!notice && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700">Прикачен документ (опционално)</label>
                {!showDocumentSection && !uploadFile && (
                  <button
                    type="button"
                    onClick={() => setShowDocumentSection(true)}
                    className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    Добави документ
                  </button>
                )}
              </div>

              {(showDocumentSection || uploadFile) && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  {!uploadFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="notice-file-upload"
                        accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                      />
                      <label htmlFor="notice-file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-1">Кликнете за избор на файл</p>
                        <p className="text-gray-400 text-sm">PDF или изображение (JPG, PNG)</p>
                      </label>
                    </div>
                  ) : (
                    <>
                      {/* File preview */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">{uploadFile.name}</span>
                            <span className="text-sm text-gray-500">({formatFileSize(uploadFile.size)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Document metadata */}
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 text-sm text-gray-700">Заглавие на документ *</label>
                          <input
                            type="text"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Протокол от общо събрание"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm text-gray-700">Тип документ</label>
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="PROTOCOL">Протокол</option>
                            <option value="RULEBOOK">Правилник</option>
                            <option value="CONTRACT">Договор</option>
                            <option value="DECISION">Решение</option>
                            <option value="OTHER">Друго</option>
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1 text-sm text-gray-700">Описание</label>
                          <textarea
                            rows={2}
                            value={documentDescription}
                            onChange={(e) => setDocumentDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Кратко описание на документа..."
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="document-visible"
                            checked={documentVisibleToResidents}
                            onChange={(e) => setDocumentVisibleToResidents(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="document-visible" className="text-sm text-gray-700 cursor-pointer">
                            Видим за жителите
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

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

// Modal component за преглед на събитие
interface EventManagementModalProps {
  notice: Notice;
  onClose: () => void;
}

function EventManagementModal({ notice, onClose }: EventManagementModalProps) {
  const noticeDate = new Date(notice.noticeDateTime);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Информация за събитие</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block mb-2 text-gray-700">Заглавие *</label>
            <input
              type="text"
              value={notice.title}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Общо събрание"
              readOnly
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700">Описание *</label>
            <textarea
              rows={3}
              value={notice.description}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Кратко описание..."
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-gray-700">Дата *</label>
              <input
                type="date"
                value={noticeDate.toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700">Час *</label>
              <input
                type="time"
                value={noticeDate.toISOString().split('T')[1].split('.')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700">Място</label>
            <input
              type="text"
              value={notice.location}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Партер, вход А"
              readOnly
            />
          </div>

          {notice.document && (
            <div className="border-t pt-4 mt-4">
              <label className="block mb-2 text-gray-700">Прикачен документ</label>
              <div className="border border-gray-300 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-gray-900">{notice.document.title}</div>
                      <div className="text-sm text-gray-500">{notice.document.type}</div>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:8080${notice.document.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Отвори документа"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Затвори
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}