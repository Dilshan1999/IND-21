
export enum TradeDirection {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export enum OptionType {
  CALL = 'CALL',
  PUT = 'PUT',
  NONE = 'NONE', // For non-options trades
}

export interface Trade {
  id: string;
  enteredDate: string; // YYYY-MM-DD
  closedDate?: string; // YYYY-MM-DD
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number;
  size: number; // e.g., contracts, shares
  optionType?: OptionType; 
  pnl?: number;
  returnPercentage?: number; // Calculated: (pnl / (entryPrice * size)) * 100 or similar logic
  strategyUsed?: string;
  reasonForEntry?: string;
  reasonForExit?: string;
  mistakesMade?: string[];
  lessonsLearned?: string[];
  emotions?: string[];
  tags?: string[];
  notes?: string;
  status?: 'WIN' | 'LOSS' | 'BREAKEVEN'; // Derived from PNL
}

export interface DailyWinLoss {
  wins: number;
  losses: number;
}

export interface PerformanceByDay {
  day: string; // 'Monday', 'Tuesday', etc.
  wins: number;
  losses: number;
  netPnl: number;
}

export interface KeyStats {
  totalNetPnl: number;
  overallWinRate: number; // Percentage
  averageWinningTrade: number;
  averageLosingTrade: number;
  profitFactor: number; // Gross Profit / Gross Loss
  totalTrades: number;
}

export type AppSection = 'DASHBOARD_OVERVIEW' | 'TRADE_LOG' | 'ANALYTICS' | 'PLAYBOOK' | 'REVIEW';
