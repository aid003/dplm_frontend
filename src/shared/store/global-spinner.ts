import { create } from "zustand";

interface GlobalSpinnerState {
  isVisible: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

export const useGlobalSpinnerStore = create<GlobalSpinnerState>((set) => ({
  isVisible: false,
  message: "Загрузка...",
  show: (message = "Загрузка...") => set({ isVisible: true, message }),
  hide: () => set({ isVisible: false }),
}));
