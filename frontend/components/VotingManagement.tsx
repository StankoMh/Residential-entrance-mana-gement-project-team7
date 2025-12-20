import { useEffect, useState } from 'react';
import { Vote, Plus, Trash2, X, Calendar, CheckCircle, AlertCircle, Clock, Edit2, Filter } from 'lucide-react';
import { pollService, type CreatePollRequest, type UpdatePollRequest, type Poll, type PollType } from '../services/pollService';
import { useSelection } from '../contexts/SelectionContext';
import { toast } from 'sonner';
import { DateTimePicker } from './ui/datetime-picker';

export function VotingManagement() {
  const { selectedBuilding } = useSelection();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<PollType>('ALL');
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

  useEffect(() => {
    if (selectedBuilding) {
      loadPolls();
    }
  }, [selectedBuilding, filterType]);

  const loadPolls = async () => {
    if (!selectedBuilding) return;

    try {
      setLoading(true);
      setError('');
      const data = await pollService.getAllPolls(selectedBuilding.id, filterType);
      setPolls(data);
    } catch (err) {
      console.error('Error loading polls:', err);
      setError('Грешка при зареждане на гласуванията');
    } finally {
      setLoading(false);
    }
  };

  // Зареждаме всички гласувания за статистика
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  
  useEffect(() => {
    if (selectedBuilding) {
      loadAllPolls();
    }
  }, [selectedBuilding]);

  const loadAllPolls = async () => {
    if (!selectedBuilding) return;
    
    try {
      const data = await pollService.getAllPolls(selectedBuilding.id, 'ALL');
      setAllPolls(data);
    } catch (err) {
      console.error('Error loading all polls:', err);
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това гласуване?')) {
      return;
    }

    try {
      await pollService.deletePoll(pollId);
      toast.success('Гласуването беше изтрито успешно');
      await loadPolls();
      await loadAllPolls(); // Обновяваме и статистиката
    } catch (err) {
      console.error('Error deleting poll:', err);
      toast.error('Грешка при изтриване на гласуването');
    }
  };

  const getPollStatus = (poll: Poll) => {
    const now = new Date();
    const startDate = new Date(poll.startAt);
    const endDate = new Date(poll.endAt);

    if (poll.status === 'ENDED') return 'ended';
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            Активно
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
            <Clock className="w-4 h-4" />
            Предстоящо
          </span>
        );
      case 'ended':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            Приключило
          </span>
        );
      default:
        return null;
    }
  };

  if (!selectedBuilding) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 mb-2">Няма избрана сграда</h3>
        <p className="text-gray-600">
          Моля, изберете сграда за да управлявате гласувания
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане на гласувания...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Управление на гласувания</h1>
          <p className="text-gray-600">Създавайте и управлявайте гласувания за {selectedBuilding.name}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ново гласуване
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Vote className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-600">Всички</span>
          </div>
          <div className="text-gray-900">{allPolls.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600">Активни</span>
          </div>
          <div className="text-gray-900">
            {allPolls.filter((p) => getPollStatus(p) === 'active').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-gray-600">Приключили</span>
          </div>
          <div className="text-gray-900">
            {allPolls.filter((p) => getPollStatus(p) === 'ended').length}
          </div>
        </div>
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
              Активни
            </button>
            <button
              onClick={() => setFilterType('HISTORY')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'HISTORY'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Приключили
            </button>
          </div>
        </div>
      </div>

      {/* Списък с гласувания */}
      {polls.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">
            {filterType === 'ALL' && 'Няма създадени гласувани'}
            {filterType === 'ACTIVE' && 'Няма активни гласувания'}
            {filterType === 'HISTORY' && 'Няма приключили гласувания'}
          </h3>
          <p className="text-gray-600">
            {filterType === 'ALL' && 'Създайте първото си гласуване за жителите'}
            {filterType === 'ACTIVE' && 'Всички активни гласувания ще се показват тук'}
            {filterType === 'HISTORY' && 'Всички приключили гласувания ще се показват тук'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {polls.map((poll) => {
            const status = getPollStatus(poll);

            return (
              <div 
                key={poll.id} 
                onClick={() => setSelectedPoll(poll)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-gray-900 flex-1 pr-2">{poll.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        {getStatusBadge(status)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (status === 'upcoming') {
                              setEditingPoll(poll);
                            } else {
                              toast.error('Не може да се редактира активно или приключило гласуване');
                            }
                          }}
                          disabled={status !== 'upcoming'}
                          className={`p-2 rounded-lg transition-colors ${
                            status === 'upcoming'
                              ? 'hover:bg-blue-50 text-blue-600'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={
                            status === 'upcoming'
                              ? 'Редактирай'
                              : 'Не може да се редактира активно или приключило гласуване'
                          }
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (status === 'upcoming') {
                              handleDeletePoll(poll.id);
                            } else {
                              toast.error('Не може да се изтрие активно или приключило гласуване');
                            }
                          }}
                          disabled={status !== 'upcoming'}
                          className={`p-2 rounded-lg transition-colors ${
                            status === 'upcoming'
                              ? 'hover:bg-red-50 text-red-600'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={
                            status === 'upcoming'
                              ? 'Изтрий'
                              : 'Не може да се изтрие активно или приключило гласуване'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {poll.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{poll.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {new Date(poll.startAt).toLocaleDateString('bg-BG', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      {' - '}
                      {new Date(poll.endAt).toLocaleDateString('bg-BG', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal за преглед на гласуване */}
      {selectedPoll && (
        <PollManagementModal
          poll={selectedPoll}
          onClose={() => setSelectedPoll(null)}
          getPollStatus={getPollStatus}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Modal за създаване на гласуване */}
      {showCreateModal && (
        <CreatePollModal
          buildingId={selectedBuilding.id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadPolls();
            loadAllPolls(); // Обновяваме и статистиката
          }}
        />
      )}

      {/* Modal за редактиране на гласуване */}
      {editingPoll && (
        <EditPollModal
          poll={editingPoll}
          onClose={() => setEditingPoll(null)}
          onSuccess={() => {
            setEditingPoll(null);
            loadPolls();
            loadAllPolls(); // Обновяваме и статистиката
          }}
        />
      )}
    </div>
  );
}

// Modal компонент за преглед на гласуване
interface PollManagementModalProps {
  poll: Poll;
  onClose: () => void;
  getPollStatus: (poll: Poll) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

function PollManagementModal({ poll, onClose, getPollStatus, getStatusBadge }: PollManagementModalProps) {
  const status = getPollStatus(poll);

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Информация за гласуване</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Заглавие и Статистика */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Заглавие *</label>
              <input
                type="text"
                value={poll.title}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Напр. Одобрение на бюджет за 2025"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Статистика</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Гласували:</span>
                  <span className="text-gray-900">
                    {poll.totalVotes} от {poll.totalEligibleVoters}
                  </span>
                </div>
                {getStatusBadge(status)}
              </div>
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-gray-700 mb-2">Описание</label>
            <textarea
              value={poll.description || ''}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Допълнителна информация за гласуването..."
            />
          </div>

          {/* Дати */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 mb-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                Начална дата *
              </label>
              <input
                type="datetime-local"
                value={new Date(poll.startAt).toISOString().slice(0, 16)}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  colorScheme: 'light',
                }}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-gray-700">
                <Clock className="w-4 h-4" />
                Крайна дата *
              </label>
              <input
                type="datetime-local"
                value={new Date(poll.endAt).toISOString().slice(0, 16)}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  colorScheme: 'light',
                }}
              />
            </div>
          </div>

          {/* Опции */}
          <div>
            <label className="block text-gray-700 mb-2">Опции и резултати</label>
            <div className="space-y-2">
              {poll.options?.map((option, index) => {
                const maxVotes = Math.max(...poll.options.map(o => o.voteCount));
                const barWidth = maxVotes > 0 ? (option.voteCount / maxVotes) * 100 : 0;
                
                return (
                  <div key={index} className="relative">
                    <div className="relative overflow-hidden rounded-lg border-2 border-gray-200">
                      {/* Progress bar background */}
                      <div 
                        className="absolute inset-0 bg-blue-50 transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                      
                      {/* Content */}
                      <div className="relative p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">{option.text}</span>
                          <span className="px-3 py-1 rounded bg-gray-700 text-white text-sm">
                            {option.voteCount} {option.voteCount === 1 ? 'глас' : 'гласа'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Бутон за затваряне */}
          <div className="flex justify-end pt-2 border-t">
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

// Modal компонент за създаване на ново гласуване
interface CreatePollModalProps {
  buildingId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function CreatePollModal({ buildingId, onClose, onSuccess }: CreatePollModalProps) {
  const [formData, setFormData] = useState<CreatePollRequest>({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    options: ['', ''],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast.error('Трябва да има поне 2 опции');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Заглавието е задължително';
    }

    if (!formData.startAt) {
      newErrors.startAt = 'Началната дата е задължителна';
    }

    if (!formData.endAt) {
      newErrors.endAt = 'Крайната дата е задължителна';
    }

    if (formData.startAt && formData.endAt && new Date(formData.startAt) >= new Date(formData.endAt)) {
      newErrors.endAt = 'Крайната дата трябва да е след началната';
    }

    const validOptions = formData.options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      newErrors.options = 'Трябва да има поне 2 валидни опции';
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

      // Конвертираме datetime-local към ISO UTC формат
      const startAtUTC = new Date(formData.startAt).toISOString();
      const endAtUTC = new Date(formData.endAt).toISOString();

      // Филтрираме празните опции
      const pollData = {
        title: formData.title,
        description: formData.description,
        startAt: startAtUTC,
        endAt: endAtUTC,
        options: formData.options.filter((opt) => opt.trim()),
      };

      await pollService.createPoll(buildingId, pollData);
      toast.success('Гласуването беше създадено успешно!');
      onSuccess();
    } catch (err: any) {
      console.error('Error creating poll:', err);
      toast.error(err.message || 'Грешка при създаване на гласуването');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Създаване на ново гласуване</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Заглавие и Дати в един ред */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
              <label className="block text-gray-700 mb-2">Заглавие *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Напр. Одобрение на бюджет за 2025"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
          </div>

          {/* Дати */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 mb-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                Начална дата *
              </label>
              <DateTimePicker
                value={formData.startAt}
                onChange={(value) => setFormData({ ...formData, startAt: value })}
                error={!!errors.startAt}
              />
              {errors.startAt && <p className="text-red-500 text-sm mt-1">{errors.startAt}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-gray-700">
                <Clock className="w-4 h-4" />
                Крайна дата *
              </label>
              <DateTimePicker
                value={formData.endAt}
                onChange={(value) => setFormData({ ...formData, endAt: value })}
                error={!!errors.endAt}
              />
              {errors.endAt && <p className="text-red-500 text-sm mt-1">{errors.endAt}</p>}
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-gray-700 mb-2">Описание (опционално)</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Допълнителна информация за гласуването..."
            />
          </div>

          {/* Опции */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700">Опции за гласуване *</label>
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Добави опция
              </button>
            </div>

            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Опция ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
          </div>

          {/* Бутони */}
          <div className="flex items-center gap-3 pt-2 border-t">
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
              {isSubmitting ? 'Създаване...' : 'Създай гласуване'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal компонент за редактиране на гласуване
interface EditPollModalProps {
  poll: Poll;
  onClose: () => void;
  onSuccess: () => void;
}

function EditPollModal({ poll, onClose, onSuccess }: EditPollModalProps) {
  // Конвертираме UTC времето от сървъра към локално datetime-local формат
  const formatDateTimeLocal = (dateStr: string) => {
    const date = new Date(dateStr);
    // Извличаме локалното време в ISO формат и махаме секундите и милисекундите
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<UpdatePollRequest>({
    title: poll.title,
    description: poll.description,
    startAt: formatDateTimeLocal(poll.startAt),
    endAt: formatDateTimeLocal(poll.endAt),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Заглавието е задължително';
    }

    if (!formData.startAt) {
      newErrors.startAt = 'Началната дата е задължителна';
    }

    if (!formData.endAt) {
      newErrors.endAt = 'Крайната дата е задължителна';
    }

    if (formData.startAt && formData.endAt && new Date(formData.startAt) >= new Date(formData.endAt)) {
      newErrors.endAt = 'Крайната дата трябва да е след началната';
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
      
      // Конвертираме datetime-local към ISO UTC формат
      const startAtUTC = new Date(formData.startAt).toISOString();
      const endAtUTC = new Date(formData.endAt).toISOString();

      const pollData: UpdatePollRequest = {
        title: formData.title,
        description: formData.description,
        startAt: startAtUTC,
        endAt: endAtUTC,
      };

      console.log('📤 Изпращане на PUT /api/polls/' + poll.id, pollData);

      await pollService.updatePoll(poll.id, pollData);
      toast.success('Гласуването беше редактирано успешно!');
      onSuccess();
    } catch (err: any) {
      console.error('Error updating poll:', err);
      toast.error(err.message || 'Грешка при редактиране на гласуването');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Редактиране на гласуване</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Заглавие */}
          <div>
            <label className="block text-gray-700 mb-2">Заглавие *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Напр. Одобрение на бюджет за 2025"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Дати */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 mb-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                Начална дата *
              </label>
              <DateTimePicker
                value={formData.startAt}
                onChange={(value) => setFormData({ ...formData, startAt: value })}
                error={!!errors.startAt}
              />
              {errors.startAt && <p className="text-red-500 text-sm mt-1">{errors.startAt}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-gray-700">
                <Clock className="w-4 h-4" />
                Крайна дата *
              </label>
              <DateTimePicker
                value={formData.endAt}
                onChange={(value) => setFormData({ ...formData, endAt: value })}
                error={!!errors.endAt}
              />
              {errors.endAt && <p className="text-red-500 text-sm mt-1">{errors.endAt}</p>}
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-gray-700 mb-2">Описание (опционално)</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Допълнителна информация за гласуването..."
            />
          </div>

          {/* Бутони */}
          <div className="flex items-center gap-3 pt-2 border-t">
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
              {isSubmitting ? 'Редактиране...' : 'Редактирай гласуване'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}