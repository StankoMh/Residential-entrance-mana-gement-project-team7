import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApartmentsManagement from './ApartmentsManagement';
import * as inviteService from '../services/inviteService';
import InviteModal from './InviteModal';

jest.mock('../services/inviteService');
const mockCreateInvitation = inviteService.createInvitation as jest.MockedFunction<typeof inviteService.createInvitation>;

jest.mock('./InviteModal', () => (props: any) => {
  return props.isOpen ? <div data-testid="invite-modal">Invite Modal Open</div> : null;
});

describe('ApartmentsManagement', () => {
  const mockUnits = [
    { id: 1, unitNumber: 101, buildingName: 'Test Building' },
    { id: 2, unitNumber: 102, buildingName: 'Test Building' },
  ];

  const mockRefreshUnits = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders invite button in actions menu', () => {
    render(<ApartmentsManagement units={mockUnits} refreshUnits={mockRefreshUnits} />);

    mockUnits.forEach(unit => {
      expect(screen.getByText(/Покани жител/i)).toBeInTheDocument();
    });
  });

  it('opens invite modal when clicking invite', async () => {
    render(<ApartmentsManagement units={mockUnits} refreshUnits={mockRefreshUnits} />);

    const inviteButtons = screen.getAllByText(/Покани жител/i);
    await userEvent.click(inviteButtons[0]);

    expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
  });

  it('closes invite modal and refreshes units', async () => {
    render(<ApartmentsManagement units={mockUnits} refreshUnits={mockRefreshUnits} />);

    const inviteButtons = screen.getAllByText(/Покани жител/i);
    await userEvent.click(inviteButtons[0]);

    const modal = screen.getByTestId('invite-modal');
    expect(modal).toBeInTheDocument();

    // Simulate onClose from modal
    (modal as any).props?.onClose?.();

    // В реалния компонент onClose извиква refreshUnits
    expect(mockRefreshUnits).toHaveBeenCalled();
  });
});