import React from 'react';
import { ReplayControlBarProps } from '../types';

const StepForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

const ExitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);


const ReplayControlBar: React.FC<ReplayControlBarProps> = ({
  onStepForward,
  onExitReplay,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-white dark:bg-tv_dark-panel shadow-lg rounded-md p-2 flex items-center space-x-2 border border-gray-200 dark:border-tv_dark-border">
      <button
        onClick={onStepForward}
        title="Step Forward"
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-tv_dark-hover text-gray-600 dark:text-tv_dark-text_secondary transition-colors"
      >
        <StepForwardIcon />
      </button>
      {/* Future: Play/Pause, Speed controls */}
      <button
        onClick={onExitReplay}
        title="Exit Replay"
        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-800 hover:text-red-700 dark:hover:text-red-300 text-gray-600 dark:text-tv_dark-text_secondary transition-colors"
      >
        <ExitIcon />
      </button>
    </div>
  );
};

export default ReplayControlBar;