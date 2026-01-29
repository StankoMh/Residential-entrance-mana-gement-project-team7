import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InviteModal from './InviteModal';
import * as inviteService from '../services/inviteService';

jest.mock('../services/inviteService');

const mockCreateInvitation = inviteService.createInvitation as jest.MockedFunction<typeof inviteService.createInvitation>;

describe('InviteModal', () => {
  const unit = { id: 1, unitNumber: 101, buildingName: 'Test Building' };
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<InviteModal isOpen={true} unit={unit} onClose={onClose} />);
    expect(screen.getByText(/Test Building/i)).toBeInTheDocument();
    expect(screen.getByText(/101/)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<InviteModal isOpen={false} unit={unit} onClose={onClose} />);
    expect(screen.queryByText(/Test Building/i)).not.toBeInTheDocument();
  });

  it('submits invitation with valid email', async () => {
    mockCreateInvitation.mockResolvedValue({ id: 1, inviteeEmail: 'test@example.com' });

    render(<InviteModal isOpen={true} unit={unit} onClose={onClose} />);

    const input = screen.getByPlaceholderText(/Enter email/i);
    await userEvent.type(input, 'test@example.com');

    const submitButton = screen.getByText(/Submit/i);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateInvitation).toHaveBeenCalledWith(unit.id, 'test@example.com');
      expect(screen.getByText(/Invitation sent successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error on failed submission', async () => {
    mockCreateInvitation.mockRejectedValue(new Error('API error'));

    render(<InviteModal isOpen={true} unit={unit} onClose={onClose} />);

    const input = screen.getByPlaceholderText(/Enter email/i);
    await userEvent.type(input, 'fail@example.com');

    const submitButton = screen.getByText(/Submit/i);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateInvitation).toHaveBeenCalledWith(unit.id, 'fail@example.com');
      expect(screen.getByText(/Failed to send invitation/i)).toBeInTheDocument();
    });
  });

  it('closes modal after successful submission', async () => {
    mockCreateInvitation.mockResolvedValue({ id: 1, inviteeEmail: 'test@example.com' });

    render(<InviteModal isOpen={true} unit={unit} onClose={onClose} />);

    const input = screen.getByPlaceholderText(/Enter email/i);
    await userEvent.type(input, 'test@example.com');

    const submitButton = screen.getByText(/Submit/i);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('cancel button closes modal', async () => {
    render(<InviteModal isOpen={true} unit={unit} onClose={onClose} />);

    const cancelButton = screen.getByText(/Cancel/i);
    await userEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });
});
