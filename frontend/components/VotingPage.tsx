import { useEffect, useState } from 'react';
import { CheckCircle, Vote, Clock, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { pollService } from '../services/pollService';
import type { VotesPollWithResults } from '../types/database';

export function VotingPage() {
  const [polls, setPolls] = useState<VotesPollWithResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [votingPollId, setVotingPollId] = useState<number | null>(null);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await pollService.getActivePolls();
      setPolls(data);
    } catch (err) {
      console.error('Error loading polls:', err);
      setError('Грешка при зареждане на гласуванията');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    try {
      setVotingPollId(pollId);
      await pollService.vote({ pollId, optionId });
      
      // Презареждаме гласуванията за да видим актуалните резултати
      await loadPolls();
      
      alert('Вашият глас беше записан успешно!');
    } catch (err: any) {
      console.error('Error voting:', err);
      alert(err.message || 'Грешка при гласуване');
    } finally {
      setVotingPollId(null);
    }
  };

  const isPollActive = (poll: VotesPollWithResults) => {
    const now = new Date();
    const startDate = new Date(poll.startAt);
    const endDate = new Date(poll.endAt);
    return poll.isActive && now >= startDate && now <= endDate;
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

      {polls.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">Няма активни гласувания</h3>
          <p className="text-gray-600">
            В момента няма активни гласувания. Проверете отново по-късно.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const status = getPollStatus(poll);
            const hasVoted = !!poll.userVote;
            const canVote = status === 'active' && !hasVoted;
            const totalVotes = poll.totalVotes || 0;

            return (
              <div key={poll.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h2 className="text-gray-900 mb-2">{poll.title}</h2>
                      {poll.description && (
                        <p className="text-gray-600">{poll.description}</p>
                      )}
                    </div>
                    {getStatusBadge(status)}
                  </div>

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

                {/* Options */}
                <div className="p-6">
                  {hasVoted && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Вие вече гласувахте в това гласуване
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {poll.options?.map((option) => {
                      const voteCount = option.voteCount || 0;
                      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                      const isUserChoice = poll.userVote?.optionId === option.id;

                      return (
                        <div key={option.id} className="relative">
                          {/* Progress bar background */}
                          {(hasVoted || status !== 'active') && (
                            <div className="absolute inset-0 bg-blue-50 rounded-lg overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isUserChoice ? 'bg-blue-200' : 'bg-blue-100'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}

                          {/* Option content */}
                          <div className="relative">
                            {canVote ? (
                              <button
                                onClick={() => handleVote(poll.id, option.id)}
                                disabled={votingPollId === poll.id}
                                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-900">{option.optionText}</span>
                                  {votingPollId === poll.id && (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                  )}
                                </div>
                              </button>
                            ) : (
                              <div className="p-4 rounded-lg border-2 border-transparent">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-900">{option.optionText}</span>
                                    {isUserChoice && (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    )}
                                  </div>
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
                            )}
                          </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
