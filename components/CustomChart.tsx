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
  CrosshairMode,
  PriceScaleMode
} from 'lightweight-charts';
import { Candle } from '../types';
import { formatPrice, formatVolume } from '../utils/priceFormatting';

interface CustomChartProps {
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

const CustomChart: React.FC<CustomChartProps> = ({
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

  // Calculate moving average
  const calculateMA = useCallback((data: CandlestickData[], period: number): LineData[] => {
    const result: LineData[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
      const average = sum / period;
      result.push({
        time: data[i].time,
        value: average,
      });
    }
    return result;
  }, []);
  // Convert candles to chart data
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
      value: candle.v || 0,
      color: candle.c >= candle.o ? '#26a69a' : '#ef5350',
    }));    // Log the last candle for debugging
    if (candlestickData.length > 0) {
      const lastCandle = candlestickData[candlestickData.length - 1];
      console.log(`Chart data updated - Last candle: ${lastCandle.close} at ${new Date((lastCandle.time as number) * 1000).toLocaleTimeString()}`);
    }

    return { candlestickData, volumeData };
  }, [candles]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#1a1a1a' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d4dc' : '#191919',
        fontSize: 12,
        fontFamily: 'Trebuchet MS, sans-serif',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: {
          color: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
          style: 1,
          visible: true,
        },
        horzLines: {
          color: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
          style: 1,
          visible: true,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: theme === 'dark' ? '#758696' : '#6a7b8a',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: theme === 'dark' ? '#758696' : '#6a7b8a',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#2a2a2a' : '#d1d4dc',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.4 : 0.1,
        },
        mode: PriceScaleMode.Normal,
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#2a2a2a' : '#d1d4dc',
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        color: 'rgba(0, 0, 0, 0)',
        visible: false,
        text: '',
        fontSize: 0,
        horzAlign: 'center',
        vertAlign: 'center',
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series only if showVolume is true
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: theme === 'dark' ? '#26a69a80' : '#26a69a60',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries;
    } else {
      volumeSeriesRef.current = null;
    }

    // Add MA series if enabled
    if (showMA) {
      const maSeries = chart.addLineSeries({
        color: '#2196f3',
        lineWidth: 2,
        title: `MA${maPeriod}`,
      });
      maSeriesRef.current = maSeries;
    } else {
      maSeriesRef.current = null;
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
  }, [theme, height, showVolume, showMA, maPeriod]);  // Update chart data
  useEffect(() => {
    if (!chartData.candlestickData.length) return;

    // Use setData for initial load and updates for better performance
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(chartData.candlestickData);
      console.log(`Chart updated with ${chartData.candlestickData.length} candles`);
    }

    // Update volume data only if volume series exists
    if (volumeSeriesRef.current && showVolume) {
      volumeSeriesRef.current.setData(chartData.volumeData);
    }

    // Update MA data if enabled
    if (maSeriesRef.current && showMA) {
      const maData = calculateMA(chartData.candlestickData, maPeriod);
      maSeriesRef.current.setData(maData);
    }
  }, [chartData, showVolume, showMA, maPeriod, calculateMA]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={chartContainerRef} 
        className="w-full h-full"
        style={{ 
          background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

export default CustomChart;
