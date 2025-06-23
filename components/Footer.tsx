import React from 'react';
import { FooterProps } from '../types';

const Footer: React.FC<FooterProps> = () => {
  // This component is no longer rendered by App.tsx if the new BottomBar is used.
  if (true) { // Conditional to make it "active" for linting.
    return (
      <footer className="h-8 bg-white dark:bg-tv_dark-panel border-t border-gray-200 dark:border-tv_dark-border px-4 flex items-center justify-center text-xs text-gray-500 dark:text-tv_dark-text_secondary transition-colors duration-300">
        <span>© {new Date().getFullYear()} CryptoChart Pro. For educational purposes only. Not financial advice.</span>
      </footer>
    );
  }
  return null;
};

export default Footer;
