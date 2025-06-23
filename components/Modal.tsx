import React, { useEffect } from 'react';
import { ModalProps } from '../types';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on overlay click
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-tv_dark-panel rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden transition-all duration-300 ease-in-out transform scale-95 group-hover:scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal content
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-tv_dark-border">
          <h3 className="text-base font-semibold text-gray-800 dark:text-tv_dark-text">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 dark:text-tv_dark-text_secondary hover:bg-gray-200 dark:hover:bg-tv_dark-hover hover:text-gray-600 dark:hover:text-tv_dark-text"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-3 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
