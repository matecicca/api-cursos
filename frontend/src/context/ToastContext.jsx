import { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
      console.log('[TOAST DEBUG] Error mostrado:', error);
      const timer = setTimeout(() => {
        console.log('[TOAST DEBUG] Error auto-ocultado');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      console.log('[TOAST DEBUG] Success mostrado:', success);
      const timer = setTimeout(() => {
        console.log('[TOAST DEBUG] Success auto-ocultado');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const showError = (message) => {
    console.log('[TOAST DEBUG] showError llamado con:', message);
    setError(message);
  };

  const showSuccess = (message) => {
    console.log('[TOAST DEBUG] showSuccess llamado con:', message);
    setSuccess(message);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const toastStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px 40px',
    borderRadius: '12px',
    zIndex: 99999,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    minWidth: '400px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '18px',
    display: 'block',
    color: '#ffffff',
    fontFamily: 'Inter, system-ui, sans-serif',
    lineHeight: '1.5'
  };

  const renderToasts = () => (
    <>
      {error && createPortal(
        <div style={{
          ...toastStyle,
          backgroundColor: '#ef4444',
          border: '3px solid #dc2626'
        }}>
          ❌ {error}
        </div>,
        document.body
      )}

      {success && createPortal(
        <div style={{
          ...toastStyle,
          backgroundColor: '#10b981',
          border: '3px solid #059669'
        }}>
          ✅ {success}
        </div>,
        document.body
      )}
    </>
  );

  return (
    <ToastContext.Provider value={{ error, success, showError, showSuccess, clearMessages }}>
      {children}
      {renderToasts()}
    </ToastContext.Provider>
  );
}
