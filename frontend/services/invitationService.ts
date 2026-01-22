import { api } from '../config/api';

export interface InvitationRequest {
  email: string;
  unitId: number;
  role?: string;
}

export interface InvitationResponse {
  id: number;
  email: string;
  token: string;
  invitationLink: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface InvitationValidationResponse {
  valid: boolean;
  email: string;
  unitNumber?: string;
  buildingName?: string;
  expired?: boolean;
  alreadyUsed?: boolean;
}

const invitationService = {
  // Create a new invitation (admin only)
  createInvitation: async (data: InvitationRequest): Promise<InvitationResponse> => {
    const response = await api.post('/invitations', data);
    return response.data;
  },

  // Validate an invitation token
  validateInvitation: async (token: string): Promise<InvitationValidationResponse> => {
    const response = await api.get(`/invitations/validate/${token}`);
    return response.data;
  },

  // Accept an invitation and create account
  acceptInvitation: async (data: AcceptInvitationRequest): Promise<void> => {
    const response = await api.post('/invitations/accept', data);
    return response.data;
  },

  // Get all invitations for a building (admin only)
  getInvitationsByBuilding: async (buildingId: number): Promise<InvitationResponse[]> => {
    const response = await api.get(`/invitations/building/${buildingId}`);
    return response.data;
  },

  // Resend an invitation
  resendInvitation: async (invitationId: number): Promise<InvitationResponse> => {
    const response = await api.post(`/invitations/${invitationId}/resend`);
    return response.data;
  },

  // Cancel/revoke an invitation
  cancelInvitation: async (invitationId: number): Promise<void> => {
    await api.delete(`/invitations/${invitationId}`);
  },
};

export default invitationService;