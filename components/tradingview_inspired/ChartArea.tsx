import React, { useState } from 'react';
import { 
    BarChart3, CandlestickChart, TrendingUp, Activity, Zap, 
    Grid3X3, Palette, Camera, Download, Settings, Maximize2,
    Volume2, VolumeX, Lock, Unlock, Plus, Target, ShoppingCart
} from 'lucide-react';
import IndicatorsPanel from './IndicatorsPanel';
import OrderEntry from './OrderEntry';
import MultiChartLayout from './MultiChartLayout';

interface ChartToolbarProps {
    chartType: string;
    onChartTypeChange: (type: string) => void;
    showGrid: boolean;
    onToggleGrid: () => void;
    isLocked: boolean;
    onToggleLock: () => void;
    onShowIndicators: () => void;
    onShowOrderEntry: () => void;
    onShowMultiLayout: () => void;
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({
    chartType,
    onChartTypeChange,
    showGrid,
    onToggleGrid,
    isLocked,
    onToggleLock,
    onShowIndicators,
    onShowOrderEntry,
    onShowMultiLayout
}) => {
    const [showChartTypes, setShowChartTypes] = useState(false);

    const chartTypes = [
        { id: 'candlestick', icon: CandlestickChart, label: 'Candlestick' },
        { id: 'line', icon: TrendingUp, label: 'Line' },
        { id: 'area', icon: Activity, label: 'Area' },
        { id: 'bars', icon: BarChart3, label: 'Bars' },
        { id: 'hollow', icon: CandlestickChart, label: 'Hollow Candles' },
    ];

    return (
        <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
            {/* Chart Type Selector */}
            <div className="relative">
                <button
                    onClick={() => setShowChartTypes(!showChartTypes)}
                    className="bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center space-x-2 border border-gray-600/50 transition-all"
                    title="Chart Type"
                >
                    {(() => {
                        const currentType = chartTypes.find(t => t.id === chartType);
                        const IconComponent = currentType?.icon;
                        return IconComponent ? <IconComponent className="w-4 h-4 text-gray-300" /> : null;
                    })()}
                    <span className="text-sm text-gray-300 hidden sm:block">
                        {chartTypes.find(t => t.id === chartType)?.label || 'Candlestick'}
                    </span>
                </button>
                
                {showChartTypes && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-20 min-w-48">
                        {chartTypes.map(type => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    onChartTypeChange(type.id);
                                    setShowChartTypes(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors
                                    ${chartType === type.id ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                            >
                                <type.icon className="w-4 h-4" />
                                <span className="text-sm">{type.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Tools */}
            <div className="flex items-center space-x-1">
                <button
                    onClick={onToggleGrid}
                    className={`p-2 rounded-lg transition-colors border border-gray-600/50 backdrop-blur-sm
                        ${showGrid ? 'bg-blue-600 text-white' : 'bg-gray-800/90 hover:bg-gray-700 text-gray-300'}`}
                    title="Toggle Grid"
                >
                    <Grid3X3 className="w-4 h-4" />
                </button>
                
                <button
                    onClick={onToggleLock}
                    className={`p-2 rounded-lg transition-colors border border-gray-600/50 backdrop-blur-sm
                        ${isLocked ? 'bg-red-600 text-white' : 'bg-gray-800/90 hover:bg-gray-700 text-gray-300'}`}
                    title={isLocked ? "Unlock Scale" : "Lock Scale"}
                >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>

                {/* Advanced Features */}
                <button
                    onClick={onShowIndicators}
                    className="bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 p-2 rounded-lg border border-gray-600/50 transition-all"
                    title="Technical Indicators"
                >
                    <Activity className="w-4 h-4 text-gray-300" />
                </button>

                <button
                    onClick={onShowOrderEntry}
                    className="bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 p-2 rounded-lg border border-gray-600/50 transition-all"
                    title="Trading Panel"
                >
                    <ShoppingCart className="w-4 h-4 text-gray-300" />
                </button>

                <button
                    onClick={onShowMultiLayout}
                    className="bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 p-2 rounded-lg border border-gray-600/50 transition-all"
                    title="Multi-Chart Layout"
                >
                    <Maximize2 className="w-4 h-4 text-gray-300" />
                </button>
            </div>
        </div>
    );
};

interface ChartAreaProps {
    children: React.ReactNode;
    currentPrice?: number;
    symbol?: string;
}

// Enhanced ChartArea component
const ChartArea: React.FC<ChartAreaProps> = ({ children, currentPrice = 45000, symbol = 'BTCUSDT' }) => {
    const [chartType, setChartType] = useState('candlestick');
    const [showGrid, setShowGrid] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [showIndicators, setShowIndicators] = useState(false);
    const [showOrderEntry, setShowOrderEntry] = useState(false);
    const [showMultiLayout, setShowMultiLayout] = useState(false);

    const handleToggleIndicator = (indicatorId: string) => {
        console.log('Toggle indicator:', indicatorId);
        // This would integrate with your existing indicator system
    };

    const handleLayoutChange = (layout: any) => {
        console.log('Layout changed:', layout);
        setShowMultiLayout(false);
        // This would implement the actual layout change
    };

    return (
        <div className="flex-grow bg-gray-900 p-1 relative flex flex-col">
            <div className="flex-grow flex items-center justify-center text-gray-500 border border-gray-700/50 rounded-lg relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                <ChartToolbar 
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                    showGrid={showGrid}
                    onToggleGrid={() => setShowGrid(!showGrid)}
                    isLocked={isLocked}
                    onToggleLock={() => setIsLocked(!isLocked)}
                    onShowIndicators={() => setShowIndicators(true)}
                    onShowOrderEntry={() => setShowOrderEntry(true)}
                    onShowMultiLayout={() => setShowMultiLayout(true)}
                />
                
                {/* Chart Content */}
                <div className="w-full h-full">
                    {children}
                </div>
                
                {/* Bottom Right Chart Controls */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-1 z-10">
                    <button
                        className="bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 p-2 rounded-lg border border-gray-600/50 transition-all"
                        title="Take Screenshot"
                    >
                        <Camera className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                        className="bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 p-2 rounded-lg border border-gray-600/50 transition-all"
                        title="Download Data"
                    >
                        <Download className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                        className="bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 p-2 rounded-lg border border-gray-600/50 transition-all"
                        title="Chart Settings"
                    >
                        <Settings className="w-4 h-4 text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Advanced Panels */}
            <IndicatorsPanel
                isOpen={showIndicators}
                onClose={() => setShowIndicators(false)}
                onToggleIndicator={handleToggleIndicator}
                indicators={[]}
            />

            <OrderEntry
                isOpen={showOrderEntry}
                onClose={() => setShowOrderEntry(false)}
                currentPrice={currentPrice}
                symbol={symbol}
            />

            <MultiChartLayout
                isOpen={showMultiLayout}
                onClose={() => setShowMultiLayout(false)}
                currentSymbol={symbol}
                currentInterval="1h"
                onLayoutChange={handleLayoutChange}
            />
        </div>
    );
};

export default ChartArea;
