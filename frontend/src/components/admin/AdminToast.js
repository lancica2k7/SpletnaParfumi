import React, { useEffect } from 'react';

const AdminToast = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const colors = {
    success: 'from-green-600 to-green-500 border-green-400',
    error: 'from-red-600 to-red-500 border-red-400',
    info: 'from-blue-600 to-blue-500 border-blue-400',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div
      className={`pointer-events-auto flex min-w-[300px] items-center gap-3 rounded-xl border bg-gradient-to-r p-4 shadow-2xl ${colors[type]}`}
      role="alert"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 font-bold text-white">
        {icons[type]}
      </div>
      <p className="flex-1 text-sm font-medium text-white">{message}</p>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default AdminToast;
