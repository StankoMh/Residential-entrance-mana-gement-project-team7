import { api } from '../config/api';

// Poll models matching backend API
export interface PollOption {
  id: number;
  text: string;
}

export interface Poll {
  id: number;
  createdByUserId: number;
  title: string;
  description: string;
  startAt: string; // ISO datetime string
  endAt: string; // ISO datetime string
  status: 'PLANNED' | 'ACTIVE' | 'ENDED';
  options: PollOption[];
}

export interface PollWithResults extends Poll {
  options: (PollOption & { voteCount?: number })[];
  totalVotes?: number;
  userVote?: {
    id: number;
    optionId: number;
    unitNumber: number;
    votedAt: string;
  };
}

export interface CreatePollRequest {
  title: string;
  description: string | null;
  startAt: string; // ISO datetime string
  endAt: string; // ISO datetime string
  options: string[];
}

export interface UpdatePollRequest {
  title: string;
  description: string | null;
  startAt: string; // ISO datetime string
  endAt: string; // ISO datetime string
}

export interface VoteRequest {
  optionId: number;
  unitId: number;
}

export interface VoteResponse {
  id: number;
  unitNumber: number;
  votedAt: string;
}

export type PollType = 'ALL' | 'ACTIVE' | 'HISTORY';

class PollService {
  // Взимане на всички гласувания за сграда
  async getAllPolls(buildingId: number, type?: PollType): Promise<Poll[]> {
    const params = type ? { type: type } : undefined;
    return await api.get<Poll[]>(`/buildings/${buildingId}/polls`, params);
  }

  // Взимане на активни гласувания за сграда
  async getActivePolls(buildingId: number): Promise<Poll[]> {
    return await api.get<Poll[]>(`/buildings/${buildingId}/polls`, { type: 'ACTIVE' });
  }

  // Взимане на активни гласувания с резултати (за жители)
  async getActivePollsWithResults(buildingId: number): Promise<PollWithResults[]> {
    return await api.get<PollWithResults[]>(`/buildings/${buildingId}/polls`, { type: 'ACTIVE' });
  }

  // Взимане на всички гласувания с резултати (за жители)
  async getPollsWithResults(buildingId: number, type?: PollType): Promise<PollWithResults[]> {
    const params = type ? { type: type } : undefined;
    return await api.get<PollWithResults[]>(`/buildings/${buildingId}/polls`, params);
  }

  // Създаване на ново гласуване (само за админи)
  async createPoll(buildingId: number, pollData: CreatePollRequest): Promise<Poll> {
    return await api.post<Poll>(`/buildings/${buildingId}/polls`, pollData);
  }

  // Редактиране на гласуване
  async updatePoll(pollId: number, pollData: UpdatePollRequest): Promise<Poll> {
    return await api.put<Poll>(`/polls/${pollId}`, pollData);
  }

  // Гласуване (само за жители)
  async vote(pollId: number, voteData: VoteRequest): Promise<VoteResponse> {
    return await api.post<VoteResponse>(`/polls/${pollId}/vote`, voteData);
  }

  // Изтриване на гласуване
  async deletePoll(pollId: number): Promise<void> {
    await api.delete<void>(`/polls/${pollId}`);
  }
}

export const pollService = new PollService();