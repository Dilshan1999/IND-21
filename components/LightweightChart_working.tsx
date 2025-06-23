import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  CandlestickData, 
  LineData, 
  HistogramData, 
  Time,
  ISeriesApi,
  SeriesType
} from 'lightweight-charts';
import { Candle } from '../types';
import { formatPrice, formatVolume, formatPercentageChange } from '../utils/priceFormatting';

interface LightweightChartProps {
  candles: Candle[];
  theme: 'dark' | 'light';
  showMA: boolean;
  maPeriod: number;
  showRSI: boolean;
  rsiPeriod: number;
  showBB: boolean;
  bbPeriod: number;
  bbStdDev: number;
  showMACD: boolean;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  showVolume: boolean;
  height?: number;
}

const LightweightChart: React.FC<LightweightChartProps> = ({
  candles,
  theme,
  showMA,
  maPeriod,
  showRSI,
  rsiPeriod,
  showBB,
  bbPeriod,
  bbStdDev,
  showMACD,
  macdFast,
  macdSlow,
  macdSignal,
  showVolume,
  height = 600
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Calculate Moving Average
  const calculateMA = useCallback((data: Candle[], period: number): LineData[] => {
    const result: LineData[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.c, 0);
      const avg = sum / period;
      result.push({
        time: Math.floor(data[i].t.getTime() / 1000) as Time,
        value: avg
      });
    }
    return result;
  }, []);

  // Calculate RSI
  const calculateRSI = useCallback((data: Candle[], period: number): LineData[] => {
    if (data.length < period + 1) return [];
    
    const changes = data.slice(1).map((candle, i) => candle.c - data[i].c);
    const result: LineData[] = [];
    
    for (let i = period; i < changes.length; i++) {
      const recentChanges = changes.slice(i - period, i);
      const gains = recentChanges.filter(change => change > 0);
      const losses = recentChanges.filter(change => change < 0).map(loss => Math.abs(loss));
      
      const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
      const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      result.push({
        time: Math.floor(data[i + 1].t.getTime() / 1000) as Time,
        value: rsi
      });
    }
    return result;
  }, []);

  // Convert candles to lightweight-charts format
  const chartData = useMemo(() => {
    if (!candles.length) return { candlestickData: [], volumeData: [] };

    const candlestickData: CandlestickData[] = candles.map(candle => ({
      time: Math.floor(candle.t.getTime() / 1000) as Time,
      open: candle.o,
      high: candle.h,
      low: candle.l,
      close: candle.c,
    }));

    const volumeData: HistogramData[] = candles.map(candle => ({
      time: Math.floor(candle.t.getTime() / 1000) as Time,
      value: candle.v,
      color: candle.c >= candle.o ? '#22c55e80' : '#ef444480',
    }));

    return { candlestickData, volumeData };
  }, [candles]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#1f2937' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d5db' : '#374151',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
        horzLines: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.4 : 0.1,
        },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });
    candlestickSeriesRef.current = candlestickSeries;    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: theme === 'dark' ? '#6b7280' : '#9ca3af',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries;
    }

    // Add MA series if enabled
    if (showMA) {
      const maSeries = chart.addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
      });
      maSeriesRef.current = maSeries;
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [theme, height, showVolume, showMA]);

  // Update data when candles change
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || !chartData.candlestickData.length) return;

    candlestickSeriesRef.current.setData(chartData.candlestickData);

    // Update volume data
    if (showVolume && volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(chartData.volumeData);
    }

    // Update MA data
    if (showMA && maSeriesRef.current && maPeriod > 0) {
      const maData = calculateMA(candles, maPeriod);
      maSeriesRef.current.setData(maData);
    }

    // Fit content to show all data
    chartRef.current.timeScale().fitContent();
  }, [chartData, showVolume, showMA, maPeriod, calculateMA, candles]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={chartContainerRef}
        className="w-full h-full"
        style={{ height: `${height}px` }}
      />
      {candles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-lg mb-2">No chart data available</div>
            <div className="text-sm">Loading market data...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightweightChart;
