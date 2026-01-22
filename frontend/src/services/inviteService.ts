import api from './api';

export interface InviteRequest {
  email: string;
  apartmentId: string;
}

export interface InviteResponse {
  success: boolean;
  message: string;
}

export const sendInvite = async (data: InviteRequest): Promise<InviteResponse> => {
  const response = await api.post('/invites/send', data);
  return response.data;
};
