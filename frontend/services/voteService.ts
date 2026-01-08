import { api } from '../config/api';
import type { VotesPoll, VotesOption, UserVote, VotesPollWithResults } from '../types/database';

export interface CreatePollRequest {
  title: string;
  description?: string;
  startAt: string; // ISO DateTime string
  endAt: string; // ISO DateTime string
  options: string[]; // Array of option texts
}

export interface UpdatePollRequest {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
}

export interface VoteRequest {
  pollId: number;
  optionId: number;
}

export interface PollResultOption {
  id: number;
  optionText: string;
  voteCount: number;
}

export interface PollResults {
  pollId: number;
  title: string;
  totalVotes: number;
  options: PollResultOption[];
}

export const voteService = {
  // Вземи всички гласувания
  getAllPolls: () => api.get<VotesPollWithResults[]>('/polls'),

  // Вземи активни гласувания
  getActivePolls: () => api.get<VotesPollWithResults[]>('/polls/active'),

  // Вземи приключили гласувания
  getClosedPolls: () => api.get<VotesPollWithResults[]>('/polls/closed'),

  // Вземи гласуване по ID
  getPollById: (id: number) => api.get<VotesPollWithResults>(`/polls/${id}`),

  // Създай ново гласуване (admin)
  createPoll: (data: CreatePollRequest) =>
    api.post<VotesPoll>('/polls', data),

  // Обнови гласуване (admin)
  updatePoll: (pollId: number, data: UpdatePollRequest) =>
    api.put<VotesPoll>(`/polls/${pollId}`, data),

  // Гласувай
  vote: (data: VoteRequest) =>
    api.post<UserVote>('/votes', data),

  // Провери дали съм гласувал
  getMyVote: (pollId: number) =>
    api.get<UserVote | null>(`/polls/${pollId}/my-vote`),

  // Затвори/деактивирай гласуване (admin)
  closePoll: (pollId: number) =>
    api.patch<VotesPoll>(`/polls/${pollId}/close`, {}),

  // Активирай гласуване (admin)
  activatePoll: (pollId: number) =>
    api.patch<VotesPoll>(`/polls/${pollId}/activate`, {}),

  // Вземи резултатите от гласуване
  getPollResults: (pollId: number) =>
    api.get<PollResults>(`/polls/${pollId}/results`),

  // Изтрий гласуване (admin)
  deletePoll: (pollId: number) => api.delete<void>(`/polls/${pollId}`),
};
