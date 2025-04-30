import { toastStore } from './toastStore';
import ToastContainer from './ToastContainer.svelte';

// Eksportuj główne funkcje i komponenty
export { toastStore, ToastContainer };

// Eksportuj wygodne funkcje pomocnicze
export const toast = {
  success: toastStore.success,
  error: toastStore.error,
  info: toastStore.info
};

// Eksportuj typy
export type { ToastType, ToastItem } from './toastStore';
