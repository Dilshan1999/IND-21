export interface Candle {
  t: Date;    // Timestamp (Date object)
  o: number;  // Open price
  h: number;  // High price
  l: number;  // Low price
  c: number;  // Close price
  v?: number; // Optional Volume
}

export interface OHLCVData {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  change?: number; // Change percentage
  changeAbsolute?: number;
  pair?: string;
}

// Binance WebSocket message types
interface BinanceKlineData {
  t: number; // Kline start time
  T: number; // Kline close time
  s: string; // Symbol
  i: string; // Interval
  f: number; // First trade ID
  L: number; // Last trade ID
  o: string; // Open price
  c: string; // Close price
  h: string; // High price
  l: string; // Low price
  v: string; // Base asset volume
  n: number; // Number of trades
  x: boolean; // Is this kline closed?
  q: string; // Quote asset volume
  V: string; // Taker buy base asset volume
  Q: string; // Taker buy quote asset volume
  B: string; // Ignore
}

export interface BinanceWebSocketMessage {
  e: string; // Event type (e.g., "kline")
  E: number; // Event time
  s: string; // Symbol
  k: BinanceKlineData;
}

export type Theme = 'light' | 'dark';
export type DrawingTool = 'none' | 'trendline'; 

export interface ReplayData {
  allCandles: Candle[];
  startIndex: number;
  currentIndex: number;
  isPlaying?: boolean;
  speed?: number; 
}

export interface TimeframeDefinition {
  label: string;    // e.g., "1 Minute", "1 Hour"
  value: string;    // e.g., "1m", "1h" (used for API and internal state)
  category: 'Minutes' | 'Hours' | 'Days';
  isQuickSelect?: boolean; // Optional: to mark for quick select buttons
}

// Theme colors interface
export interface ThemeColors {
  app_bg: string;
  text: string;
  text_secondary: string;
  border: string;
  grid: string;
  hover: string;
}

// Chart data interfaces for lightweight-charts
export interface ChartIndicatorData {
  ma?: Array<{ time: number; value: number }>;
  rsi?: Array<{ time: number; value: number }>;
  bb?: {
    upper: Array<{ time: number; value: number }>;
    middle: Array<{ time: number; value: number }>;
    lower: Array<{ time: number; value: number }>;
  };
  macd?: {
    macdLine: Array<{ time: number; value: number }>;
    signalLine: Array<{ time: number; value: number }>;
    histogram: Array<{ time: number; value: number }>;
  };
}

// Performance metrics interface
export interface PerformanceMetrics {
  totalPnL: number;
  totalPnLPercent: number;
  dailyPnL: number;
  winRate: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

// Trading position interface
export interface TradingPosition {
  id: string;
  pair: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: Date;
}

// Order interface
export interface Order {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  amount: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
}

// Market data for watchlist
export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

// Alert interface
export interface Alert {
  id: string;
  symbol: string;
  condition: string;
  targetPrice: number;
  isActive: boolean;
  createdAt: Date;
}

// Window interface for global objects
declare global {
  interface Window {
    Plotly?: any; // Keep for backward compatibility but not used
  }
}
