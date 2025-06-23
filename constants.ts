
import { TimeframeDefinition } from "./types";

export const CRYPTO_PAIRS: string[] = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT", "BNBUSDT", "DOTUSDT", "LTCUSDT", "LINKUSDT"];

// For Quick Select Buttons in TopBar
export const CHART_INTERVALS: string[] = ["1m", "5m", "15m", "1h", "4h", "1D"]; // Keeping this concise for quick select

export const DETAILED_TIMEFRANES: TimeframeDefinition[] = [
  // Minutes
  { label: '1 Minute', value: '1m', category: 'Minutes', isQuickSelect: true },
  { label: '3 Minutes', value: '3m', category: 'Minutes' },
  { label: '5 Minutes', value: '5m', category: 'Minutes', isQuickSelect: true },
  { label: '15 Minutes', value: '15m', category: 'Minutes', isQuickSelect: true },
  { label: '30 Minutes', value: '30m', category: 'Minutes' },
  { label: '45 Minutes', value: '45m', category: 'Minutes' },
  // Hours
  { label: '1 Hour', value: '1h', category: 'Hours', isQuickSelect: true },
  { label: '2 Hours', value: '2h', category: 'Hours' },
  { label: '3 Hours', value: '3h', category: 'Hours' },
  { label: '4 Hours', value: '4h', category: 'Hours', isQuickSelect: true },
  { label: '6 Hours', value: '6h', category: 'Hours' },
  { label: '8 Hours', value: '8h', category: 'Hours' },
  { label: '12 Hours', value: '12h', category: 'Hours' },
  // Days
  { label: '1 Day', value: '1D', category: 'Days', isQuickSelect: true },
  { label: '3 Days', value: '3D', category: 'Days' },
  { label: '1 Week', value: '1W', category: 'Days' },
  { label: '1 Month', value: '1M', category: 'Days' },
];


export const INITIAL_PAIR = "BTCUSDT";
export const INITIAL_INTERVAL = "15m"; 

// Theme Colors (ensure these align with tailwind.config.js)
export const DARK_THEME = {
  bg: '#131722',
  panel: '#1e222d',
  border: '#2a2e39',
  text: '#d1d4dc',
  text_secondary: '#787b86',
  accent: '#2962ff',
  green: '#089981',
  red: '#f23645',
  hover: '#2a2e39',
  grid: '#242731', 
  crosshair: '#787b86', 
  tooltip_bg: '#1e222d',
  tooltip_text: '#d1d4dc',
};

export const LIGHT_THEME = {
  bg: '#ffffff', 
  panel: '#ffffff',
  border: '#d1d4dc', 
  text: '#131722', 
  text_secondary: '#5d606b',
  accent: '#2962ff',
  green: '#089981', 
  red: '#f23645',
  hover: '#edf0f3',
  grid: '#e0e3eb',
  crosshair: '#5d606b',
  tooltip_bg: '#ffffff',
  tooltip_text: '#131722',
};

// Indicator & Chart Element Colors
export const MA_COLOR = "#FF9800"; 
export const BB_COLOR = "#2196F3"; 
export const RSI_COLOR = "#9C27B0"; 
export const MACD_LINE_COLOR = "#FF69B4"; 
export const MACD_SIGNAL_COLOR = "#00BCD4"; 
export const MACD_HIST_POSITIVE_COLOR_DARK = DARK_THEME.green; 
export const MACD_HIST_NEGATIVE_COLOR_DARK = DARK_THEME.red;   
export const MACD_HIST_POSITIVE_COLOR_LIGHT = LIGHT_THEME.green;
export const MACD_HIST_NEGATIVE_COLOR_LIGHT = LIGHT_THEME.red;

export const TRENDLINE_COLOR = "#FFEB3B"; 
export const TRENDLINE_DRAWING_COLOR = "#00BCD4"; 
export const REPLAY_START_LINE_COLOR = DARK_THEME.accent; 

export const INCREASING_COLOR = DARK_THEME.green; 
export const DECREASING_COLOR = DARK_THEME.red;

export const WS_URL = "wss://stream.binance.com:9443/ws";
export const API_URL = "https://api.binance.com/api/v3";
export const KLINE_LIMIT = 1000; 
export const MAX_KLINE_WINDOW = 1200;
