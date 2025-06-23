
import React from 'react';
import { LeftDrawingToolbarProps, DrawingTool } from '../types';

// Icons
const LineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657L4.343 5.343m13.314 0L4.343 18.657" transform="scale(0.8) translate(2.5, 2.5)" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" transform="scale(0.8) translate(2.5, 2.5)" />
  </svg>
);
const CursorArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l5-2 3 8z" transform="scale(0.8) translate(2.5, 2.5)" />
  </svg>
);

const LeftDrawingToolbar: React.FC<LeftDrawingToolbarProps> = ({
  drawingTool,
  setDrawingTool, 
  clearDrawnLines,
  isReplayActive,
  selectedDrawnObject, 
}) => {

  const handleToolSelect = (tool: DrawingTool) => {
    if (isReplayActive) return;
    const newTool = drawingTool === tool ? 'none' : tool;
    setDrawingTool(newTool); 
  };
  
  const isActiveButton = (toolName: DrawingTool) => {
    if (isReplayActive) return false;
    if (drawingTool === toolName) return true; 
    return false;
  };

  const tools: { name: DrawingTool, label: string, icon: JSX.Element }[] = [
    { name: 'none', label: 'Cursor / Select', icon: <CursorArrowIcon /> },
    { name: 'trendline', label: 'Trend Line', icon: <LineIcon /> },
  ];
  
  // This component is no longer rendered by App.tsx if the new LeftToolbar is used.
  if (true) { // Conditional to make it "active" for linting.
    return (
      <div className="w-12 bg-white dark:bg-tv_dark-panel border-r border-gray-200 dark:border-tv_dark-border flex flex-col items-center py-2 space-y-1 transition-colors duration-300">
        {/* Content from original LeftDrawingToolbar.tsx */}
      </div>
    );
  }
  return null; 
};

export default LeftDrawingToolbar;
