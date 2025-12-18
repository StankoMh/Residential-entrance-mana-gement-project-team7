import { api } from '../config/api';

export interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock данни за демонстрация
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: 'Общо събрание на жителите',
    description: 'Годишно общо събрание за обсъждане на бюджета за 2025 година',
    eventDate: '2024-12-20T18:00:00',
    location: 'Заседателна зала, етаж 1',
    createdBy: 2,
    createdByName: 'Мария Георгиева',
    createdAt: '2024-11-25T10:00:00',
    updatedAt: '2024-11-25T10:00:00',
  },
  {
    id: 2,
    title: 'Коледно парти',
    description: 'Коледно парти за всички жители на входа',
    eventDate: '2024-12-23T19:00:00',
    location: 'Общо пространство',
    createdBy: 2,
    createdByName: 'Мария Георгиева',
    createdAt: '2024-11-30T14:30:00',
    updatedAt: '2024-11-30T14:30:00',
  },
];

export const eventService = {
  // Получи всички събития
  getAll: async (): Promise<Event[]> => {
    try {
      return await api.get<Event[]>('/events');
    } catch (error) {
      return MOCK_EVENTS;
    }
  },

  // Получи предстоящи събития
  getUpcoming: async (): Promise<Event[]> => {
    try {
      return await api.get<Event[]>('/events/upcoming');
    } catch (error) {
      const now = new Date();
      return MOCK_EVENTS.filter(event => new Date(event.eventDate) > now);
    }
  },

  // Създай ново събитие (за администратори)
  create: async (data: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    try {
      return await api.post<Event>('/events', data);
    } catch (error) {
      const newEvent: Event = {
        id: Math.floor(Math.random() * 1000) + 100,
        ...data,
        createdBy: 2,
        createdByName: 'Мария Георгиева',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newEvent;
    }
  },

  // Редактирай събитие (за администратори)
  update: async (id: number, data: Partial<Event>): Promise<Event> => {
    try {
      return await api.put<Event>(`/events/${id}`, data);
    } catch (error) {
      throw new Error('Събитието не може да бъде редактирано в момента');
    }
  },

  // Изтрий събитие (за администратори)
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/events/${id}`);
    } catch (error) {
      throw new Error('Събитието не може да бъде изтрито в момента');
    }
  },
};