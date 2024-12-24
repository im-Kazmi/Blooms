import { create } from 'zustand';

type Types = {
  isOpen: boolean;
  onOpen(): void;
  onClose(): void;
};

export const useOnboardingDialog = create<Types>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
