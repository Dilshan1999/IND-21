import React, { useState } from 'react';
import {
    Activity, TrendingUp, BarChart3, PieChart, Zap, Target,
    Plus, Search, Star, Settings, Eye, EyeOff, X, ChevronDown
} from 'lucide-react';
import IconWrapper from './IconWrapper';

interface Indicator {
    id: string;
    name: string;
    category: string;
    enabled: boolean;
    settings: Record<string, any>;
    popular: boolean;
}

interface IndicatorsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onToggleIndicator: (indicatorId: string) => void;
    indicators: Indicator[];
}

const IndicatorsPanel: React.FC<IndicatorsPanelProps> = ({
    isOpen,
    onClose,
    onToggleIndicator,
    indicators
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Popular');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Popular']));

    const categories = [
        { name: 'Popular', icon: Star, count: 12 },
        { name: 'Trend', icon: TrendingUp, count: 8 },
        { name: 'Oscillators', icon: Activity, count: 15 },
        { name: 'Volume', icon: BarChart3, count: 6 },
        { name: 'Volatility', icon: Zap, count: 5 },
        { name: 'Bill Williams', icon: Target, count: 7 },
        { name: 'Custom', icon: Settings, count: 3 }
    ];

    const mockIndicators: Indicator[] = [
        { id: 'ma', name: 'Moving Average', category: 'Popular', enabled: true, settings: { period: 20 }, popular: true },
        { id: 'bb', name: 'Bollinger Bands', category: 'Popular', enabled: false, settings: { period: 20, deviation: 2 }, popular: true },
        { id: 'rsi', name: 'RSI', category: 'Oscillators', enabled: true, settings: { period: 14 }, popular: true },
        { id: 'macd', name: 'MACD', category: 'Trend', enabled: false, settings: { fast: 12, slow: 26, signal: 9 }, popular: true },
        { id: 'ema', name: 'EMA', category: 'Trend', enabled: false, settings: { period: 20 }, popular: true },
        { id: 'stoch', name: 'Stochastic', category: 'Oscillators', enabled: false, settings: { k: 14, d: 3 }, popular: false },
        { id: 'vol', name: 'Volume', category: 'Volume', enabled: true, settings: {}, popular: true },
        { id: 'atr', name: 'ATR', category: 'Volatility', enabled: false, settings: { period: 14 }, popular: false },
        { id: 'adx', name: 'ADX', category: 'Trend', enabled: false, settings: { period: 14 }, popular: false },
        { id: 'cci', name: 'CCI', category: 'Oscillators', enabled: false, settings: { period: 20 }, popular: false },
        { id: 'williams', name: 'Williams %R', category: 'Oscillators', enabled: false, settings: { period: 14 }, popular: false },
        { id: 'obv', name: 'OBV', category: 'Volume', enabled: false, settings: {}, popular: false }
    ];

    const filteredIndicators = mockIndicators.filter(indicator => {
        const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'Popular' 
            ? indicator.popular 
            : indicator.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleCategory = (categoryName: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryName)) {
            newExpanded.delete(categoryName);
        } else {
            newExpanded.add(categoryName);
        }
        setExpandedCategories(newExpanded);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-[800px] h-[600px] flex border border-gray-700">
                {/* Left sidebar - Categories */}
                <div className="w-64 bg-gray-800 rounded-l-lg p-4 border-r border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Indicators</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search indicators..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-1">
                        {categories.map((category) => (
                            <div key={category.name}>
                                <button
                                    onClick={() => setActiveCategory(category.name)}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                                        activeCategory === category.name 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <category.icon className="w-4 h-4" />
                                        <span className="text-sm">{category.name}</span>
                                    </div>
                                    <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                                        {category.count}
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right content - Indicators list */}
                <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">
                            {activeCategory} Indicators
                        </h4>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">
                                {filteredIndicators.length} indicators
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[480px] overflow-y-auto">
                        {filteredIndicators.map((indicator) => (
                            <div
                                key={indicator.id}
                                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h5 className="text-white font-medium">{indicator.name}</h5>
                                        <p className="text-sm text-gray-400">{indicator.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {indicator.popular && (
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    )}
                                    
                                    <button
                                        onClick={() => {/* Settings */}}
                                        className="text-gray-400 hover:text-white p-1 rounded"
                                        title="Settings"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => onToggleIndicator(indicator.id)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            indicator.enabled 
                                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                        title={indicator.enabled ? 'Remove' : 'Add'}
                                    >
                                        {indicator.enabled ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredIndicators.length === 0 && (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No indicators found</p>
                            <p className="text-sm text-gray-500">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IndicatorsPanel;
