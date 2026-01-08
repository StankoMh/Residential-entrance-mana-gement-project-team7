import { api } from '../config/api';

// Notice/Event model matching backend API
export interface Notice {
  id: number;
  createdByUserId: number;
  title: string;
  description: string;
  location: string;
  noticeDateTime: string; // ISO datetime string
}

export interface CreateNoticeRequest {
  title: string;
  description: string;
  location: string;
  noticeDateTime: string; // ISO datetime string
}

export interface UpdateNoticeRequest {
  title: string;
  description: string;
  location: string;
  noticeDateTime: string; // ISO datetime string
}

export type NoticeType = 'ALL' | 'ACTIVE' | 'HISTORY';

export const eventService = {
  // Получи всички събития за сграда
  getAll: async (buildingId: number, type: NoticeType = 'ALL'): Promise<Notice[]> => {
    return await api.get<Notice[]>(`/buildings/${buildingId}/notices`, { type: type });
  },

  // Получи активни събития
  getActive: async (buildingId: number): Promise<Notice[]> => {
    return await api.get<Notice[]>(`/buildings/${buildingId}/notices`, { type: 'ACTIVE' });
  },

  // Получи минали събития
  getHistory: async (buildingId: number): Promise<Notice[]> => {
    return await api.get<Notice[]>(`/buildings/${buildingId}/notices`, { type: 'HISTORY' });
  },

  // Създай ново събитие (за администратори)
  create: async (buildingId: number, data: CreateNoticeRequest): Promise<Notice> => {
    return await api.post<Notice>(`/buildings/${buildingId}/notices`, data);
  },

  // Редактирай събитие (за администратори)
  update: async (noticeId: number, data: UpdateNoticeRequest): Promise<Notice> => {
    return await api.put<Notice>(`/notices/${noticeId}`, data);
  },

  // Изтрий събитие (за администратори)
  delete: async (noticeId: number): Promise<void> => {
    await api.delete<void>(`/notices/${noticeId}`);
  },
};