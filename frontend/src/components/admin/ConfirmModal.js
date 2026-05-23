import React from 'react';

const ConfirmModal = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false }) => {
  return (

        {/* Icon */}
        
          {isDestructive ? '⚠️' : '❓'}

        {/* Content */}
        
          {title}
          {message}

        {/* Actions */}

            {cancelText}

            {confirmText}

  );
};

export default ConfirmModal;

