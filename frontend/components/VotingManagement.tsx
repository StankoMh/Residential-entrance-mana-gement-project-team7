import { useEffect, useState } from 'react';
import { Vote, Plus, Trash2, X, Calendar, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { pollService, type CreatePollRequest } from '../services/pollService';
import type { VotesPollWithResults } from '../types/database';

export function VotingManagement() {
  const [polls, setPolls] = useState<VotesPollWithResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await pollService.getAllPolls();
      setPolls(data);
    } catch (err) {
      console.error('Error loading polls:', err);
      setError('Грешка при зареждане на гласуванията');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това гласуване?')) {
      return;
    }

    try {
      await pollService.deletePoll(pollId);
      await loadPolls();
      alert('Гласуването беше изтрито успешно');
    } catch (err) {
      console.error('Error deleting poll:', err);
      alert('Грешка при изтриване на гласуването');
    }
  };

  const handleClosePoll = async (pollId: number) => {
    if (!confirm('Сигурни ли сте, че искате да затворите това гласуване?')) {
      return;
    }

    try {
      await pollService.closePoll(pollId);
      await loadPolls();
      alert('Гласуването беше затворено успешно');
    } catch (err) {
      console.error('Error closing poll:', err);
      alert('Грешка при затваряне на гласуването');
    }
  };

  const getPollStatus = (poll: VotesPollWithResults) => {
    const now = new Date();
    const startDate = new Date(poll.startAt);
    const endDate = new Date(poll.endAt);

    if (!poll.isActive) return 'closed';
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
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            Затворено
          </span>
        );
      default:
        return null;
    }
  };

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
          <p className="text-gray-600">Създавайте и управлявайте гласувания</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Vote className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-600">Всички</span>
          </div>
          <div className="text-gray-900">{polls.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600">Активни</span>
          </div>
          <div className="text-gray-900">
            {polls.filter((p) => getPollStatus(p) === 'active').length}
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
            {polls.filter((p) => getPollStatus(p) === 'ended').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-600">Общо гласове</span>
          </div>
          <div className="text-gray-900">
            {polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0)}
          </div>
        </div>
      </div>

      {/* Списък с гласувания */}
      {polls.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">Няма създадени гласувания</h3>
          <p className="text-gray-600 mb-6">Създайте първото си гласуване за жителите</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Създай гласуване
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const status = getPollStatus(poll);
            const totalVotes = poll.totalVotes || 0;

            return (
              <div key={poll.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{poll.title}</h3>
                        {getStatusBadge(status)}
                      </div>
                      {poll.description && (
                        <p className="text-gray-600 mb-3">{poll.description}</p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(poll.startAt).toLocaleDateString('bg-BG', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {' - '}
                            {new Date(poll.endAt).toLocaleDateString('bg-BG', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>{totalVotes} глас(а)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === 'active' && (
                        <button
                          onClick={() => handleClosePoll(poll.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Затвори гласуване"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Изтрий гласуване"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Резултати */}
                  <div className="space-y-2">
                    {poll.options?.map((option) => {
                      const voteCount = option.voteCount || 0;
                      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

                      return (
                        <div key={option.id} className="relative">
                          <div className="absolute inset-0 bg-blue-50 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-blue-100 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="relative p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-900">{option.optionText}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-600">
                                  {voteCount} глас(а)
                                </span>
                                <span className="text-gray-900 min-w-[3rem] text-right">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal за създаване на гласуване */}
      {showCreateModal && (
        <CreatePollModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadPolls();
          }}
        />
      )}
    </div>
  );
}

// Modal компонент за създаване на ново гласуване
function CreatePollModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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
      alert('Трябва да има поне 2 опции');
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

      // Филтрираме празните опции
      const pollData = {
        ...formData,
        options: formData.options.filter((opt) => opt.trim()),
      };

      await pollService.createPoll(pollData);
      alert('Гласуването беше създадено успешно!');
      onSuccess();
    } catch (err: any) {
      console.error('Error creating poll:', err);
      alert(err.message || 'Грешка при създаване на гласуването');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Описание */}
          <div>
            <label className="block text-gray-700 mb-2">Описание (опционално)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Допълнителна информация за гласуването..."
            />
          </div>

          {/* Дати */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Начална дата *</label>
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.startAt ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.startAt && <p className="text-red-500 text-sm mt-1">{errors.startAt}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Крайна дата *</label>
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.endAt ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.endAt && <p className="text-red-500 text-sm mt-1">{errors.endAt}</p>}
            </div>
          </div>

          {/* Опции */}
          <div>
            <div className="flex items-center justify-between mb-3">
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

            <div className="space-y-3">
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
          <div className="flex items-center gap-3 pt-4 border-t">
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
