import React, { useEffect, useState, useCallback } from 'react';
import './Toast.css';

const Toast = ({ message, isVisible, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 400); // Wait for animation to complete
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, handleClose]);

  if (!isVisible && !isExiting) return null;

  return (
    <div className={`toast ${isVisible && !isExiting ? 'toast-show' : 'toast-hide'}`}>
      <div className="toast-content">
        <span className="toast-icon">✓</span>
        <span className="toast-message">{message}</span>
        <button 
          className="toast-close" 
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;

