
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

export interface PlotlyAnnotation {
  x: number | string | Date;
  y: number | string | Date;
  text: string;
  showarrow?: boolean;
  arrowhead?: number;
  ax?: number;
  ay?: number;
  font?: Partial<{ color: string; size: number; family: string }>;
  bgcolor?: string;
  bordercolor?: string;
  borderwidth?: number;
  borderpad?: number;
  align?: 'left' | 'center' | 'right';
  xref?: 'x' | 'paper' | `x${number}` ;
  yref?: 'y' | 'paper' | `y${number}`;
  xanchor?: 'auto' | 'left' | 'center' | 'right';
  yanchor?: 'auto' | 'top' | 'middle' | 'bottom';
  textangle?: number;
  opacity?: number;
  standoff?: number;
  [key: string]: any;
}

export interface DrawnObject {
  id: string; 
  type: DrawingTool; 
  shapes: PlotlyShape[];
  annotations: PlotlyAnnotation[];
}

export interface TimeframeDefinition {
  label: string;    // e.g., "1 Minute", "1 Hour"
  value: string;    // e.g., "1m", "1h" (used for API and internal state)
  category: 'Minutes' | 'Hours' | 'Days';
  isQuickSelect?: boolean; // Optional: to mark for quick select buttons
}


// --- Component Props ---
// Note: TopBarProps is now effectively for NewHeader, but keeping name for minimal diff if some mapping occurs.
// Consider renaming or creating NewHeaderProps if divergence is large.
export interface TopBarProps { // This is effectively for NewHeader now
  theme: Theme;
  toggleTheme: () => void;
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  pairs: string[]; // All available pairs for dropdown
  interval: string; // Current interval value
  onSelectInterval: (interval: string) => void;
  intervals: string[]; // Quick select interval values
  detailedTimeframes: TimeframeDefinition[]; // Full list for dropdown
  onToggleIndicatorModal: () => void;
  latestOHLCV: OHLCVData | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReplayModeActive: boolean;
  onToggleReplayMode: () => void;
  isSelectingReplayStartPoint: boolean;
}

export interface LeftDrawingToolbarProps { // This is for NewLeftToolbar
  drawingTool: DrawingTool;
  setDrawingTool: (tool: DrawingTool) => void; 
  clearDrawnLines: () => void;
  isReplayActive: boolean;
  selectedDrawnObject: DrawnObject | null; 
}

export interface ChartSectionProps {
  plotRef: React.RefObject<HTMLDivElement>; // Explicitly a div element
  ohlcHoverData: OHLCVData | null; 
  selectedPair: string; // May not be needed if NewChartArea provides all symbol info
  theme: Theme; 
  isSelectingReplayStartPoint: boolean;
}

export interface RightPanelProps { // This is for NewRightSidebar (watchlist part)
  pairs: string[];
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  latestPrices: Record<string, number>; 
  pairChanges: Record<string, number>; 
}

export interface IndicatorPanelProps {
  showMA: boolean;
  setShowMA: (show: boolean) => void;
  maPeriod: number;
  setMAPeriod: (period: number) => void;
  showRSI: boolean;
  setShowRSI: (show: boolean) => void;
  rsiPeriod: number;
  setRSIPeriod: (period: number) => void;
  showBB: boolean;
  setShowBB: (show: boolean) => void;
  bbPeriod: number;
  setBBPeriod: (period: number) => void;
  bbDeviation: number;
  setBBDeviation: (deviation: number) => void;
  showMACD: boolean;
  setShowMACD: (show: boolean) => void;
  macdFastPeriod: number;
  setMACDFastPeriod: (period: number) => void;
  macdSlowPeriod: number;
  setMACDSlowPeriod: (period: number) => void;
  macdSignalPeriod: number;
  setMACDSignalPeriod: (period: number) => void;
  showVolume: boolean;
  setShowVolume: (show: boolean) => void;
  onClose?: () => void; 
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FooterProps {} // NewBottomBar replaces Footer

export interface PlotlyShape {
  type: 'line' | 'rect' | 'circle' | 'path'; 
  x0?: string | number | Date;
  y0?: number;
  x1?: string | number | Date;
  y1?: number;
  line?: {
    color?: string;
    width?: number;
    dash?: string;
  };
  fillcolor?: string;
  opacity?: number;
  layer?: 'below' | 'above';
  name?: string; 
  xref?: 'paper' | 'x' | `x${number}`;
  yref?: 'paper' | 'y' | `y${number}`;
  [key: string]: any;
}

export interface PlotlyHoverData {
    points: Array<{
        x: string | number | Date; 
        y: number; 
        data: { 
            open?: number;
            high?: number;
            low?: number;
            close?: number;
            volume?: number;
        };
        fullData: { 
            type?: string; 
            name: string; 
            yaxis: any; 
            [key: string]: any; 
        };
        pointNumber?: number;
        curveNumber?: number;
    }>;
}

export interface PlotlyLayoutAxis {
  type?: 'date' | 'linear' | 'log' | 'category' | 'multicategory' | string;
  title?: string | Partial<{ text: string; font: any; standoff: number }> | undefined;
  domain?: [number, number];
  range?: [any, any];
  autorange?: boolean | 'reversed';
  fixedrange?: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  anchor?: string; 
  overlaying?: string; 
  matches?: string; 
  position?: number;
  showline?: boolean;
  linecolor?: string;
  linewidth?: number;
  showgrid?: boolean;
  gridcolor?: string;
  gridwidth?: number;
  zeroline?: boolean;
  zerolinecolor?: string;
  zerolinewidth?: number;
  showticklabels?: boolean;
  tickmode?: 'auto' | 'linear' | 'array';
  nticks?: number;
  tick0?: any;
  dtick?: any;
  tickvals?: any[];
  ticktext?: string[];
  tickfont?: Partial<{ family: string; size: number; color: string }>;
  tickangle?: number | 'auto';
  tickformat?: string;
  rangeslider?: Partial<{ visible: boolean; thickness: number; bgcolor: string; bordercolor: string; borderwidth: number; autorange: boolean; range: [any, any]; }>;
  rangeselector?: any; 
  showspikes?: boolean;
  spikemode?: string; 
  spikesnap?: string; 
  spikethickness?: number;
  spikedash?: string; 
  spikecolor?: string;
  [key: string]: any;
}

export interface PlotlyLayout {
  width?: number;
  height?: number;
  autosize?: boolean;
  title?: string | Partial<{ text: string; font: any; x: number; y: number; xanchor: string; yanchor: string }>;
  margin?: Partial<{ l: number; r: number; t: number; b: number; pad: number; autoexpand: boolean }>;
  paper_bgcolor?: string;
  plot_bgcolor?: string;
  showlegend?: boolean;
  legend?: Partial<{ bgcolor: string; bordercolor: string; borderwidth: number; font: any; orientation: 'v' | 'h'; traceorder: string; 
    x: number; xanchor: 'auto' | 'left' | 'center' | 'right'; y: number; yanchor: 'auto' | 'top' | 'middle' | 'bottom'; }>;
  grid?: Partial<{ rows: number; columns: number; pattern: 'independent' | 'coupled'; 옆domain: any; xgap: number; ygap: number; }>;
  font?: Partial<{ family: string; size: number; color: string }>;
  dragmode?: 'zoom' | 'pan' | 'select' | 'lasso' | 'orbit' | 'turntable' | false;
  hovermode?: 'x' | 'y' | 'closest' | 'x unified' | 'y unified' | false;
  hoverlabel?: Partial<{ bgcolor: string; bordercolor: string; font: any; align: 'left' | 'right' | 'auto'; namelength: number; }>;
  calendar?: string; 
  shapes?: PlotlyShape[];
  annotations?: PlotlyAnnotation[]; 
  images?: any[]; 
  uirevision?: any; 
  xaxis?: PlotlyLayoutAxis;
  yaxis?: PlotlyLayoutAxis;
  [axisName: string]: PlotlyLayoutAxis | any; 
}

export interface ReplayControlBarProps {
  onStepForward: () => void;
  onExitReplay: () => void;
}


declare global {
  interface Window {
    Plotly: any;
  }
  // If process.env.API_KEY is used, ensure it's declared for TypeScript if not already handled by build setup
  // namespace NodeJS {
  //   interface ProcessEnv {
  //     readonly API_KEY: string;
  //   }
  // }
}
