import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AcceptInvitationPage from './AcceptInvitationPage';
import * as inviteService from '../services/inviteService';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('../services/inviteService');
const mockValidateInvitation = inviteService.validateInvitation as jest.MockedFunction<typeof inviteService.validateInvitation>;
const mockAcceptInvitation = inviteService.acceptInvitation as jest.MockedFunction<typeof inviteService.acceptInvitation>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ code: 'ABC123', email: 'invitee@example.com' })
}));

const mockInvitation = {
  id: 1,
  inviteeEmail: 'invitee@example.com',
  invitationCode: 'ABC123',
  status: 'PENDING',
  expiresAt: '2026-02-01T00:00:00Z',
  createdAt: '2026-01-25T00:00:00Z',
  acceptedAt: null,
  unitInfo: { id: 1, unitNumber: 101, buildingName: 'Test Building' },
  createdByInfo: { id: 1, firstName: 'John', lastName: 'Doe', email: 'manager@example.com' }
};

describe('AcceptInvitationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    mockValidateInvitation.mockResolvedValueOnce(mockInvitation);

    render(
      <MemoryRouter>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('validates invitation on mount and shows invitation details', async () => {
    mockValidateInvitation.mockResolvedValueOnce(mockInvitation);

    render(
      <MemoryRouter>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockValidateInvitation).toHaveBeenCalledWith('ABC123', 'invitee@example.com');
    });

    expect(screen.getByText(/Test Building/i)).toBeInTheDocument();
    expect(screen.getByText(/101/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/invitee@example.com/i)).toBeDisabled();
  });

  it('shows error for invalid invitation', async () => {
    mockValidateInvitation.mockRejectedValueOnce(new Error('Invalid invitation'));

    render(
      <MemoryRouter>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Invalid invitation/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
  });

  it('shows error for expired invitation', async () => {
    const expiredInvitation = { ...mockInvitation, status: 'EXPIRED' };
    mockValidateInvitation.mockResolvedValueOnce(expiredInvitation);

    render(
      <MemoryRouter>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Invitation has expired/i)).toBeInTheDocument();
    });
  });

  it('handles form submission and redirects on success', async () => {
    mockValidateInvitation.mockResolvedValueOnce(mockInvitation);
    mockAcceptInvitation.mockResolvedValueOnce({ ...mockInvitation, status: 'ACCEPTED' });

    render(
      <MemoryRouter>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    const passwordInput = await screen.findByPlaceholderText(/Enter password/i);
    const confirmInput = screen.getByPlaceholderText(/Confirm password/i);
    const submitButton = screen.getByText(/Register/i);

    await userEvent.type(passwordInput, 'Password123');
    await userEvent.type(confirmInput, 'Password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith('ABC123', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { successMessage: 'Registration successful' } });
    });
  });

  it('validates password mismatch and length', async () => {
    mockValidateInvitation.mockResolvedValueOnce(mockInvitation);

    render(
      <MemoryRouter>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    const passwordInput = await screen.findByPlaceholderText(/Enter password/i);
    const confirmInput = screen.getByPlaceholderText(/Confirm password/i);
    const submitButton = screen.getByText(/Register/i);

    await userEvent.type(passwordInput, 'Password123');
    await userEvent.type(confirmInput, 'Password321');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();

    await userEvent.clear(passwordInput);
    await userEvent.clear(confirmInput);
    await userEvent.type(passwordInput, '123');
    await userEvent.type(confirmInput, '123');
    await userEvent.click(submitButton);

    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });
});