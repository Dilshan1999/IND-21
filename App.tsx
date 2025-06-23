import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Candle, BinanceWebSocketMessage, DrawingTool, Theme
} from './types';
import { formatVolume, formatPrice, formatPercentageChange } from './utils/priceFormatting'; 
import { 
  CRYPTO_PAIRS, CHART_INTERVALS, INITIAL_PAIR, INITIAL_INTERVAL, 
  DARK_THEME, LIGHT_THEME,
  WS_URL, API_URL, KLINE_LIMIT, MAX_KLINE_WINDOW, DETAILED_TIMEFRANES
} from './constants';

// Import new layout components
import NewHeader from './components/tradingview_inspired/Header';
import NewLeftToolbar from './components/tradingview_inspired/LeftToolbar';
import NewChartArea from './components/tradingview_inspired/ChartArea';
import NewRightSidebar from './components/tradingview_inspired/RightSidebar';
import NewBottomBar from './components/tradingview_inspired/BottomBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Chart components
import ChartSection from './components/ChartSection';
import IndicatorPanel from './components/IndicatorPanel';
import Modal from './components/Modal';
import DebugPanel from './components/DebugPanel';

const App: React.FC = () => {
  // Theme and UI state
  const [theme, setTheme] = useState<Theme>('dark');
  const [selectedPair, setSelectedPair] = useState<string>(INITIAL_PAIR || "BTCUSDT");
  const [interval, setInterval] = useState<string>(INITIAL_INTERVAL);
  const [candles, setCandles] = useState<Candle[]>([]);
  
  // Watchlist data
  const [watchlistPrices, setWatchlistPrices] = useState<Record<string, number>>({});
  const [watchlistChanges, setWatchlistChanges] = useState<Record<string, number>>({});
  const watchlistInitialDataFetched = useRef<Record<string, boolean>>({});
  // Indicator settings
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
  const [showVolume, setShowVolume] = useState<boolean>(false);
  // UI state
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState<boolean>(false);
  const [drawingTool, _setDrawingTool] = useState<DrawingTool>('none'); 
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);
  const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState<boolean>(false);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(true); // Debug panel visibility

  // Refs
  const wsRefs = useRef<Record<string, WebSocket | null>>({});
  const plotRef = useRef<HTMLDivElement | null>(null);

  const currentChartKey = `${selectedPair}-${interval}`;
  const currentThemeColors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const setDrawingTool = useCallback((tool: DrawingTool) => {
    _setDrawingTool(tool);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  }

  const toggleIndicatorModal = () => {
    setIsIndicatorModalOpen(!isIndicatorModalOpen);
  };

  // Fetch initial candles
  const fetchInitialCandles = useCallback(async (pair: string, timeframe: string): Promise<Candle[]> => {
    try {
      const formattedPair = pair.replace('/', '').toUpperCase();
      const url = `${API_URL}/klines?symbol=${formattedPair}&interval=${timeframe}&limit=${KLINE_LIMIT}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const candles: Candle[] = data.map((k: any[]) => ({
        t: new Date(k[0]),
        o: parseFloat(k[1]),
        h: parseFloat(k[2]),
        l: parseFloat(k[3]),
        c: parseFloat(k[4]),
        v: parseFloat(k[5])
      }));
      
      console.log(`Fetched ${candles.length} candles for ${pair} ${timeframe}:`, candles.slice(0, 3));
      return candles;
    } catch (error) {
      console.error('Error fetching initial candles:', error);
      return [];
    }
  }, []);

  // Setup WebSocket for real-time data
  const setupWebSocket = useCallback((pair: string, timeframe: string) => {
    const wsKey = `${pair}-${timeframe}`;
    
    if (wsRefs.current[wsKey]) {
      wsRefs.current[wsKey]?.close();
    }

    const formattedPair = pair.replace('/', '').toLowerCase();
    const wsUrl = `${WS_URL}/ws/${formattedPair}@kline_${timeframe}`;
    
    const ws = new WebSocket(wsUrl);
    wsRefs.current[wsKey] = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected for ${pair} ${timeframe}`);
    };    ws.onmessage = (event) => {
      try {
        const message: BinanceWebSocketMessage = JSON.parse(event.data);
        const kline = message.k;
        
        const newCandle: Candle = {
          t: new Date(kline.t),
          o: parseFloat(kline.o),
          h: parseFloat(kline.h),
          l: parseFloat(kline.l),
          c: parseFloat(kline.c),
          v: parseFloat(kline.v)
        };

        console.log(`🔄 Real-time update for ${pair}:`, {
          price: formatPrice(newCandle.c),
          closed: kline.x,
          timestamp: newCandle.t.toLocaleTimeString(),
          currentCandlesCount: candles.length
        });        setCandles(prevCandles => {
          const updatedCandles = [...prevCandles];
          const lastCandle = updatedCandles[updatedCandles.length - 1];
          
          if (lastCandle && lastCandle.t.getTime() === newCandle.t.getTime()) {
            // Update existing candle (real-time update)
            updatedCandles[updatedCandles.length - 1] = newCandle;
            console.log(`✅ Updated existing candle: ${formatPrice(newCandle.c)}`);
            return updatedCandles;
          } else if (kline.x) {
            // Only add new candle if it's closed
            updatedCandles.push(newCandle);
            console.log(`🆕 Added new closed candle: ${formatPrice(newCandle.c)}`);
            return updatedCandles.slice(-KLINE_LIMIT);
          }
          
          // For live updates of non-matching timestamps, we might need to add the candle
          // This handles the case where we get a new live candle
          if (!kline.x) {
            updatedCandles.push(newCandle);
            console.log(`🔴 Added new live candle: ${formatPrice(newCandle.c)}`);
            return updatedCandles.slice(-KLINE_LIMIT);
          }
          
          return updatedCandles;
        });
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${pair} ${timeframe}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for ${pair} ${timeframe}`);
    };
  }, []);

  // Setup watchlist WebSockets
  const setupWatchlistWebSocket = useCallback(() => {
    const watchlistPairs = CRYPTO_PAIRS.slice(0, 10); // Limit to first 10 pairs
    
    watchlistPairs.forEach(pair => {
      const formattedPair = pair.replace('/', '').toLowerCase();
      const wsUrl = `${WS_URL}/ws/${formattedPair}@ticker`;
      
      const ws = new WebSocket(wsUrl);
      wsRefs.current[`watchlist-${pair}`] = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const price = parseFloat(data.c);
          const change = parseFloat(data.P);
          
          setWatchlistPrices(prev => ({ ...prev, [pair]: price }));
          setWatchlistChanges(prev => ({ ...prev, [pair]: change }));
        } catch (error) {
          console.error(`Error processing watchlist data for ${pair}:`, error);
        }
      };
    });
  }, []);

  // Initialize data when pair or interval changes
  useEffect(() => {
    const initializeData = async () => {
      const initialCandles = await fetchInitialCandles(selectedPair, interval);
      setCandles(initialCandles);
      setupWebSocket(selectedPair, interval);
    };

    initializeData();
    
    return () => {
      const wsKey = `${selectedPair}-${interval}`;
      if (wsRefs.current[wsKey]) {
        wsRefs.current[wsKey]?.close();
        delete wsRefs.current[wsKey];
      }
    };
  }, [selectedPair, interval, fetchInitialCandles, setupWebSocket]);

  // Initialize watchlist data
  useEffect(() => {
    setupWatchlistWebSocket();
    
    return () => {
      CRYPTO_PAIRS.forEach(pair => {
        const wsKey = `watchlist-${pair}`;
        if (wsRefs.current[wsKey]) {
          wsRefs.current[wsKey]?.close();
          delete wsRefs.current[wsKey];
        }
      });
    };
  }, [setupWatchlistWebSocket]);
  return (
    <div className={`w-full h-screen flex flex-col overflow-hidden`} style={{ backgroundColor: currentThemeColors.bg, color: currentThemeColors.text }}>      {/* Header */}
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
        onUndo={() => {}} // Placeholder for undo functionality
        onRedo={() => {}} // Placeholder for redo functionality
        canUndo={false}
        canRedo={false}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">        {/* Left Toolbar */}
        <NewLeftToolbar 
          currentDrawingTool={drawingTool}
          onSetDrawingTool={setDrawingTool}
          onClearDrawings={() => {}} // Placeholder for clear drawings functionality
        />{/* Chart Area */}
        <div className="flex-1 flex flex-col">
          <ChartSection 
            plotRef={plotRef}
            candles={candles}
            theme={theme}
            showMA={showMA}
            maPeriod={maPeriod}
            showRSI={showRSI}
            rsiPeriod={rsiPeriod}
            showBB={showBB}
            bbPeriod={bbPeriod}
            bbStdDev={bbDeviation}            showMACD={showMACD}
            macdFast={macdFastPeriod}
            macdSlow={macdSlowPeriod}
            macdSignal={macdSignalPeriod}
            showVolume={showVolume}
          />
        </div>

        {/* Right Sidebar Toggle */}
        <div className="flex">
          <button
            onClick={() => setIsRightSidebarVisible(!isRightSidebarVisible)}
            className="w-4 bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            {isRightSidebarVisible ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
            {/* Right Sidebar */}          {isRightSidebarVisible && (
            <NewRightSidebar 
              watchlistPairs={CRYPTO_PAIRS.slice(0, 10)}
              currentSelectedPair={selectedPair}
              onSelectWatchlistPair={setSelectedPair}
              watchlistPricesMap={watchlistPrices}
              watchlistChangesMap={watchlistChanges}              latestOhlcvForPair={candles.length > 0 ? {
                open: candles[candles.length - 1].o,
                high: candles[candles.length - 1].h,
                low: candles[candles.length - 1].l,
                close: candles[candles.length - 1].c,
                volume: candles[candles.length - 1].v,
                pair: selectedPair
              } : null}
              fetchHistoricalKlineData={async (pair: string, interval: string, limit?: number) => {
                return await fetchInitialCandles(pair, interval);
              }}
              currentInterval={interval}
            />
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <NewBottomBar />      {/* Indicator Modal */}
      {isIndicatorModalOpen && (
        <Modal isOpen={isIndicatorModalOpen} title="Technical Indicators" onClose={toggleIndicatorModal}>          <IndicatorPanel
            showMA={showMA} setShowMA={setShowMA} maPeriod={maPeriod} setMAPeriod={setMAPeriod}
            showRSI={showRSI} setShowRSI={setShowRSI} rsiPeriod={rsiPeriod} setRSIPeriod={setRSIPeriod}
            showBB={showBB} setShowBB={setShowBB} bbPeriod={bbPeriod} setBBPeriod={setBBPeriod} bbDeviation={bbDeviation} setBBDeviation={setBBDeviation}
            showMACD={showMACD} setShowMACD={setShowMACD} macdFastPeriod={macdFastPeriod} setMACDFastPeriod={setMACDFastPeriod} macdSlowPeriod={macdSlowPeriod} setMACDSlowPeriod={setMACDSlowPeriod} macdSignalPeriod={macdSignalPeriod} setMACDSignalPeriod={setMACDSignalPeriod}
            showVolume={showVolume} setShowVolume={setShowVolume}
          />
        </Modal>
      )}

      {/* Debug Panel */}
      <DebugPanel 
        candles={candles}
        selectedPair={selectedPair}
        interval={interval}
        isVisible={showDebugPanel}
      />
      
      {/* Debug Toggle Button */}
      <button
        onClick={() => setShowDebugPanel(!showDebugPanel)}
        className="fixed top-16 right-80 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs z-50"
      >
        {showDebugPanel ? '🔍 Hide Debug' : '🔍 Show Debug'}
      </button>
    </div>
  );
};

export default App;
