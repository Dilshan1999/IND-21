import React, { useState } from 'react';
import {
    Grid3X3, Square, Columns, Rows, Plus, X, Maximize2,
    Minimize2, RotateCcw, Settings, Copy, TrendingUp
} from 'lucide-react';

interface ChartLayout {
    id: string;
    type: '1x1' | '1x2' | '2x1' | '2x2' | '3x1' | '1x3';
    name: string;
    charts: ChartConfig[];
}

interface ChartConfig {
    id: string;
    symbol: string;
    interval: string;
    chartType: 'candlestick' | 'line' | 'area';
    indicators: string[];
}

interface MultiChartLayoutProps {
    isOpen: boolean;
    onClose: () => void;
    currentSymbol: string;
    currentInterval: string;
    onLayoutChange: (layout: ChartLayout) => void;
}

const MultiChartLayout: React.FC<MultiChartLayoutProps> = ({
    isOpen,
    onClose,
    currentSymbol,
    currentInterval,
    onLayoutChange
}) => {
    const [selectedLayout, setSelectedLayout] = useState<ChartLayout['type']>('2x2');
    const [layouts, setLayouts] = useState<ChartLayout[]>([
        {
            id: '1',
            type: '1x1',
            name: 'Single Chart',
            charts: [
                { id: '1', symbol: 'BTCUSDT', interval: '1h', chartType: 'candlestick', indicators: ['MA', 'RSI'] }
            ]
        },
        {
            id: '2',
            type: '2x2',
            name: 'Quad View',
            charts: [
                { id: '1', symbol: 'BTCUSDT', interval: '1h', chartType: 'candlestick', indicators: ['MA'] },
                { id: '2', symbol: 'ETHUSDT', interval: '1h', chartType: 'candlestick', indicators: ['RSI'] },
                { id: '3', symbol: 'ADAUSDT', interval: '15m', chartType: 'line', indicators: [] },
                { id: '4', symbol: 'DOTUSDT', interval: '4h', chartType: 'area', indicators: ['MACD'] }
            ]
        }
    ]);

    const layoutTemplates = [
        { type: '1x1' as const, name: 'Single', icon: Square, cols: 1, rows: 1 },
        { type: '1x2' as const, name: 'Side by Side', icon: Columns, cols: 2, rows: 1 },
        { type: '2x1' as const, name: 'Stacked', icon: Rows, cols: 1, rows: 2 },
        { type: '2x2' as const, name: 'Quad', icon: Grid3X3, cols: 2, rows: 2 },
        { type: '3x1' as const, name: 'Triple H', icon: Columns, cols: 3, rows: 1 },
        { type: '1x3' as const, name: 'Triple V', icon: Rows, cols: 1, rows: 3 },
    ];

    const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'BNBUSDT'];
    const intervals = ['1m', '5m', '15m', '1h', '4h', '1d'];

    const getChartsForLayout = (layoutType: ChartLayout['type']): number => {
        const template = layoutTemplates.find(t => t.type === layoutType);
        return template ? template.cols * template.rows : 1;
    };

    const createNewLayout = () => {
        const numCharts = getChartsForLayout(selectedLayout);
        const newCharts: ChartConfig[] = [];
        
        for (let i = 0; i < numCharts; i++) {
            newCharts.push({
                id: (i + 1).toString(),
                symbol: i < popularSymbols.length ? popularSymbols[i] : 'BTCUSDT',
                interval: currentInterval,
                chartType: 'candlestick',
                indicators: []
            });
        }

        const newLayout: ChartLayout = {
            id: Date.now().toString(),
            type: selectedLayout,
            name: `${layoutTemplates.find(t => t.type === selectedLayout)?.name} Layout`,
            charts: newCharts
        };

        setLayouts(prev => [...prev, newLayout]);
        onLayoutChange(newLayout);
    };

    const updateChartConfig = (layoutId: string, chartId: string, updates: Partial<ChartConfig>) => {
        setLayouts(prev => prev.map(layout => 
            layout.id === layoutId 
                ? {
                    ...layout,
                    charts: layout.charts.map(chart =>
                        chart.id === chartId ? { ...chart, ...updates } : chart
                    )
                }
                : layout
        ));
    };

    const deleteLayout = (layoutId: string) => {
        setLayouts(prev => prev.filter(layout => layout.id !== layoutId));
    };

    const renderLayoutPreview = (layout: ChartLayout) => {
        const template = layoutTemplates.find(t => t.type === layout.type);
        if (!template) return null;

        return (
            <div 
                className={`grid gap-1 h-20 w-full`}
                style={{ 
                    gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${template.rows}, 1fr)`
                }}
            >
                {layout.charts.map((chart, index) => (
                    <div 
                        key={chart.id}
                        className="bg-gray-700 rounded border border-gray-600 flex items-center justify-center"
                    >
                        <div className="text-center">
                            <div className="text-xs text-white font-medium">
                                {chart.symbol.replace('USDT', '')}
                            </div>
                            <div className="text-xs text-gray-400">{chart.interval}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-[1000px] h-[700px] border border-gray-700">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Chart Layouts</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex h-[calc(100%-60px)]">
                    
                    {/* Left Panel - Layout Templates */}
                    <div className="w-80 p-4 border-r border-gray-700">
                        <h4 className="text-white font-medium mb-4">Create New Layout</h4>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {layoutTemplates.map((template) => (
                                <button
                                    key={template.type}
                                    onClick={() => setSelectedLayout(template.type)}
                                    className={`p-3 rounded-lg border transition-colors ${
                                        selectedLayout === template.type
                                            ? 'border-blue-500 bg-blue-500/20'
                                            : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                >
                                    <template.icon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                    <div className="text-sm text-white">{template.name}</div>
                                    <div className="text-xs text-gray-400">
                                        {template.cols}×{template.rows}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={createNewLayout}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Layout</span>
                        </button>
                    </div>

                    {/* Right Panel - Saved Layouts */}
                    <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-medium">Saved Layouts</h4>
                            <span className="text-sm text-gray-400">{layouts.length} layouts</span>
                        </div>

                        <div className="space-y-4 max-h-[580px] overflow-y-auto">
                            {layouts.map((layout) => (
                                <div 
                                    key={layout.id}
                                    className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h5 className="text-white font-medium">{layout.name}</h5>
                                            <p className="text-sm text-gray-400">
                                                {layoutTemplates.find(t => t.type === layout.type)?.name} • {layout.charts.length} charts
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onLayoutChange(layout)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Apply
                                            </button>
                                            <button
                                                onClick={() => deleteLayout(layout.id)}
                                                className="text-gray-400 hover:text-red-400 p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Layout Preview */}
                                    <div className="mb-3">
                                        {renderLayoutPreview(layout)}
                                    </div>

                                    {/* Chart Configurations */}
                                    <div className="space-y-2">
                                        <h6 className="text-sm text-gray-400">Chart Settings</h6>
                                        {layout.charts.map((chart, index) => (
                                            <div 
                                                key={chart.id}
                                                className="flex items-center space-x-3 text-sm bg-gray-700 p-2 rounded"
                                            >
                                                <span className="text-gray-400 w-8">#{index + 1}</span>
                                                
                                                <select
                                                    value={chart.symbol}
                                                    onChange={(e) => updateChartConfig(layout.id, chart.id, { symbol: e.target.value })}
                                                    className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                                                >
                                                    {popularSymbols.map(symbol => (
                                                        <option key={symbol} value={symbol}>
                                                            {symbol.replace('USDT', '/USDT')}
                                                        </option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={chart.interval}
                                                    onChange={(e) => updateChartConfig(layout.id, chart.id, { interval: e.target.value })}
                                                    className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                                                >
                                                    {intervals.map(interval => (
                                                        <option key={interval} value={interval}>{interval}</option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={chart.chartType}
                                                    onChange={(e) => updateChartConfig(layout.id, chart.id, { chartType: e.target.value as any })}
                                                    className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                                                >
                                                    <option value="candlestick">Candles</option>
                                                    <option value="line">Line</option>
                                                    <option value="area">Area</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {layouts.length === 0 && (
                            <div className="text-center py-12">
                                <Grid3X3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No saved layouts</p>
                                <p className="text-sm text-gray-500">Create your first multi-chart layout</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiChartLayout;
