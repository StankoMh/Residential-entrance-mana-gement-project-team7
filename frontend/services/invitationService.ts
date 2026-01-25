import { api } from '../config/api';

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

const invitationService = {
  // Create a new invitation
  createInvitation: async (data: CreateInvitationRequest): Promise<InvitationResponse> => {
    const response = await api.post('/invitations', data);
    return response.data;
  },

  // Validate an invitation
  validateInvitation: async (invitationCode: string, email: string): Promise<InvitationResponse> => {
    const response = await api.post('/invitations/validate', { invitationCode, email });
    return response.data;
  },

  // Accept an invitation
  acceptInvitation: async (invitationCode: string): Promise<InvitationResponse> => {
    const response = await api.post(`/invitations/${invitationCode}/accept`);
    return response.data;
  },

  // Get invitations by unit
  getInvitationsByUnit: async (unitId: number): Promise<InvitationResponse[]> => {
    const response = await api.get(`/invitations/unit/${unitId}`);
    return response.data;
  },

  // Get my pending invitations
  getMyPendingInvitations: async (): Promise<InvitationResponse[]> => {
    const response = await api.get('/invitations/my-pending');
    return response.data;
  },

  // Revoke an invitation
  revokeInvitation: async (invitationId: number): Promise<void> => {
    await api.delete(`/invitations/${invitationId}`);
  },
};

export default invitationService;