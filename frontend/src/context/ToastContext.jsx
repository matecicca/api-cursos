import { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const showError = (message) => {
    setError(message);
  };

  const showSuccess = (message) => {
    setSuccess(message);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <ToastContext.Provider value={{ error, success, showError, showSuccess, clearMessages }}>
      {children}

      {error && (
        <div className="toast toast-error">
          {error}
        </div>
      )}

      {success && (
        <div className="toast toast-success">
          {success}
        </div>
      )}

      <style>{`
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          min-width: 300px;
          max-width: 500px;
          padding: var(--spacing-md) var(--spacing-xl);
          border-radius: var(--radius);
          font-size: var(--text-base);
          font-weight: 500;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .toast-success {
          background-color: #10b981;
          color: white;
        }

        .toast-error {
          background-color: #ef4444;
          color: white;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
