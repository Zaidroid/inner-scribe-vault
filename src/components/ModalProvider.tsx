import React from 'react';
import { useModalStore } from '@/hooks/useModalStore';
import TaskForm from '@/components/TaskForm';
import { TeamDetailsModal } from '@/components/Collaboration/TeamDetailsModal';

const ModalProvider = () => {
  const { modalType, modalProps, closeModal } = useModalStore();

  if (!modalType) {
    return null;
  }

  // A more scalable way to render modals
  const Modals = {
    'TaskForm': <TaskForm isOpen={true} onClose={closeModal} {...modalProps} />,
    'TeamDetails': <TeamDetailsModal isOpen={true} onClose={closeModal} {...modalProps} />,
    // Add other modals here as the app grows
  };

  return Modals[modalType] || null;
};

export default ModalProvider; 