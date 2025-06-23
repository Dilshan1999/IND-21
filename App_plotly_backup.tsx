
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Candle, BinanceWebSocketMessage, DrawingTool, PlotlyShape, Theme, PlotlyLayout,
  DrawnObject, PlotlyAnnotation, TimeframeDefinition
} from './types';
import { formatVolume, formatPrice, formatPercentageChange } from './utils/priceFormatting'; 
import { 
  CRYPTO_PAIRS, CHART_INTERVALS, INITIAL_PAIR, INITIAL_INTERVAL, 
  TV_DARK_THEME, TV_LIGHT_THEME, MA_COLOR, BB_COLOR, RSI_COLOR,
  MACD_LINE_COLOR, MACD_SIGNAL_COLOR, MACD_HIST_POSITIVE_COLOR_DARK, MACD_HIST_NEGATIVE_COLOR_DARK,
  MACD_HIST_POSITIVE_COLOR_LIGHT, MACD_HIST_NEGATIVE_COLOR_LIGHT,
  TRENDLINE_COLOR, TRENDLINE_DRAWING_COLOR, REPLAY_START_LINE_COLOR,
  WS_URL, API_URL, KLINE_LIMIT, MAX_KLINE_WINDOW, DETAILED_TIMEFRANES
} from './constants';

// Import new layout components
import NewHeader from './components/tradingview_inspired/Header';
import NewLeftToolbar from './components/tradingview_inspired/LeftToolbar';
import NewChartArea from './components/tradingview_inspired/ChartArea';
import NewRightSidebar from './components/tradingview_inspired/RightSidebar';
import NewBottomBar from './components/tradingview_inspired/BottomBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';


// Existing components that are still used directly or wrapped
import ChartSection from './components/ChartSection'; // This is the core chart
import IndicatorPanel from './components/IndicatorPanel';
import Modal from './components/Modal';
// import ReplayControlBar from './components/ReplayControlBar';
// Footer is replaced by NewBottomBar
// TopBar is replaced by NewHeader
// LeftDrawingToolbar is replaced by NewLeftToolbar
// RightPanel is replaced by NewRightSidebar (for watchlist part)


const App: React.FC = () => {
  // Existing state variables - START
  const [theme, setTheme] = useState<Theme>('dark'); // Existing theme state
  const [selectedPair, setSelectedPair] = useState<string>(INITIAL_PAIR || "BTCUSDT");
  const [interval, setInterval] = useState<string>(INITIAL_INTERVAL);
  const [candles, setCandles] = useState<Candle[]>([]); 
  


  const [watchlistPrices, setWatchlistPrices] = useState<Record<string, number>>({});
  const [watchlistChanges, setWatchlistChanges] = useState<Record<string, number>>({});
  const watchlistInitialDataFetched = useRef<Record<string, boolean>>({});

  const [showMA, setShowMA] = useState<boolean>(true);
  const [maPeriod, setMAPeriod] = useState<number>(20);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [rsiPeriod, setRSIPeriod] = useState<number>(14);
  const [showBB, setShowBB] = useState<boolean>(false);
  const [bbPeriod, setBBPeriod] = useState<number>(20);
  const [bbDeviation, setBBDeviation] = useState<number>(2);
  const [showMACD, setShowMACD] = useState<boolean>(false);
  const [macdFastPeriod, setMACDFastPeriod] = useState<number>(12);
  const [macdSlowPeriod, setMACDSlowPeriod] = useState<number>(26);
  const [macdSignalPeriod, setMACDSignalPeriod] = useState<number>(9);

  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState<boolean>(false);
  const [drawingTool, _setDrawingTool] = useState<DrawingTool>('none'); 
  
  const [drawnObjects, setDrawnObjects] = useState<Record<string, DrawnObject[]>>({});
  const [drawnObjectsHistory, setDrawnObjectsHistory] = useState<Record<string, DrawnObject[][]>>({});
  const [drawnObjectsHistoryIndex, setDrawnObjectsHistoryIndex] = useState<Record<string, number>>({});
  
  const [trendlineStartPoint, setTrendlineStartPoint] = useState<{ x: Date; y: number } | null>(null);

  // Replay/OHLC state removed
  const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState<boolean>(false);
  // Existing state variables - END

  // New state from user's App component
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);

  const wsRefs = useRef<Record<string, WebSocket | null>>({});
  const plotRef = useRef<HTMLDivElement | null>(null);
  const plotlyLoaded = useRef<boolean>(!!window.Plotly);

  const currentChartKey = `${selectedPair}-${interval}`;
  const currentThemeColors = theme === 'dark' ? TV_DARK_THEME : TV_LIGHT_THEME;

  const setDrawingTool = useCallback((tool: DrawingTool) => {
    _setDrawingTool(tool);
    if (tool !== 'trendline') {
      setTrendlineStartPoint(null);
    }
  }, []);

  useEffect(() => {
    // This only toggles the class for existing components that might rely on it (e.g. Plotly config)
    // The new UI components have their own dark styling.
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  }
  const toggleIndicatorModal = () => {
    setIsIndicatorModalOpen(!isIndicatorModalOpen);
  }

  // Convert UI interval format to Binance API format
  const mapIntervalToBinanceFormat = (interval: string): string => {
    switch (interval) {
      case '1D': return '1d';
      case '3D': return '3d';
      case '1W': return '1w';
      case '1M': return '1M'; // Month stays uppercase
      default: return interval; // All other intervals (1m, 5m, 1h, etc.) are already correct
    }
  };

  const fetchHistoricalKlineData = useCallback(async (pair: string, fetchInterval: string, limit: number = KLINE_LIMIT, endTime?: number): Promise<Candle[]> => {
    const binanceInterval = mapIntervalToBinanceFormat(fetchInterval);
    console.log(`Fetching data for: ${pair}, UI interval: ${fetchInterval}, Binance interval: ${binanceInterval}`);
    let url = `${API_URL}/klines?symbol=${pair}&interval=${binanceInterval}&limit=${limit}`;
    if (endTime) {
        url += `&endTime=${endTime}`;
    }
    console.log(`API URL: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorBodyText = "Could not read error body";
        try { errorBodyText = await response.text(); } catch (textError) {}
        console.error(`API Error for ${url}: ${response.status} ${response.statusText}. Body: ${errorBodyText}`);
        throw new Error(`Failed to fetch klines for ${pair} (${binanceInterval}): Server responded with ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const candles = data.map((c: any[]) => ({
        t: new Date(c[0]), o: parseFloat(c[1]), h: parseFloat(c[2]), l: parseFloat(c[3]), c: parseFloat(c[4]), v: parseFloat(c[7])
      })).sort((a: Candle,b: Candle) => a.t.getTime() - b.t.getTime());
      console.log(`Fetched ${candles.length} candles, first few:`, candles.slice(0, 3));
      return candles;
    } catch (err) {
      console.error(`Error fetching historical data from URL ${url}:`, err);
      return [];
    }
  }, []);
  
  useEffect(() => {
    fetchHistoricalKlineData(selectedPair, interval, KLINE_LIMIT).then(initialCandles => {
        console.log(`Fetched ${initialCandles.length} candles for ${selectedPair} ${interval}:`, initialCandles.slice(0, 3));
        setCandles(initialCandles);
        setTrendlineStartPoint(null);
        if (!drawnObjectsHistory[currentChartKey]) { 
            updateDrawingHistory(drawnObjects[currentChartKey] || []);
        }
    });
  }, [selectedPair, interval, fetchHistoricalKlineData, currentChartKey]);

  useEffect(() => {
    const binanceInterval = mapIntervalToBinanceFormat(interval);
    const mainPairKey = `${selectedPair}@kline_${binanceInterval}`;
    Object.keys(wsRefs.current).forEach(key => { 
        if (key.includes('@kline_') && key !== mainPairKey) { 
            wsRefs.current[key]?.close();
            delete wsRefs.current[key];
        }
    });
    if (!wsRefs.current[mainPairKey] || wsRefs.current[mainPairKey]?.readyState !== WebSocket.OPEN) {
        if (wsRefs.current[mainPairKey]) { wsRefs.current[mainPairKey]?.close(); }
        const ws = new WebSocket(`${WS_URL}/${selectedPair.toLowerCase()}@kline_${binanceInterval}`);
        wsRefs.current[mainPairKey] = ws;
        ws.onmessage = (event: MessageEvent) => {
          const message = JSON.parse(event.data) as BinanceWebSocketMessage;
          if (message.s.toUpperCase() !== selectedPair.toUpperCase() || message.k.i !== binanceInterval) return; 
          const kline = message.k;
          const newCandle: Candle = { t: new Date(kline.t), o: parseFloat(kline.o), h: parseFloat(kline.h), l: parseFloat(kline.l), c: parseFloat(kline.c), v: parseFloat(kline.v) };
          setCandles(prev => {
            let updatedCandles = [...prev];
            const lastCandle = updatedCandles.length > 0 ? updatedCandles[updatedCandles.length - 1] : null;
            if (lastCandle && newCandle.t.getTime() === lastCandle.t.getTime()) { updatedCandles[updatedCandles.length - 1] = newCandle; }
            else if (!lastCandle || newCandle.t.getTime() > lastCandle.t.getTime()) { updatedCandles.push(newCandle); }
            else { return prev; }
            if (updatedCandles.length > MAX_KLINE_WINDOW) { return updatedCandles.slice(updatedCandles.length - MAX_KLINE_WINDOW); }
            return updatedCandles;
          });
        };
        ws.onerror = (event: Event) => console.error("WebSocket error for %s: %o", mainPairKey, event);
    }
  }, [selectedPair, interval]);

  useEffect(() => {
    CRYPTO_PAIRS.forEach(pair => {
        if (!watchlistInitialDataFetched.current[pair]) {
            fetchHistoricalKlineData(pair, '1d', 2).then(dailyCandles => {
                if (dailyCandles.length >= 2) {
                    const latest = dailyCandles[1].c; const previous = dailyCandles[0].c;
                    if (typeof latest === 'number' && typeof previous === 'number' && previous !== 0 && isFinite(latest) && isFinite(previous)) {
                        const change = ((latest - previous) / previous) * 100;
                        setWatchlistPrices(prev => ({ ...prev, [pair]: latest }));
                        setWatchlistChanges(prev => ({ ...prev, [pair]: change }));
                    } else if (typeof latest === 'number' && isFinite(latest)) { setWatchlistPrices(prev => ({ ...prev, [pair]: latest }));}
                } else if (dailyCandles.length === 1 && typeof dailyCandles[0].c === 'number' && isFinite(dailyCandles[0].c)) { setWatchlistPrices(prev => ({ ...prev, [pair]: dailyCandles[0].c })); }
                watchlistInitialDataFetched.current[pair] = true;
            });
        }
        const miniTickerKey = `${pair.toLowerCase()}@miniTicker`;
        if (wsRefs.current[miniTickerKey] && wsRefs.current[miniTickerKey]?.readyState === WebSocket.OPEN) return;
        if (wsRefs.current[miniTickerKey]) { wsRefs.current[miniTickerKey]?.close(); }
        const ws = new WebSocket(`${WS_URL}/${miniTickerKey}`);
        wsRefs.current[miniTickerKey] = ws;
        ws.onmessage = (event: MessageEvent) => {
            try {
                const ticker = JSON.parse(event.data);
                if (ticker.s && ticker.c && ticker.o) {
                     const currentPrice = parseFloat(ticker.c); const openPrice24h = parseFloat(ticker.o);
                     if (isFinite(currentPrice)) { setWatchlistPrices(prev => ({ ...prev, [ticker.s]: currentPrice })); }
                     if (isFinite(currentPrice) && isFinite(openPrice24h) && openPrice24h !== 0) {
                        const change24h = ((currentPrice - openPrice24h) / openPrice24h) * 100;
                        setWatchlistChanges(prev => ({ ...prev, [ticker.s]: change24h }));
                     }
                }
            } catch (e) { console.error("Error parsing watchlist ticker data:", e, event.data); }
        };
        ws.onerror = (event: Event) => console.error("Watchlist WebSocket error for %s: %o", miniTickerKey, event);
    });
    return () => { 
        CRYPTO_PAIRS.forEach(pair => {
            const miniTickerKey = `${pair.toLowerCase()}@miniTicker`;
            if (wsRefs.current[miniTickerKey]) { wsRefs.current[miniTickerKey]?.close(); delete wsRefs.current[miniTickerKey]; }
        });
    };
  }, [fetchHistoricalKlineData]); 



  // Indicator calculation functions (calculateMA, calculateRSI, etc.) - unchanged, keep them here
  const calculateMA = (data: Candle[], period: number): (number | null)[] => { return data.map((_, idx, arr) => { if (idx < period - 1) return null; const slice = arr.slice(idx - period + 1, idx + 1); return slice.reduce((sum, d) => sum + d.c, 0) / period; }); };
  const calculateRSI = (data: Candle[], period: number): (number | null)[] => { if(period <= 0 || data.length < period) return Array(data.length).fill(null); const rsiValues: (number | null)[] = Array(data.length).fill(null); let gains = 0; let losses = 0; const priceChanges = data.map((d, i) => i > 0 ? d.c - data[i-1].c : 0); for (let i = 1; i < data.length; i++) { const diff = priceChanges[i]; if (i <= period) { if (diff > 0) gains += diff; else losses += Math.abs(diff); if (i === period) { gains /= period; losses /= period;} } else { gains = (gains * (period - 1) + (diff > 0 ? diff : 0)) / period; losses = (losses * (period - 1) + (diff < 0 ? Math.abs(diff) : 0)) / period; } if (i >= period) { if (losses === 0) rsiValues[i] = 100; else { const rs = gains / losses; rsiValues[i] = 100 - (100 / (1 + rs)); } } } return rsiValues; };
  const calculateBollingerBands = (data: Candle[], period: number, deviation: number): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } => { if(period <= 0) return { upper: [], middle: [], lower: [] }; const middle = calculateMA(data, period); const upper: (number | null)[] = []; const lower: (number | null)[] = []; for (let i = 0; i < data.length; i++) { if (i < period - 1 || middle[i] === null) { upper.push(null); lower.push(null); continue; } const slice = data.slice(i - period + 1, i + 1).map(d => d.c); const mean = middle[i]!; const stdDev = Math.sqrt(slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period); upper.push(mean + deviation * stdDev); lower.push(mean - deviation * stdDev); } return { upper, middle, lower }; };
  const calculateEMA = (data: number[], period: number): (number | null)[] => { if (period <= 0 || data.length < period) return Array(data.length).fill(null); const emaArray: (number | null)[] = Array(data.length).fill(null); const k = 2 / (period + 1); let currentEma: number | null = null; for (let i = 0; i < data.length; i++) { if (currentEma === null) { if (i >= period -1) { currentEma = data.slice(i - period + 1, i + 1).reduce((s,v)=>s+v,0) / period; emaArray[i] = currentEma;} } else { currentEma = (data[i] * k) + (currentEma * (1 - k)); emaArray[i] = currentEma; } } return emaArray; };
  const calculateMACD = (data: Candle[], fastPeriod: number, slowPeriod: number, signalPeriod: number): { macdLine: (number | null)[]; signalLine: (number | null)[]; histogram: (number | null)[] } => { const closePrices = data.map(d => d.c); const emaFast = calculateEMA(closePrices, fastPeriod); const emaSlow = calculateEMA(closePrices, slowPeriod); const macdLine = emaFast.map((fast, i) => (fast !== null && emaSlow[i] !== null) ? fast - emaSlow[i]! : null); const validMacdValues = macdLine.filter(val => val !== null) as number[]; const rawSignalLine = calculateEMA(validMacdValues, signalPeriod); const alignedSignalLine: (number | null)[] = Array(macdLine.length).fill(null); let signalIdx = 0; for(let i = 0; i < macdLine.length; i++) { if (macdLine[i] !== null) { if (signalIdx < rawSignalLine.length) alignedSignalLine[i] = rawSignalLine[signalIdx++]; } } const histogram = macdLine.map((macd, i) => (macd !== null && alignedSignalLine[i] !== null) ? macd - alignedSignalLine[i]! : null); return { macdLine, signalLine: alignedSignalLine, histogram }; };
  
  const updateDrawingHistory = useCallback((newObjects: DrawnObject[]) => {
    setDrawnObjectsHistory(prevHistory => {
      const historyForChart = prevHistory[currentChartKey] || [[]]; 
      const currentIndex = drawnObjectsHistoryIndex[currentChartKey] ?? (historyForChart.length > 0 ? historyForChart.length - 1 : -1);
      const newHistoryForChart = [...historyForChart.slice(0, currentIndex + 1), newObjects];
      return { ...prevHistory, [currentChartKey]: newHistoryForChart };
    });
    setDrawnObjectsHistoryIndex(prevIndex => ({ ...prevIndex, [currentChartKey]: (prevIndex[currentChartKey] ?? -1) + 1 }));
  }, [currentChartKey, drawnObjectsHistoryIndex]);

  useEffect(() => {
    if (!drawnObjectsHistory[currentChartKey]) {
      updateDrawingHistory(drawnObjects[currentChartKey] || []);
    }
  }, [currentChartKey, drawnObjects, drawnObjectsHistory, updateDrawingHistory]);



  const intervalToMilliseconds = (intervalStr: string): number => { const unit = intervalStr.slice(-1); const value = parseInt(intervalStr.slice(0, -1)); if (isNaN(value)) return 0; switch (unit) { case 'm': return value * 60 * 1000; case 'h': return value * 60 * 60 * 1000; case 'D': return value * 24 * 60 * 60 * 1000; case 'W': return value * 7 * 24 * 60 * 60 * 1000; case 'M': return value * 30 * 24 * 60 * 60 * 1000; default: return 0; } };

  const fetchOlderKlines = useCallback(async () => {
    if (isLoadingMoreHistory || candles.length === 0) return;
    setIsLoadingMoreHistory(true); const oldestCandleTime = candles[0].t.getTime(); const newEndTime = oldestCandleTime - 1; 
    try {
        const olderKlines = await fetchHistoricalKlineData(selectedPair, interval, KLINE_LIMIT, newEndTime);
        if (olderKlines.length > 0) {
            setCandles(prevCandles => { const combined = [...olderKlines, ...prevCandles]; const uniqueCandles = Array.from(new Map(combined.map(c => [c.t.getTime(), c])).values()).sort((a,b) => a.t.getTime() - b.t.getTime()); return uniqueCandles; });
        } else { console.log("No more older historical data found."); }
    } catch (error) { console.error("Error fetching older klines:", error); }
    finally { setIsLoadingMoreHistory(false); }
  }, [selectedPair, interval, candles, fetchHistoricalKlineData, isLoadingMoreHistory]);

  const handlePlotRelayout = useCallback((eventData: any) => {
    if (isLoadingMoreHistory || candles.length === 0) return;
    const xAxisRangeStart = eventData['xaxis.range[0]'];
    if (xAxisRangeStart) {
        const viewStartDate = new Date(xAxisRangeStart); const oldestLoadedDate = candles[0].t;
        const threshold = intervalToMilliseconds(interval) * 5; 
        if (viewStartDate.getTime() - oldestLoadedDate.getTime() < threshold) { fetchOlderKlines(); }
    }
  }, [candles, interval, fetchOlderKlines, isLoadingMoreHistory]);

  const drawChart = useCallback(() => {
    if (!plotlyLoaded.current || !plotRef.current || !window.Plotly) { if (plotRef.current && window.Plotly) window.Plotly.purge(plotRef.current); return; }
    const candlesToUse = candles;
    console.log(`Drawing chart for ${selectedPair} ${interval}: ${candlesToUse.length} candles`);
    if (candlesToUse.length === 0) { if(plotRef.current && window.Plotly) window.Plotly.purge(plotRef.current); return; }
    const x = candlesToUse.map(c => c.t);
    const traces: any[] = [{ 
      type: "candlestick", 
      x: x, 
      open: candlesToUse.map(c => c.o), 
      high: candlesToUse.map(c => c.h), 
      low: candlesToUse.map(c => c.l), 
      close: candlesToUse.map(c => c.c), 
      name: "Price", 
      increasing: { line: { color: currentThemeColors.green, width: 1.5 }, fillcolor: currentThemeColors.green }, 
      decreasing: { line: { color: currentThemeColors.red, width: 1.5 }, fillcolor: currentThemeColors.red }, 
      hoverinfo: "x+text",
      hovertext: candlesToUse.map((c, idx) => {
        const changePercent = idx > 0 ? ((c.c - candlesToUse[idx-1].c) / candlesToUse[idx-1].c * 100) : 0;
        const changeAbs = idx > 0 ? (c.c - candlesToUse[idx-1].c) : 0;
        return `O: ${formatPrice(c.o, 4)}<br>H: ${formatPrice(c.h, 4)}<br>L: ${formatPrice(c.l, 4)}<br>C: ${formatPrice(c.c, 4)}<br>Vol: ${formatVolume(c.v)}<br>Change: ${formatPercentageChange(changePercent)} (${changeAbs >= 0 ? '+' : ''}${formatPrice(Math.abs(changeAbs), 4)})`;
      }),
      hoverlabel: {
        bgcolor: currentThemeColors.tooltip_bg,
        bordercolor: currentThemeColors.border,
        font: { color: currentThemeColors.tooltip_text, size: 11 }
      }
    }];
    if (showMA && maPeriod > 0) traces.push({ type: "scatter", mode: "lines", x: x, y: calculateMA(candlesToUse, maPeriod), name: `MA(${maPeriod})`, line: { color: MA_COLOR, width: 1.5 }, hoverinfo: "name+y" });
    if (showBB && bbPeriod > 0) { const { upper, middle, lower } = calculateBollingerBands(candlesToUse, bbPeriod, bbDeviation); traces.push( { type: "scatter", mode: "lines", x: x, y: upper, name: `BB Up`, line: { color: BB_COLOR, width: 1, dash: 'dash' }, hoverinfo: "name+y", opacity: 0.7 }, { type: "scatter", mode: "lines", x: x, y: middle, name: `BB Mid`, line: { color: BB_COLOR, width: 1.5 }, hoverinfo: "name+y" }, { type: "scatter", mode: "lines", x: x, y: lower, name: `BB Low`, line: { color: BB_COLOR, width: 1, dash: 'dash' }, hoverinfo: "name+y", opacity: 0.7 } ); }
    const indicatorSubplots: {name: string, traces: any[], yAxisTitle: string}[] = [];
    if (showRSI && rsiPeriod > 0) indicatorSubplots.push({ name: "RSI", traces: [{ type: "scatter", mode: "lines", x: x, y: calculateRSI(candlesToUse, rsiPeriod), name: `RSI(${rsiPeriod})`, line: { color: RSI_COLOR, width: 1.5 }, hoverinfo: "name+y" }], yAxisTitle: "RSI" });
    if (showMACD && macdFastPeriod > 0 && macdSlowPeriod > 0 && macdSignalPeriod > 0) { const { macdLine, signalLine, histogram } = calculateMACD(candlesToUse, macdFastPeriod, macdSlowPeriod, macdSignalPeriod); const histColors = histogram.map(h => h === null ? 'rgba(0,0,0,0)' : (h >= 0 ? (theme === 'dark' ? MACD_HIST_POSITIVE_COLOR_DARK : MACD_HIST_POSITIVE_COLOR_LIGHT) : (theme === 'dark' ? MACD_HIST_NEGATIVE_COLOR_DARK : MACD_HIST_NEGATIVE_COLOR_LIGHT))); indicatorSubplots.push({ name: "MACD", traces: [ { type: "scatter", mode: "lines", x: x, y: macdLine, name: `MACD(${macdFastPeriod},${macdSlowPeriod})`, line: { color: MACD_LINE_COLOR, width: 1.5 }, hoverinfo: "name+y" }, { type: "scatter", mode: "lines", x: x, y: signalLine, name: `Signal(${macdSignalPeriod})`, line: { color: MACD_SIGNAL_COLOR, width: 1.5 }, hoverinfo: "name+y" }, { type: "bar", x: x, y: histogram, name: `Histogram`, marker: { color: histColors }, hoverinfo: "name+y" }, ], yAxisTitle: "MACD" }); }
    const numIndicators = indicatorSubplots.length; const indicatorPlotHeight = 0.18; const indicatorSpacing = 0.02;  let currentYBottom = 0;
    let allShapes: PlotlyShape[] = []; let allAnnotations: PlotlyAnnotation[] = [];
    (drawnObjects[currentChartKey] || []).forEach(obj => { allShapes.push(...obj.shapes); allAnnotations.push(...obj.annotations); });
    if (candlesToUse.length > 0 && drawingTool === 'trendline' && trendlineStartPoint) { const lastCandle = candlesToUse[candlesToUse.length - 1]; const currentPreviewX = lastCandle.t; const currentPreviewY = lastCandle.c; allShapes.push({ type: 'line', x0: trendlineStartPoint.x, y0: trendlineStartPoint.y, x1: currentPreviewX, y1: currentPreviewY, line: { color: TRENDLINE_DRAWING_COLOR, width: 1, dash: 'dot' }, layer: 'above' }); }
    const layout: PlotlyLayout = { 
      dragmode: (drawingTool !== 'none' || trendlineStartPoint !== null) ? false : "pan", 
      uirevision: currentChartKey + theme + JSON.stringify(drawnObjects[currentChartKey] || []) + JSON.stringify(trendlineStartPoint), 
      paper_bgcolor: currentThemeColors.bg, 
      plot_bgcolor: currentThemeColors.bg, 
      margin: { t: 10, r: 50, l: 15, b: numIndicators > 0 ? 5 : 30 }, 
      legend: { orientation: "h", yanchor: "bottom", y: 1.01, xanchor: "left", x: 0.01, font: { color: currentThemeColors.text_secondary, size: 10 }, bgcolor: 'rgba(0,0,0,0)' }, 
      hovermode: 'x unified', 
      hoverlabel: { bgcolor: currentThemeColors.tooltip_bg, font: {color: currentThemeColors.tooltip_text, size: 11}, bordercolor: currentThemeColors.border }, 
      shapes: allShapes, 
      annotations: allAnnotations, 
      grid: { rows: 1 + numIndicators, columns: 1, pattern: 'independent'}, 
    };
    layout.yaxis = { domain: [numIndicators > 0 ? (numIndicators * (indicatorPlotHeight + indicatorSpacing)) : 0, 1], autorange: true, side: "right", fixedrange: drawingTool !=='none' || trendlineStartPoint !== null, gridcolor: currentThemeColors.grid, linecolor: currentThemeColors.border, tickfont: { color: currentThemeColors.text_secondary, size: 10 }, showspikes: drawingTool === 'none' && !trendlineStartPoint, spikemode: 'across', spikesnap: 'cursor', spikethickness: 1, spikedash: 'solid', spikecolor: currentThemeColors.crosshair, zerolinecolor: currentThemeColors.grid, zerolinewidth: 1, };
    layout.xaxis = { domain: [0,1], rangeslider: { visible: false }, type: "date", fixedrange: drawingTool !=='none' || trendlineStartPoint !== null, gridcolor: currentThemeColors.grid, linecolor: currentThemeColors.border, tickfont: { color: currentThemeColors.text_secondary, size: 10 }, showspikes: drawingTool === 'none' && !trendlineStartPoint, spikemode: 'across', spikesnap: 'cursor', spikethickness: 1, spikedash: 'solid', spikecolor: currentThemeColors.crosshair, showticklabels: numIndicators === 0, zeroline: false, };
    indicatorSubplots.forEach((subplot, index) => { const yAxisName = `yaxis${index + 2}`; const xAxisName = `xaxis${index + 2}`; traces.push(...subplot.traces.map(t => ({ ...t, yaxis: yAxisName, xaxis: xAxisName }))); layout[yAxisName] = { domain: [currentYBottom, currentYBottom + indicatorPlotHeight], autorange: true, side: "right", fixedrange: drawingTool !== 'none' || trendlineStartPoint !== null, title: {text: subplot.yAxisTitle, font:{size:10, color: currentThemeColors.text_secondary}}, tickfont: {size:9, color: currentThemeColors.text_secondary}, gridcolor: currentThemeColors.grid, linecolor: currentThemeColors.border, zerolinecolor: currentThemeColors.grid, zerolinewidth: 1, }; layout[xAxisName] = { type: "date", matches: 'x', anchor: yAxisName, overlaying: 'x', rangeslider: {visible: false}, showticklabels: index === indicatorSubplots.length -1, gridcolor: currentThemeColors.grid, linecolor: currentThemeColors.border, tickfont: { color: currentThemeColors.text_secondary, size: 10 }, zeroline: false, fixedrange: drawingTool !== 'none' || trendlineStartPoint !== null, }; currentYBottom += indicatorPlotHeight + indicatorSpacing; });
    if (numIndicators > 0) layout.xaxis.showticklabels = false;
    window.Plotly.react(plotRef.current, traces, layout, { responsive: true, displaylogo: false, scrollZoom: drawingTool === 'none' && !trendlineStartPoint });
  }, [candles, theme, currentThemeColors, showMA, maPeriod, showRSI, rsiPeriod, showBB, bbPeriod, bbDeviation, showMACD, macdFastPeriod, macdSlowPeriod, macdSignalPeriod, drawnObjects, currentChartKey, trendlineStartPoint, drawingTool]);

  useEffect(() => {
    let rafId: number | undefined;
    let intervalId: number | undefined;

    const attemptDrawChart = () => {
      if (plotRef.current && window.Plotly) { // Ensure ref and Plotly are available
        // Defer drawChart to the next animation frame
        // This can help ensure the DOM element is fully ready with dimensions
        rafId = requestAnimationFrame(() => {
          if (plotRef.current) { // Check ref again inside rAF, in case it was cleared
            drawChart();
          }
        });
      }
    };

    if (plotlyLoaded.current && plotRef.current) {
      attemptDrawChart();
    } else if (!plotlyLoaded.current) {
      intervalId = window.setInterval(() => {
        if (window.Plotly) {
          plotlyLoaded.current = true;
          window.clearInterval(intervalId);
          intervalId = undefined;
          attemptDrawChart(); // Plotly is now loaded, attempt to draw
        }
      }, 100);
    }
    // If plotlyLoaded.current is true, but plotRef.current was null initially,
    // this effect will re-run when drawChart's dependencies change (e.g., candles loading).
    // If plotRef.current becomes available by then, attemptDrawChart will be called.

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [drawChart]); // Dependency on drawChart ensures it re-runs when data/settings change
  

  useEffect(() => { 
    const plotDiv = plotRef.current; if (!plotDiv || !window.Plotly || !window.Plotly.hasOwnProperty('Plots') || !window.Plotly.Plots.getTimestamp || !(plotDiv instanceof HTMLDivElement)) return; const currentPlotRef = plotDiv as any; if (typeof currentPlotRef.on !== 'function' || typeof currentPlotRef.off !== 'function') return; 
    const memoizedHandlePlotRelayout = handlePlotRelayout;
    currentPlotRef.on('plotly_relayout', memoizedHandlePlotRelayout);
    return () => { if (currentPlotRef && typeof currentPlotRef.off === 'function') { currentPlotRef.off('plotly_relayout', memoizedHandlePlotRelayout); }}; 
  }, [handlePlotRelayout, candles.length]); 
  
  const clearDrawnLines = () => {
    const newObjectsForChart: DrawnObject[] = [];
    setDrawnObjects(prev => ({ ...prev, [currentChartKey]: newObjectsForChart }));
    updateDrawingHistory(newObjectsForChart); setTrendlineStartPoint(null);
  };
  
  const undoDrawing = () => {
    const historyForChart = drawnObjectsHistory[currentChartKey] || [];
    let currentIndex = drawnObjectsHistoryIndex[currentChartKey] ?? -1;
    if (currentIndex > 0) { currentIndex--; setDrawnObjects(prev => ({ ...prev, [currentChartKey]: historyForChart[currentIndex] || [] })); setDrawnObjectsHistoryIndex(prev => ({ ...prev, [currentChartKey]: currentIndex })); }
  };
  const redoDrawing = () => {
    const historyForChart = drawnObjectsHistory[currentChartKey] || [];
    let currentIndex = drawnObjectsHistoryIndex[currentChartKey] ?? -1;
    if (currentIndex < historyForChart.length - 1) { currentIndex++; setDrawnObjects(prev => ({ ...prev, [currentChartKey]: historyForChart[currentIndex] || [] })); setDrawnObjectsHistoryIndex(prev => ({ ...prev, [currentChartKey]: currentIndex })); }
  };
  const canUndoDrawing = (drawnObjectsHistory[currentChartKey]?.length ?? 0) > 1 && (drawnObjectsHistoryIndex[currentChartKey] ?? 0) > 0;
  const canRedoDrawing = (drawnObjectsHistory[currentChartKey]?.length ?? 0) > 0 && (drawnObjectsHistoryIndex[currentChartKey] ?? -1) < (drawnObjectsHistory[currentChartKey]!.length - 1);
  

  return (
    // New main layout structure
    <div className="flex flex-col h-screen bg-gray-900 font-sans">
      <NewHeader
        selectedPair={selectedPair}
        onSelectPair={setSelectedPair}
        pairsList={CRYPTO_PAIRS}
        selectedInterval={interval}
        onSelectInterval={setInterval}
        quickIntervalsList={CHART_INTERVALS}
        detailedTimeframesList={DETAILED_TIMEFRANES}
        onToggleIndicatorModal={toggleIndicatorModal}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        onUndo={undoDrawing}
        onRedo={redoDrawing}
        canUndo={canUndoDrawing}
        canRedo={canRedoDrawing}
      />
      <div className="flex flex-grow overflow-hidden">
          <NewLeftToolbar
            currentDrawingTool={drawingTool}
            onSetDrawingTool={setDrawingTool}
            onClearDrawings={clearDrawnLines}
          />
        <div className="flex flex-col flex-grow">
          <NewChartArea>
            <ChartSection 
              plotRef={plotRef} 
              theme={theme}
              candles={candles}
              showMA={showMA}
              maPeriod={maPeriod}
              showRSI={showRSI}
              rsiPeriod={rsiPeriod}
              showBB={showBB}
              bbPeriod={bbPeriod}
              bbStdDev={bbDeviation}
              showMACD={showMACD}
              macdFast={macdFastPeriod}
              macdSlow={macdSlowPeriod}
              macdSignal={macdSignalPeriod}
              showVolume={true}
            />
          </NewChartArea>
        </div>
        {isRightSidebarVisible && (
          <NewRightSidebar
            watchlistPairs={CRYPTO_PAIRS}
            currentSelectedPair={selectedPair} // For highlighting or context
            onSelectWatchlistPair={setSelectedPair}
            watchlistPricesMap={watchlistPrices}
            watchlistChangesMap={watchlistChanges}
            latestOhlcvForPair={null}
            fetchHistoricalKlineData={fetchHistoricalKlineData}
            currentInterval={interval}
          />
        )}
      </div>
      <NewBottomBar />

      {/* Floating button to toggle right sidebar (example from user's new App) */}
      <button
          onClick={() => setIsRightSidebarVisible(!isRightSidebarVisible)}
          className="fixed bottom-16 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg z-[60] md:hidden" // Ensure z-index is high enough
          title={isRightSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
          aria-label={isRightSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
      >
          {isRightSidebarVisible ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Existing Modal for Indicators */}
      <Modal isOpen={isIndicatorModalOpen} onClose={toggleIndicatorModal} title="Indicators">
        <IndicatorPanel
          showMA={showMA} setShowMA={setShowMA} maPeriod={maPeriod} setMAPeriod={setMAPeriod}
          showRSI={showRSI} setShowRSI={setShowRSI} rsiPeriod={rsiPeriod} setRSIPeriod={setRSIPeriod}
          showBB={showBB} setShowBB={setShowBB} bbPeriod={bbPeriod} setBBPeriod={setBBPeriod} bbDeviation={bbDeviation} setBBDeviation={setBBDeviation}
          showMACD={showMACD} setShowMACD={setShowMACD} 
          macdFastPeriod={macdFastPeriod} setMACDFastPeriod={setMACDFastPeriod}
          macdSlowPeriod={macdSlowPeriod} setMACDSlowPeriod={setMACDSlowPeriod}
          macdSignalPeriod={macdSignalPeriod} setMACDSignalPeriod={setMACDSignalPeriod}
          onClose={toggleIndicatorModal}
        />
      </Modal>
    </div>
  );
};

export default App;
