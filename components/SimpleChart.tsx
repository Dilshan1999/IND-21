import React from 'react';
import { Candle } from '../types';
import { formatPrice, formatVolume, formatPercentageChange } from '../utils/priceFormatting';

interface SimpleChartProps {
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

const SimpleChart: React.FC<SimpleChartProps> = ({
  candles,
  theme,
  height = 600
}) => {
  const latestCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];
  
  const priceChange = latestCandle && previousCandle ? 
    latestCandle.c - previousCandle.c : 0;
  const priceChangePercent = latestCandle && previousCandle ? 
    ((latestCandle.c - previousCandle.c) / previousCandle.c) * 100 : 0;

  return (
    <div 
      className={`w-full flex flex-col items-center justify-center border rounded-lg ${
        theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}
      style={{ height: `${height}px` }}
    >
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Chart Component (Lightweight Charts Integration)</h3>
        
        {latestCandle ? (
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {formatPrice(latestCandle.c)}
            </div>
            <div className={`text-lg ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)} ({formatPercentageChange(priceChangePercent)})
            </div>
            <div className="text-sm text-gray-500">
              Volume: {formatVolume(latestCandle.v)}
            </div>
            <div className="text-xs space-y-1">
              <div>Open: {formatPrice(latestCandle.o)}</div>
              <div>High: {formatPrice(latestCandle.h)}</div>
              <div>Low: {formatPrice(latestCandle.l)}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            <div className="text-lg mb-2">No chart data available</div>
            <div className="text-sm">Loading market data...</div>
          </div>
        )}
        
        <div className="text-xs text-gray-400 mt-6">
          📊 Professional lightweight-charts integration in progress
        </div>
      </div>
    </div>
  );
};

export default SimpleChart;
