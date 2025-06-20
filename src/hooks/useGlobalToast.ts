import { useState, useEffect } from 'react';
import { type ToastType } from '../components/Toast';

// Singleton para gerenciar toasts globalmente
class ToastManager {
  private listeners: Array<(toasts: any[]) => void> = [];
  private toasts: any[] = [];

  subscribe(listener: (toasts: any[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  addToast(type: ToastType, title: string, message?: string, duration?: number) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      type,
      title,
      message,
      duration: duration || 4000
    };

    this.toasts.push(newToast);
    this.notify();

    // Auto-remove após a duração
    setTimeout(() => {
      this.removeToast(id);
    }, newToast.duration);

    return id;
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  success(title: string, message?: string, duration?: number) {
    return this.addToast('success', title, message, duration);
  }

  error(title: string, message?: string, duration?: number) {
    return this.addToast('error', title, message, duration);
  }

  warning(title: string, message?: string, duration?: number) {
    return this.addToast('warning', title, message, duration);
  }

  info(title: string, message?: string, duration?: number) {
    return this.addToast('info', title, message, duration);
  }
}

// Instância global
const toastManager = new ToastManager();

// Hook para usar o toast manager
export const useGlobalToast = () => {
  return {
    success: toastManager.success.bind(toastManager),
    error: toastManager.error.bind(toastManager),
    warning: toastManager.warning.bind(toastManager),
    info: toastManager.info.bind(toastManager)
  };
};

// Hook para o componente que renderiza os toasts
export const useToastSubscription = () => {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    toastManager.removeToast(id);
  };

  return { toasts, removeToast };
};

// Para compatibilidade com imports existentes
export { useGlobalToast as useToastContext }; 