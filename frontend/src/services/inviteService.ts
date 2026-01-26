import api from './api';

export interface CreateInvitationRequest {
  unitId: number;
  inviteeEmail: string;
}

export interface InvitationResponse {
  id: number;
  inviteeEmail: string;
  invitationCode: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
  unitInfo: {
    id: number;
    unitNumber: number;
    buildingName: string;
  };
  createdByInfo: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ValidateInvitationRequest {
  invitationCode: string;
  email: string;
}

export const createInvitation = async (data: CreateInvitationRequest): Promise<InvitationResponse> => {
  const response = await api.post('/invitations', data);
  return response.data;
};

export const validateInvitation = async (data: ValidateInvitationRequest): Promise<InvitationResponse> => {
  const response = await api.post('/invitations/validate', data);
  return response.data;
};

export const acceptInvitation = async (invitationCode: string): Promise<InvitationResponse> => {
  const response = await api.post(`/invitations/${invitationCode}/accept`);
  return response.data;
};

export const getInvitationsByUnit = async (unitId: number): Promise<InvitationResponse[]> => {
  const response = await api.get(`/invitations/unit/${unitId}`);
  return response.data;
};

export const getMyPendingInvitations = async (): Promise<InvitationResponse[]> => {
  const response = await api.get('/invitations/my-pending');
  return response.data;
};

export const revokeInvitation = async (invitationId: number): Promise<void> => {
  await api.delete(`/invitations/${invitationId}`);
};
