import { api } from '../config/api';
import { axiosInstance } from '../config/api';

// Document types matching backend
export type DocumentType = 'PROTOCOL' | 'RULEBOOK' | 'CONTRACT' | 'DECISION' | 'OTHER';

// Notice/Event model matching backend API
export interface Notice {
  id: number;
  createdByUserId: number;
  title: string;
  description: string;
  location: string;
  noticeDateTime: string; // ISO datetime string
  document?: {
    id: number;
    title: string;
    fileUrl: string;
    type: DocumentType;
  } | null;
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

  // Създай ново събитие с документ (multipart/form-data)
  createWithDocument: async (
    buildingId: number,
    data: CreateNoticeRequest,
    documentFile?: File,
    documentMetadata?: {
      title: string;
      description?: string;
      type: DocumentType;
      visibleToResidents: boolean;
    }
  ): Promise<Notice> => {
    const formData = new FormData();

    // Add notice fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('location', data.location);
    formData.append('noticeDateTime', data.noticeDateTime);

    // Add document fields if provided
    if (documentFile && documentMetadata) {
      formData.append('documentFile', documentFile);
      formData.append('documentTitle', documentMetadata.title);
      if (documentMetadata.description) {
        formData.append('documentDescription', documentMetadata.description);
      }
      formData.append('documentType', documentMetadata.type);
      formData.append('documentVisibleToResidents', String(documentMetadata.visibleToResidents));
    }

    const response = await axiosInstance.post<Notice>(
      `/buildings/${buildingId}/notices`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
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