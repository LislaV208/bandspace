import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastItem[]>([]);

  function add(type: ToastType, message: string, duration = 5000): string {
    const id = Math.random().toString(36).substring(2, 9);
    
    update(toasts => [...toasts, { id, type, message, duration }]);
    
    return id;
  }

  function remove(id: string) {
    update(toasts => toasts.filter(toast => toast.id !== id));
  }

  function success(message: string, duration?: number) {
    return add('success', message, duration);
  }

  function error(message: string, duration?: number) {
    return add('error', message, duration);
  }

  function info(message: string, duration?: number) {
    return add('info', message, duration);
  }

  return {
    subscribe,
    add,
    remove,
    success,
    error,
    info
  };
}

export const toastStore = createToastStore();
