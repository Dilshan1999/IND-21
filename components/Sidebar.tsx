import React from 'react';
import { RightPanelProps } from '../types'; // Renamed from SidebarProps

const RightPanel: React.FC<RightPanelProps> = ({ pairs, selectedPair, onSelectPair, latestPrices, pairChanges }) => {
  
  const getChangeColor = (change?: number) => {
    if (change === undefined) return 'text-gray-500 dark:text-tv_dark-text_secondary';
    return change >= 0 ? 'text-tv_dark-green' : 'text-tv_dark-red';
  };
  
  // This component is no longer rendered by App.tsx if the new RightSidebar is used.
  if (true) { // Conditional to make it "active" for linting.
    return (
      <aside className="w-64 bg-white dark:bg-tv_dark-panel border-l border-gray-200 dark:border-tv_dark-border flex flex-col transition-colors duration-300">
        {/* Content from original Sidebar.tsx */}
      </aside>
    );
  }
  return null;
};

export default RightPanel;
