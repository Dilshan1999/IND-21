import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Percent, PieChart,
    BarChart3, Target, Clock, Calendar, Award, Activity, Zap
} from 'lucide-react';
import { formatPriceWithCurrency, formatPrice, formatPercentageChange } from '../../utils/priceFormatting';

interface Trade {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    price: number;
    timestamp: Date;
    pnl?: number;
}

interface PortfolioMetrics {
    totalValue: number;
    totalPnL: number;
    totalPnLPercent: number;
    dailyPnL: number;
    dailyPnLPercent: number;
    winRate: number;
    totalTrades: number;
    avgTradeSize: number;
    sharpeRatio: number;
    maxDrawdown: number;
}

interface PerformanceAnalyticsProps {
    isOpen: boolean;
    onClose: () => void;
    trades: Trade[];
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
    isOpen,
    onClose,
    trades
}) => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
    const [metrics, setMetrics] = useState<PortfolioMetrics>({
        totalValue: 12450.67,
        totalPnL: 1450.67,
        totalPnLPercent: 13.2,
        dailyPnL: 234.51,
        dailyPnLPercent: 1.9,
        winRate: 68.5,
        totalTrades: 47,
        avgTradeSize: 850.25,
        sharpeRatio: 1.45,
        maxDrawdown: -5.8
    });

    const mockTrades: Trade[] = [
        { id: '1', symbol: 'BTCUSDT', side: 'buy', quantity: 0.1, price: 43000, timestamp: new Date(Date.now() - 86400000), pnl: 150.50 },
        { id: '2', symbol: 'ETHUSDT', side: 'sell', quantity: 1.5, price: 2650, timestamp: new Date(Date.now() - 43200000), pnl: -45.20 },
        { id: '3', symbol: 'ADAUSDT', side: 'buy', quantity: 1000, price: 0.45, timestamp: new Date(Date.now() - 21600000), pnl: 25.80 },
        { id: '4', symbol: 'DOTUSDT', side: 'sell', quantity: 50, price: 7.8, timestamp: new Date(Date.now() - 10800000), pnl: 78.90 },
    ];

    const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

    const calculateWinRate = () => {
        const winningTrades = mockTrades.filter(trade => (trade.pnl || 0) > 0).length;
        return mockTrades.length > 0 ? (winningTrades / mockTrades.length) * 100 : 0;
    };

    const getPerformanceColor = (value: number) => {
        return value >= 0 ? 'text-green-400' : 'text-red-400';
    };

    const getPerformanceIcon = (value: number) => {
        return value >= 0 ? TrendingUp : TrendingDown;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-[1100px] h-[750px] border border-gray-700">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
                            {timeframes.map(tf => (
                                <button
                                    key={tf}
                                    onClick={() => setSelectedTimeframe(tf)}
                                    className={`px-3 py-1 rounded text-sm transition-colors ${
                                        selectedTimeframe === tf 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1 rounded"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(100%-60px)]">
                    
                    {/* Left Panel - Key Metrics */}
                    <div className="w-80 p-4 border-r border-gray-700">
                        <h4 className="text-white font-medium mb-4">Portfolio Overview</h4>
                        
                        <div className="space-y-4">
                            {/* Total Portfolio Value */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Total Value</span>
                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                </div>                                <div className="text-2xl font-bold text-white">
                                    {formatPriceWithCurrency(metrics.totalValue)}
                                </div>                                <div className={`text-sm ${getPerformanceColor(metrics.totalPnL)}`}>
                                    {formatPriceWithCurrency(metrics.totalPnL, '$', 2)} ({formatPercentageChange(metrics.totalPnLPercent)})
                                </div>
                            </div>

                            {/* Daily P&L */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Today's P&L</span>
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                </div>                                <div className={`text-xl font-bold ${getPerformanceColor(metrics.dailyPnL)}`}>
                                    {formatPriceWithCurrency(metrics.dailyPnL, '$', 2)}
                                </div>
                                <div className={`text-sm ${getPerformanceColor(metrics.dailyPnLPercent)}`}>
                                    {formatPercentageChange(metrics.dailyPnLPercent)}
                                </div>
                            </div>

                            {/* Win Rate */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Win Rate</span>
                                    <Target className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="text-xl font-bold text-white">
                                    {metrics.winRate}%
                                </div>
                                <div className="text-sm text-gray-400">
                                    {mockTrades.filter(t => (t.pnl || 0) > 0).length}/{mockTrades.length} trades
                                </div>
                            </div>

                            {/* Sharpe Ratio */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Sharpe Ratio</span>
                                    <Award className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="text-xl font-bold text-white">
                                    {metrics.sharpeRatio}
                                </div>
                                <div className="text-sm text-green-400">Excellent</div>
                            </div>

                            {/* Max Drawdown */}
                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Max Drawdown</span>
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                </div>
                                <div className="text-xl font-bold text-red-400">
                                    {metrics.maxDrawdown}%
                                </div>
                                <div className="text-sm text-gray-400">Low risk</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Charts and Analysis */}
                    <div className="flex-1 p-4">
                        
                        {/* Performance Chart Placeholder */}
                        <div className="mb-6">
                            <h4 className="text-white font-medium mb-3">Portfolio Performance</h4>
                            <div className="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center border border-gray-700">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-400">Performance chart would be rendered here</p>
                                    <p className="text-sm text-gray-500">Integration with charting library needed</p>
                                </div>
                            </div>
                        </div>

                        {/* Trade History */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-medium">Recent Trades</h4>
                                <span className="text-sm text-gray-400">{mockTrades.length} trades</span>
                            </div>
                            
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {mockTrades.map((trade) => {
                                    const PnLIcon = getPerformanceIcon(trade.pnl || 0);
                                    return (
                                        <div 
                                            key={trade.id}
                                            className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        trade.side === 'buy' ? 'bg-green-400' : 'bg-red-400'
                                                    }`} />
                                                    <div>
                                                        <div className="text-white font-medium">
                                                            {trade.symbol.replace('USDT', '/USDT')}
                                                        </div>                                        <div className="text-sm text-gray-400">
                                            {trade.side.toUpperCase()} {trade.quantity} @ {formatPriceWithCurrency(trade.price)}
                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <div className={`flex items-center space-x-1 ${getPerformanceColor(trade.pnl || 0)}`}>
                                                        <PnLIcon className="w-3 h-3" />                                                        <span className="font-medium">
                                                            {formatPriceWithCurrency(trade.pnl || 0, '$', 2)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {trade.timestamp.toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
