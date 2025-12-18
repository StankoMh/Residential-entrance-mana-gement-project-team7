import { API_BASE_URL } from '../config/api';
import type { VotesPoll, VotesPollWithResults, VotesOption, UserVote } from '../types/database';

export interface CreatePollRequest {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  options: string[];
}

export interface VoteRequest {
  pollId: number;
  optionId: number;
}

class PollService {
  // Взимане на всички активни гласувания
  async getActivePolls(): Promise<VotesPollWithResults[]> {
    const response = await fetch(`${API_BASE_URL}/polls/active`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active polls');
    }

    return response.json();
  }

  // Взимане на всички гласувания (за админи)
  async getAllPolls(): Promise<VotesPollWithResults[]> {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch polls');
    }

    return response.json();
  }

  // Взимане на конкретно гласуване с резултати
  async getPollById(pollId: number): Promise<VotesPollWithResults> {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch poll');
    }

    return response.json();
  }

  // Създаване на ново гласуване (само за админи)
  async createPoll(pollData: CreatePollRequest): Promise<VotesPoll> {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(pollData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create poll');
    }

    return response.json();
  }

  // Гласуване (само за жители)
  async vote(voteData: VoteRequest): Promise<UserVote> {
    const response = await fetch(`${API_BASE_URL}/polls/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(voteData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to vote');
    }

    return response.json();
  }

  // Проверка дали потребителят е гласувал за конкретно гласуване
  async hasUserVoted(pollId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/has-voted`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasVoted;
  }

  // Взимане на резултатите от гласуване
  async getPollResults(pollId: number): Promise<VotesPollWithResults> {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/results`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch poll results');
    }

    return response.json();
  }

  // Затваряне на гласуване (деактивиране)
  async closePoll(pollId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/close`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to close poll');
    }
  }

  // Изтриване на гласуване
  async deletePoll(pollId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete poll');
    }
  }
}

export const pollService = new PollService();
