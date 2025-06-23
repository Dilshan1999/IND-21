import React from 'react';
import { Candle } from '../types';
import { formatPrice, formatPercentageChange } from '../utils/priceFormatting';

interface DebugPanelProps {
  candles: Candle[];
  selectedPair: string;
  interval: string;
  isVisible: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  candles, 
  selectedPair, 
  interval, 
  isVisible 
}) => {
  if (!isVisible || candles.length === 0) return null;

  const lastCandle = candles[candles.length - 1];
  const previousCandle = candles.length > 1 ? candles[candles.length - 2] : null;
  const priceChange = previousCandle ? lastCandle.c - previousCandle.c : 0;
  const percentChange = previousCandle ? (priceChange / previousCandle.c) * 100 : 0;

  return (
    <div className="fixed top-16 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 min-w-[300px]">
      <div className="text-sm font-bold mb-2">🔍 Debug Panel</div>
      
      <div className="space-y-2 text-xs">
        <div><strong>Pair:</strong> {selectedPair}</div>
        <div><strong>Interval:</strong> {interval}</div>
        <div><strong>Total Candles:</strong> {candles.length}</div>
        
        <hr className="border-gray-600" />
        
        <div><strong>Last Update:</strong> {lastCandle.t.toLocaleTimeString()}</div>
        <div><strong>Current Price:</strong> {formatPrice(lastCandle.c)}</div>
        {previousCandle && (
          <div className={`${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <strong>Change:</strong> {formatPercentageChange(percentChange)}
          </div>
        )}
        
        <hr className="border-gray-600" />
        
        <div className="text-xs">
          <div><strong>OHLC:</strong></div>
          <div>O: {formatPrice(lastCandle.o)}</div>
          <div>H: {formatPrice(lastCandle.h)}</div>
          <div>L: {formatPrice(lastCandle.l)}</div>
          <div>C: {formatPrice(lastCandle.c)}</div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
