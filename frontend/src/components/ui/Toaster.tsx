import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-success-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-error-500" size={20} />;
      case 'info':
        return <Info className="text-secondary-500" size={20} />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'error':
        return 'bg-error-50 border-error-200';
      case 'info':
        return 'bg-secondary-50 border-secondary-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div 
      className={`flex items-center p-4 mb-3 max-w-md rounded-lg shadow-md border ${getBgColor()} animate-slide-in`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="text-sm font-normal">{message}</div>
      <button 
        type="button" 
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-500 hover:text-gray-700"
        onClick={() => onClose(id)}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast context and provider
interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

interface ToastItem extends Omit<ToastProps, 'onClose'> {}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Standalone Toaster component that doesn't need a provider
export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Add to window for global access
  useEffect(() => {
    const showToast = (type: ToastType, message: string, duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, type, message, duration }]);
    };

    window.showToast = {
      success: (message: string, duration?: number) => showToast('success', message, duration),
      error: (message: string, duration?: number) => showToast('error', message, duration),
      info: (message: string, duration?: number) => showToast('info', message, duration),
    };

    return () => {
      delete window.showToast;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>,
    document.body
  );
};

// Extend Window interface
declare global {
  interface Window {
    showToast?: {
      success: (message: string, duration?: number) => void;
      error: (message: string, duration?: number) => void;
      info: (message: string, duration?: number) => void;
    };
  }
}