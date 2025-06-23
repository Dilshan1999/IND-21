import React, { useEffect, useRef, useCallback } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  CandlestickData, 
  LineData, 
  HistogramData, 
  Time,
  ISeriesApi
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
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

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
      upColor: theme === 'dark' ? '#089981' : '#26a69a',
      downColor: theme === 'dark' ? '#f23645' : '#ef5350',
      borderVisible: false,
      wickUpColor: theme === 'dark' ? '#089981' : '#26a69a',
      wickDownColor: theme === 'dark' ? '#f23645' : '#ef5350',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: theme === 'dark' ? '#6b728080' : '#9ca3af80',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      
      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
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
    if (!chartRef.current || !candlestickSeriesRef.current || candles.length === 0) return;

    // Convert candles to lightweight-charts format
    const candlestickData: CandlestickData[] = candles.map(candle => ({
      time: Math.floor(candle.t.getTime() / 1000) as Time,
      open: candle.o,
      high: candle.h,
      low: candle.l,
      close: candle.c,
    }));

    candlestickSeriesRef.current.setData(candlestickData);

    // Update volume data
    if (showVolume && volumeSeriesRef.current && candles.every(c => c.v !== undefined)) {
      const volumeData: HistogramData[] = candles.map(candle => ({
        time: Math.floor(candle.t.getTime() / 1000) as Time,
        value: candle.v || 0,
        color: candle.c >= candle.o ? (theme === 'dark' ? '#08998140' : '#26a69a40') : (theme === 'dark' ? '#f2364540' : '#ef535040'),
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    // Update MA data
    if (showMA && maSeriesRef.current) {
      const maData = calculateMA(candles, maPeriod);
      maSeriesRef.current.setData(maData);
    }

    // Fit content to show all data
    chartRef.current.timeScale().fitContent();
  }, [candles, showVolume, showMA, maPeriod, calculateMA, theme]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={chartContainerRef}
        className="w-full h-full"
        style={{ height: `${height}px` }}
      />
      {candles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="text-lg mb-2">📊 Lightweight Charts</div>
            <div className="text-sm">Loading market data...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightweightChart;
