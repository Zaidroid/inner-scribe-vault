import { create } from 'zustand';

interface ModalState {
  modalType: string | null;
  modalProps: any;
  openModal: (modalType: string, modalProps?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modalType: null,
  modalProps: {},
  openModal: (modalType, modalProps = {}) => set({ modalType, modalProps }),
  closeModal: () => set({ modalType: null, modalProps: {} }),
})); 