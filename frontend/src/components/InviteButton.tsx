import React, { useState } from 'react';
import InviteModal from './InviteModal';

interface InviteButtonProps {
  apartmentId: string;
  apartmentName?: string;
  className?: string;
}

const InviteButton: React.FC<InviteButtonProps> = ({ apartmentId, apartmentName, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-1 ${className || ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Invite
      </button>
      
      <InviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apartmentId={apartmentId}
        apartmentName={apartmentName}
      />
    </>
  );
};

export default InviteButton;
