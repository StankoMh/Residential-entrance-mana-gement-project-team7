import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvitationManagement from './InvitationManagement';
import * as inviteService from '../services/inviteService';

jest.mock('../services/inviteService');

const mockGetInvitationsByUnit = inviteService.getInvitationsByUnit as jest.MockedFunction<typeof inviteService.getInvitationsByUnit>;
const mockCreateInvitation = inviteService.createInvitation as jest.MockedFunction<typeof inviteService.createInvitation>;
const mockRevokeInvitation = inviteService.revokeInvitation as jest.MockedFunction<typeof inviteService.revokeInvitation>;

const mockInvitation = {
  id: 1,
  inviteeEmail: 'invitee@example.com',
  invitationCode: 'ABC123',
  status: 'PENDING',
  expiresAt: '2026-02-01T00:00:00Z',
  unitInfo: { id: 1, unitNumber: 101, buildingName: 'Test Building' },
  createdByInfo: { id: 1, firstName: 'John', lastName: 'Doe', email: 'manager@example.com' }
};

describe('InvitationManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches invitations on mount', async () => {
    mockGetInvitationsByUnit.mockResolvedValueOnce([mockInvitation]);

    render(<InvitationManagement unitId={1} />);

    await waitFor(() => {
      expect(mockGetInvitationsByUnit).toHaveBeenCalledWith(1);
    });
  });

  it('displays invitations in table', async () => {
    mockGetInvitationsByUnit.mockResolvedValueOnce([mockInvitation]);

    render(<InvitationManagement unitId={1} />);

    const emailCell = await screen.findByText(/invitee@example.com/i);
    const statusCell = screen.getByText(/PENDING/i);
    const unitCell = screen.getByText(/101/i);

    expect(emailCell).toBeInTheDocument();
    expect(statusCell).toBeInTheDocument();
    expect(unitCell).toBeInTheDocument();
  });

  it('shows correct status badges', async () => {
    const acceptedInvitation = { ...mockInvitation, status: 'ACCEPTED' };
    const expiredInvitation = { ...mockInvitation, status: 'EXPIRED' };

    mockGetInvitationsByUnit.mockResolvedValueOnce([mockInvitation, acceptedInvitation, expiredInvitation]);

    render(<InvitationManagement unitId={1} />);

    expect(await screen.findByText(/PENDING/i)).toBeInTheDocument();
    expect(screen.getByText(/ACCEPTED/i)).toBeInTheDocument();
    expect(screen.getByText(/EXPIRED/i)).toBeInTheDocument();
  });

  it('creates new invitation', async () => {
    mockGetInvitationsByUnit.mockResolvedValueOnce([mockInvitation]);
    mockCreateInvitation.mockResolvedValueOnce({ ...mockInvitation, inviteeEmail: 'new@example.com' });

    render(<InvitationManagement unitId={1} />);

    const addButton = screen.getByText(/Add Invitation/i);
    await userEvent.click(addButton);

    const emailInput = screen.getByPlaceholderText(/Enter email/i);
    await userEvent.type(emailInput, 'new@example.com');

    const submitButton = screen.getByText(/Submit/i);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateInvitation).toHaveBeenCalledWith(1, 'new@example.com');
      expect(screen.getByText(/Invitation sent successfully/i)).toBeInTheDocument();
    });
  });

  it('revokes invitation', async () => {
    mockGetInvitationsByUnit.mockResolvedValueOnce([mockInvitation]);
    mockRevokeInvitation.mockResolvedValueOnce();

    render(<InvitationManagement unitId={1} />);

    const revokeButton = screen.getByText(/Revoke/i);
    await userEvent.click(revokeButton);

    await waitFor(() => {
      expect(mockRevokeInvitation).toHaveBeenCalledWith(1);
    });
  });
});
