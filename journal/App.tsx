
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { Trade, AppSection } from './types';
import { MOCK_TRADES, APP_TITLE } from './constants';

// Basic SVG Icon for Logo
const TradingJournalIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const Header: React.FC<{onNavClick: (section: AppSection) => void; currentView: AppSection}> = ({onNavClick, currentView}) => {
  const navItems: {label: string, section: AppSection}[] = [
    { label: "Overview", section: "DASHBOARD_OVERVIEW" },
    { label: "Trade Log", section: "TRADE_LOG" },
    { label: "Analytics", section: "ANALYTICS" },
    { label: "Playbook", section: "PLAYBOOK" },
    { label: "Review", section: "REVIEW" },
  ];

  return (
    <header className="bg-brand-bg-darker p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <TradingJournalIcon className="h-10 w-10 mr-3 text-brand-accent"/>
          <h1 className="text-2xl font-bold text-brand-text">{APP_TITLE}</h1>
        </div>
        <nav className="flex space-x-2 sm:space-x-1 flex-wrap justify-center">
          {navItems.map(item => (
            <button
              key={item.section}
              onClick={() => onNavClick(item.section)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${currentView === item.section 
                  ? 'bg-brand-accent text-white' 
                  : 'text-brand-text-muted hover:bg-brand-bg-light hover:text-brand-text'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};


const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>(() => {
    // Basic persistence with localStorage (optional, for better UX during development)
    // In a real app, this would be an API call.
    const savedTrades = localStorage.getItem('tradingJournalTrades');
    return savedTrades ? JSON.parse(savedTrades) : MOCK_TRADES;
  });
  const [currentView, setCurrentView] = useState<AppSection>('DASHBOARD_OVERVIEW');

  useEffect(() => {
    localStorage.setItem('tradingJournalTrades', JSON.stringify(trades));
  }, [trades]);

  const handleNavClick = (section: AppSection) => {
    setCurrentView(section);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavClick={handleNavClick} currentView={currentView} />
      <main className="flex-grow container mx-auto">
        <Dashboard currentView={currentView} trades={trades} setTrades={setTrades} />
      </main>
      <footer className="bg-brand-bg-darker p-4 text-center text-sm text-brand-text-muted">
        © {new Date().getFullYear()} Trading Journal. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
