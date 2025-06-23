
import React, { useState, useEffect } from 'react';
import {
    List, AlertTriangle, Newspaper, Lightbulb, Grid, Zap, Calendar, Edit3,
    Plus, Filter, MoreHorizontal, TrendingUp, TrendingDown, Activity,
    Clock, Bell, Target, BarChart3, Users, Globe, Bookmark, 
    Search, Star, Eye, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import IconWrapper from './IconWrapper';
import { OHLCVData, Candle } from '../../types';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { formatPrice, formatPercentageChange } from '../../utils/priceFormatting';

interface RightSidebarProps {
    watchlistPairs: string[];
    currentSelectedPair: string;
    onSelectWatchlistPair: (pair: string) => void;
    watchlistPricesMap: Record<string, number>;
    watchlistChangesMap: Record<string, number>;
    latestOhlcvForPair: OHLCVData | null;
    fetchHistoricalKlineData: (pair: string, interval: string, limit?: number, endTime?: number) => Promise<Candle[]>;
    currentInterval: string;
}

const generateGeminiText = async (promptText: string): Promise<string> => {
    const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY)
        ? process.env.API_KEY
        : null;

    if (!apiKey) {
        console.warn("API_KEY is not available in process.env. AI features will be disabled.");
        return "AI features are disabled. API_KEY not configured.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey as string });
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: promptText,
        });
        
        const text = response.text;
        if (text) {
            let processedText = text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = processedText.match(fenceRegex);
            if (match && match[2]) {
              processedText = match[2].trim();
            }
            return processedText;
        } else {
            console.warn("Gemini API response was successful but contained no text:", response);
            return "AI service returned an empty response.";
        }
    } catch (error) {
        console.error("Error calling Gemini API via SDK:", error);
        let message = "Could not connect to AI service.";
        if (error instanceof Error) {
            message = error.message;
        }
        return `Error: ${message}`;
    }
};

const RightSidebar: React.FC<RightSidebarProps> = ({
    watchlistPairs, currentSelectedPair, onSelectWatchlistPair,
    watchlistPricesMap, watchlistChangesMap, latestOhlcvForPair,
    fetchHistoricalKlineData, currentInterval
}) => {
    const initialTabs = [
        { name: 'Symbol', icon: Search, color: 'text-blue-400' },
        { name: 'Watchlist', icon: List, color: 'text-green-400' }, 
        { name: 'Alerts', icon: AlertTriangle, color: 'text-orange-400' },
        { name: 'News', icon: Newspaper, color: 'text-purple-400' }, 
        { name: 'Sentiment ✨', icon: Lightbulb, color: 'text-yellow-400' },
        { name: 'Ideas', icon: Edit3, color: 'text-pink-400' },
        { name: 'Screener', icon: BarChart3, color: 'text-cyan-400' },
        { name: 'Calendar', icon: Calendar, color: 'text-indigo-400' },
    ];

    const [activeTab, setActiveTab] = useState(initialTabs[1].name); // Default to Watchlist
    const [newsSummary, setNewsSummary] = useState('');
    const [sentimentAnalysis, setSentimentAnalysis] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const apiKeyAvailable = !!(typeof process !== 'undefined' && process.env && process.env.API_KEY);
    const currentSymbolDisplay = currentSelectedPair.replace("USDT", "/USDT");

    // Filter watchlist based on search
    const filteredWatchlist = watchlistPairs.filter(pair => 
        pair.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mock market data
    const marketStats = {
        gainers: [
            { symbol: 'BTC/USDT', change: 5.67, price: 45234.56 },
            { symbol: 'ETH/USDT', change: 3.24, price: 3456.78 },
            { symbol: 'ADA/USDT', change: 8.91, price: 1.23 },
        ],
        losers: [
            { symbol: 'SOL/USDT', change: -2.34, price: 123.45 },
            { symbol: 'DOT/USDT', change: -1.67, price: 67.89 },
            { symbol: 'LINK/USDT', change: -0.89, price: 23.45 },
        ],
        volume: [
            { symbol: 'BTC/USDT', volume: '2.4B', change: 12.5 },
            { symbol: 'ETH/USDT', volume: '1.8B', change: 8.3 },
            { symbol: 'BNB/USDT', volume: '890M', change: -3.2 },
        ]
    };

    const handleSummarizeNews = async () => {
        if (!apiKeyAvailable) return;
        setIsLoadingSummary(true); 
        setNewsSummary('');
        
        const candles = await fetchHistoricalKlineData(currentSelectedPair, currentInterval, 20);
        const candleContext = candles.slice(-5).map(c => `Time: ${c.t.toLocaleTimeString()}, Close: ${c.c}, Vol: ${c.v}`).join('; ');
        
        const prompt = `You are a financial news summarizer for a trading dashboard.
        Summarize recent hypothetical news for ${currentSymbolDisplay} based on the following recent (mock) price action: ${candleContext}.
        Focus on key takeaways for a trader in 2-3 concise sentences. Example news could be about market volatility, regulatory updates, or adoption milestones.
        Keep the summary factual and neutral.`;
        
        const summary = await generateGeminiText(prompt);
        setNewsSummary(summary);
        setIsLoadingSummary(false);
    };

    const handleAnalyzeSentiment = async () => {
        if (!apiKeyAvailable) return;
        setIsLoadingSentiment(true); 
        setSentimentAnalysis('');
        
        const candles = await fetchHistoricalKlineData(currentSelectedPair, currentInterval, 10);
        const priceTrend = candles.length > 1 ? (candles[candles.length-1].c > candles[0].c ? "upward" : "downward") : "stable";

        const prompt = `You are a market sentiment analyst for a trading dashboard.
        Provide a brief market sentiment analysis (e.g., bullish, bearish, neutral with concise reasons) for ${currentSymbolDisplay}.
        Consider a hypothetical scenario: recent price trend is ${priceTrend}, general crypto market news is mixed with some positive adoption news offset by minor regulatory FUD.
        Keep the analysis very concise (1-2 sentences) for the dashboard.`;
        
        const analysis = await generateGeminiText(prompt);
        setSentimentAnalysis(analysis);
        setIsLoadingSentiment(false);
    };

    const formatChange = formatPercentageChange;

    return (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col text-gray-300">
            {/* Header */}
            <div className="p-3 flex justify-between items-center border-b border-gray-700 h-12">
                <span className="font-semibold text-white">{activeTab}</span>
                <div className="flex items-center space-x-1">
                    <IconWrapper icon={Plus} tooltip="Add Widget" className="p-1.5 hover:bg-gray-700 rounded-md" />
                    <IconWrapper icon={Filter} tooltip="Filter" className="p-1.5 hover:bg-gray-700 rounded-md" />
                    <IconWrapper icon={MoreHorizontal} tooltip="More Options" className="p-1.5 hover:bg-gray-700 rounded-md" />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="p-2 border-b border-gray-700 flex flex-wrap gap-1">
                {initialTabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        title={tab.name}
                        className={`p-2 rounded-lg flex items-center space-x-1.5 text-xs transition-all
                            ${activeTab === tab.name ? 'bg-gray-700 ' + tab.color : 'hover:bg-gray-600 text-gray-400'}`}
                        aria-pressed={activeTab === tab.name}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="whitespace-nowrap hidden lg:block">{tab.name.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto scrollbar-thin">
                {activeTab === 'Symbol' && (
                    <div className="p-3 space-y-4">
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Search symbols..."
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <button className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">Crypto</button>
                                <button className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">Forex</button>
                                <button className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">Stocks</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-200">Popular Symbols</h4>
                            {filteredWatchlist.slice(0, 8).map(pair => {
                                const price = watchlistPricesMap[pair];
                                const change = watchlistChangesMap[pair];
                                return (
                                    <div 
                                        key={pair}
                                        onClick={() => onSelectWatchlistPair(pair)}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
                                    >
                                        <span className="font-medium">{pair.replace("USDT", "/USDT")}</span>
                                        <div className="text-right">
                                            <div className="text-sm">{formatPrice(price)}</div>
                                            <div className={`text-xs ${change && change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {formatChange(change)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'Watchlist' && (
                    <div className="p-3 space-y-3">
                        {/* Market Overview */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-gray-700/50 p-2 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-gray-400">Gainers</span>
                                </div>
                                <div className="text-lg font-bold text-green-400">24</div>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                    <span className="text-xs text-gray-400">Losers</span>
                                </div>
                                <div className="text-lg font-bold text-red-400">18</div>
                            </div>
                        </div>

                        {/* Watchlist Header */}
                        <div className="flex items-center justify-between text-xs text-gray-400 px-1 py-1 border-b border-gray-600">
                            <span>Symbol</span> 
                            <div className="flex space-x-6">
                                <span>Last</span>
                                <span>Chg%</span>
                            </div>
                        </div>

                        {/* Watchlist Items */}
                        <div className="space-y-1">
                            {watchlistPairs.map(pair => {
                                const price = watchlistPricesMap[pair];
                                const change = watchlistChangesMap[pair];
                                const isSelected = currentSelectedPair === pair;
                                return (
                                    <div 
                                        key={pair} 
                                        onClick={() => onSelectWatchlistPair(pair)}
                                        className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors border-l-2
                                            ${isSelected ? 'bg-gray-700 border-blue-500' : 'border-transparent'}`}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span className={`font-medium ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                                                {pair.replace("USDT","/USDT")}
                                            </span>
                                            {Math.random() > 0.7 && <Star className="w-3 h-3 text-yellow-400" />}
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <span className="text-gray-200">{formatPrice(price)}</span>
                                            <span className={`font-medium min-w-16 text-right ${change === undefined ? '' : (change >= 0 ? 'text-green-400' : 'text-red-400')}`}>
                                                {formatChange(change)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'Screener' && (
                    <div className="p-3 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-green-400 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Top Gainers
                                </h4>
                                {marketStats.gainers.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-green-500/10 rounded-lg">
                                        <span className="text-sm font-medium">{item.symbol}</span>
                                        <div className="text-right">
                                            <div className="text-sm">{formatPrice(item.price)}</div>
                                            <div className="text-xs text-green-400">+{item.change}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-red-400 flex items-center">
                                    <TrendingDown className="w-4 h-4 mr-2" />
                                    Top Losers
                                </h4>
                                {marketStats.losers.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-red-500/10 rounded-lg">
                                        <span className="text-sm font-medium">{item.symbol}</span>
                                        <div className="text-right">
                                            <div className="text-sm">{formatPrice(item.price)}</div>
                                            <div className="text-xs text-red-400">{item.change}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-blue-400 flex items-center">
                                    <Activity className="w-4 h-4 mr-2" />
                                    High Volume
                                </h4>
                                {marketStats.volume.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-blue-500/10 rounded-lg">
                                        <span className="text-sm font-medium">{item.symbol}</span>
                                        <div className="text-right">
                                            <div className="text-sm">{item.volume}</div>
                                            <div className={`text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {item.change >= 0 ? '+' : ''}{item.change}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'News' && (
                    <div className="p-3 space-y-4">
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-100">Market News for {currentSymbolDisplay}</h3>
                            <button
                                onClick={handleSummarizeNews}
                                disabled={isLoadingSummary || !apiKeyAvailable}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm flex items-center justify-center disabled:opacity-50 font-medium transition-colors"
                            >
                                {isLoadingSummary ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Newspaper className="w-4 h-4 mr-2" />
                                )}
                                Generate News Summary
                            </button>
                            {!apiKeyAvailable && (
                                <p className="text-xs text-yellow-400 text-center bg-yellow-400/10 p-2 rounded-lg">
                                    AI features disabled. API Key not configured.
                                </p>
                            )}
                            {isLoadingSummary && <p className="text-xs text-gray-400 text-center">Generating summary...</p>}
                            {newsSummary && (
                                <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm text-gray-200 whitespace-pre-wrap border-l-4 border-blue-500">
                                    {newsSummary}
                                </div>
                            )}
                        </div>

                        {/* Mock news items */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-300">Recent Headlines</h4>
                            {[
                                { title: "Bitcoin ETF sees record inflows", time: "2h ago", source: "CryptoNews" },
                                { title: "Ethereum upgrade scheduled for Q2", time: "4h ago", source: "ETH Today" },
                                { title: "Major exchange announces new features", time: "6h ago", source: "Trading News" },
                            ].map((news, idx) => (
                                <div key={idx} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                                    <h5 className="text-sm font-medium text-white mb-1">{news.title}</h5>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>{news.source}</span>
                                        <span>{news.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'Sentiment ✨' && (
                    <div className="p-3 space-y-4">
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-100">Market Sentiment for {currentSymbolDisplay}</h3>
                            <button
                                onClick={handleAnalyzeSentiment}
                                disabled={isLoadingSentiment || !apiKeyAvailable}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm flex items-center justify-center disabled:opacity-50 font-medium transition-colors"
                            >
                                {isLoadingSentiment ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                )}
                                Analyze Sentiment
                            </button>
                            {!apiKeyAvailable && (
                                <p className="text-xs text-yellow-400 text-center bg-yellow-400/10 p-2 rounded-lg">
                                    AI features disabled. API Key not configured.
                                </p>
                            )}
                            {isLoadingSentiment && <p className="text-xs text-gray-400 text-center">Analyzing sentiment...</p>}
                            {sentimentAnalysis && (
                                <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm text-gray-200 whitespace-pre-wrap border-l-4 border-teal-500">
                                    {sentimentAnalysis}
                                </div>
                            )}
                        </div>

                        {/* Sentiment indicators */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-300">Sentiment Indicators</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-500/20 p-3 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-green-400">72%</div>
                                    <div className="text-xs text-gray-400">Fear & Greed</div>
                                </div>
                                <div className="bg-blue-500/20 p-3 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-400">+15%</div>
                                    <div className="text-xs text-gray-400">Social Volume</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Alerts' && (
                    <div className="p-3 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-100">Price Alerts</h3>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {[
                                { symbol: 'BTC/USDT', condition: '> $50,000', status: 'active' },
                                { symbol: 'ETH/USDT', condition: '< $3,000', status: 'triggered' },
                                { symbol: 'ADA/USDT', condition: '> $1.50', status: 'active' },
                            ].map((alert, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                                    alert.status === 'triggered' ? 'bg-orange-500/10 border-orange-500' : 'bg-gray-700/50 border-gray-600'
                                }`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{alert.symbol}</div>
                                            <div className="text-sm text-gray-400">{alert.condition}</div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-full ${
                                            alert.status === 'triggered' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'
                                        }`}>
                                            {alert.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other tabs placeholder */}
                {!['Symbol', 'Watchlist', 'News', 'Sentiment ✨', 'Alerts', 'Screener'].includes(activeTab) && (
                    <div className="p-6 text-center text-gray-500">
                        <div className="text-4xl mb-2">🚧</div>
                        <div className="text-lg font-medium">Coming Soon</div>
                        <div className="text-sm mt-1">Content for {activeTab} will be available soon</div>
                    </div>
                )}
            </div>

            {/* Footer with current symbol info */}
            {latestOhlcvForPair && latestOhlcvForPair.pair === currentSelectedPair && (
                <div className="border-t border-gray-700 p-3 bg-gray-800/50">
                    <div className="text-sm font-semibold mb-1">{currentSymbolDisplay} PERPETUAL</div>
                    <div className="text-xs text-gray-400 mb-2">CONTRACT - BINANCE</div>
                    <div className="flex items-baseline mb-1">
                        <span className="text-xl font-bold text-white">{formatPrice(latestOhlcvForPair.close)}</span>
                        <span className="text-xs ml-1 text-gray-400">USD</span>
                    </div>
                    <div className={`text-xs flex items-center space-x-1 ${
                        latestOhlcvForPair.change === undefined ? '' : 
                        (latestOhlcvForPair.change >= 0 ? 'text-green-400' : 'text-red-400')
                    }`}>
                        {latestOhlcvForPair.change !== undefined && (
                            <>
                                {latestOhlcvForPair.change >= 0 ? 
                                    <ArrowUpRight className="w-3 h-3" /> : 
                                    <ArrowDownRight className="w-3 h-3" />
                                }
                                <span>
                                    {latestOhlcvForPair.changeAbsolute ? 
                                        `${latestOhlcvForPair.changeAbsolute >= 0 ? '+' : ''}${formatPrice(latestOhlcvForPair.changeAbsolute)}` : 
                                        ''
                                    } ({formatChange(latestOhlcvForPair.change)})
                                </span>
                            </>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Market data • Real-time</div>
                </div>
            )}
        </div>
    );
};

export default RightSidebar;
