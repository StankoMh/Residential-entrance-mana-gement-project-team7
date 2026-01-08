import { useEffect, useState } from 'react';
import { CheckCircle, Vote, Clock, TrendingUp, AlertCircle, Calendar, X } from 'lucide-react';
import { pollService, type Poll, type PollType } from '../services/pollService';
import { useSelection } from '../contexts/SelectionContext';
import { toast } from 'sonner';

export function VotingPage() {
  const { selectedUnit } = useSelection();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [votingPollId, setVotingPollId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<PollType>('ACTIVE');
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

  useEffect(() => {
    if (selectedUnit?.buildingId) {
      loadPolls();
    }
  }, [selectedUnit, filterType]);

  const getPollStatus = (poll: Poll) => {
    const now = new Date();
    const startDate = new Date(poll.startAt);
    const endDate = new Date(poll.endAt);

    if (poll.status === 'ENDED') return 'ended';
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'active';
  };

  const loadPolls = async () => {
    if (!selectedUnit?.buildingId) {
      setPolls([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // За ACTIVE зареждаме всички и филтрираме PLANNED и ACTIVE статуси
      if (filterType === 'ACTIVE') {
        const data = await pollService.getAllPolls(selectedUnit.buildingId, 'ALL');
        const activePolls = data.filter((poll) => 
          poll.status === 'PLANNED' || poll.status === 'ACTIVE'
        );
        setPolls(activePolls);
      } else {
        // За ALL и HISTORY използваме директно бекенда
        const data = await pollService.getAllPolls(selectedUnit.buildingId, filterType);
        setPolls(data);
      }
    } catch (err) {
      console.error('Error loading polls:', err);
      setError('Грешка при зареждане на гласуванията');
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    if (!selectedUnit) {
      toast.error('Няма избран апартамент');
      return;
    }

    try {
      setVotingPollId(pollId);
      await pollService.vote(pollId, {
        optionId,
        unitId: selectedUnit.unitId,
      });
      
      // Презареждаме гласуванията за да видим актуалните резултати
      await loadPolls();
      
      toast.success('Вашият глас беше записан успешно!');
    } catch (err: any) {
      console.error('Error voting:', err);
      toast.error(err.message || 'Грешка при гласуване');
    } finally {
      setVotingPollId(null);
    }
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

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 text-center">Зареждане на гласувания...</p>
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
        <h1 className="text-gray-900 mb-2">Гласувания</h1>
        <p className="text-gray-600">Участвайте в гласуванията на входа</p>
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

      {polls.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">
            {filterType === 'ACTIVE' && 'Няма активни гласувания'}
            {filterType === 'HISTORY' && 'Няма приключили гласувания'}
            {filterType === 'ALL' && 'Няма гласувания'}
          </h3>
          <p className="text-gray-600">
            {filterType === 'ACTIVE' && 'В момента няма активни гласувания. Проверете отново по-късно.'}
            {filterType === 'HISTORY' && 'Все още няма приключили гласувания.'}
            {filterType === 'ALL' && 'Все още няма създадени гласувания.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {polls.map((poll) => {
            const status = getPollStatus(poll);
            const hasVoted = poll.userVotedOptionId !== null;

            return (
              <div
                key={poll.id}
                onClick={() => setSelectedPoll(poll)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-gray-900 flex-1 pr-2">{poll.title}</h3>
                    <div className="flex-shrink-0">
                      {getStatusBadge(status)}
                    </div>
                  </div>

                  {poll.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{poll.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
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

                  {hasVoted && (
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Гласувано</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal за гласуване */}
      {selectedPoll && (
        <VotingModal
          poll={selectedPoll}
          onClose={() => setSelectedPoll(null)}
          onVote={handleVote}
          votingPollId={votingPollId}
          getPollStatus={getPollStatus}
        />
      )}
    </div>
  );
}

// Modal компонент за гласуване
interface VotingModalProps {
  poll: Poll;
  onClose: () => void;
  onVote: (pollId: number, optionId: number) => Promise<void>;
  votingPollId: number | null;
  getPollStatus: (poll: Poll) => string;
}

function VotingModal({ poll, onClose, onVote, votingPollId, getPollStatus }: VotingModalProps) {
  const status = getPollStatus(poll);
  const hasVoted = poll.userVotedOptionId !== null;
  const canVote = status === 'active' && !hasVoted;

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
              <h2 className="text-gray-900 mb-2">{poll.title}</h2>
              {poll.description && (
                <p className="text-gray-600">{poll.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {hasVoted && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm whitespace-nowrap">
                  <CheckCircle className="w-4 h-4" />
                  Гласувано
                </span>
              )}
              {getStatusBadge(status)}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(poll.startAt).toLocaleDateString('bg-BG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {' - '}
              {new Date(poll.endAt).toLocaleDateString('bg-BG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Body - Опции */}
        <div className="p-6">
          {/* Статистика */}
          {(hasVoted || status === 'ended') && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Общо гласували:</span>
                <span className="text-gray-900">
                  {poll.totalVotes} от {poll.totalEligibleVoters} ({Math.round((poll.totalVotes / poll.totalEligibleVoters) * 100)}%)
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {poll.options?.map((option) => {
              const isUserChoice = hasVoted && poll.userVotedOptionId === option.id;
              const percentage = poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0;
              const showResults = hasVoted || status === 'ended';
              
              return (
                <div key={option.id} className="relative">
                  {canVote ? (
                    <button
                      onClick={() => {
                        onVote(poll.id, option.id);
                        onClose();
                      }}
                      disabled={votingPollId === poll.id}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">{option.text}</span>
                        {votingPollId === poll.id && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </button>
                  ) : (
                    <div className={`relative overflow-hidden rounded-lg border-2 ${
                      isUserChoice 
                        ? 'border-green-500' 
                        : 'border-gray-200'
                    }`}>
                      {/* Progress bar background */}
                      {showResults && (
                        <div 
                          className={`absolute inset-0 transition-all ${
                            isUserChoice ? 'bg-green-100' : 'bg-blue-50'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      
                      {/* Content */}
                      <div className="relative p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={isUserChoice ? 'text-green-900' : 'text-gray-900'}>
                              {option.text}
                            </span>
                            {isUserChoice && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          {showResults && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-900">
                                {option.voteCount} {option.voteCount === 1 ? 'глас' : 'гласа'}
                              </span>
                              <span className={`px-2 py-1 rounded ${
                                isUserChoice ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'
                              }`}>
                                {percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {status === 'upcoming' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                Гласуването ще започне на{' '}
                {new Date(poll.startAt).toLocaleDateString('bg-BG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          {hasVoted && status === 'active' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✓ Вие вече гласувахте в това гласуване
              </p>
            </div>
          )}

          {status === 'ended' && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700 text-sm">
                Гласуването приключи на{' '}
                {new Date(poll.endAt).toLocaleDateString('bg-BG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}