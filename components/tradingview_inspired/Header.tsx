import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown, BarChart2, AlertTriangle, Play, Settings2, Maximize2, Share2, Sun, Moon, SlidersHorizontal, LayoutDashboard,
    Undo as UndoIconLucide, Redo as RedoIconLucide, PieChart, Activity, Target, TrendingUp, Palette
} from 'lucide-react';
import IconWrapper from './IconWrapper';
import PerformanceAnalytics from './PerformanceAnalytics';
import ThemeManager from './ThemeManager';
import { OHLCVData, Theme as AppTheme, TimeframeDefinition } from '../../types';

interface HeaderProps {
    selectedPair: string;
    onSelectPair: (pair: string) => void;
    pairsList: string[];
    selectedInterval: string;
    onSelectInterval: (interval: string) => void;
    quickIntervalsList: string[];
    detailedTimeframesList: TimeframeDefinition[];
    onToggleIndicatorModal: () => void;
    currentTheme: AppTheme;
    onToggleTheme: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const Header: React.FC<HeaderProps> = ({
    selectedPair, onSelectPair, pairsList,
    selectedInterval, onSelectInterval, quickIntervalsList, detailedTimeframesList,
    onToggleIndicatorModal,
    currentTheme, onToggleTheme,
    onUndo, onRedo, canUndo, canRedo
}) => {
    const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
    const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
    const [showPerformanceAnalytics, setShowPerformanceAnalytics] = useState(false);
    const [showThemeManager, setShowThemeManager] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const pairDropdownRef = useRef<HTMLDivElement>(null);
    const timeframeDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pairDropdownRef.current && !pairDropdownRef.current.contains(event.target as Node)) setIsPairDropdownOpen(false);
            if (timeframeDropdownRef.current && !timeframeDropdownRef.current.contains(event.target as Node)) setIsTimeframeDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentIntervalDef = detailedTimeframesList.find(tf => tf.value === selectedInterval);
    const currentIntervalLabel = currentIntervalDef?.label || selectedInterval;
    
    // OHLC data formatting functions removed

    return (
        <div className="bg-gray-800 text-gray-200 p-2 flex items-center justify-between border-b border-gray-700 h-12">
            {/* Left Section: Pair, Timeframes, Indicators, Replay */}
            <div className="flex items-center space-x-2">
                {/* Pair Selector */}
                <div ref={pairDropdownRef} className="relative">                
                    <button
                        onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
                        className="flex items-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md transition-colors border border-gray-600 hover:border-gray-500"
                        aria-expanded={isPairDropdownOpen}
                        aria-haspopup="true"
                        aria-label={`Selected pair: ${selectedPair.replace("USDT", "/USDT")}, click to change`}
                    >
                        <span className="font-semibold text-white">{selectedPair.replace("USDT", "/USDT")}</span>
                        <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                    </button>
                    {isPairDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                            <div className="p-3 border-b border-gray-700">
                                <input 
                                    type="text" 
                                    placeholder="Search symbols..."
                                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="py-2">
                                {pairsList.filter(pair => pair.toLowerCase().includes(searchTerm.toLowerCase())).map(pair => (
                                    <button
                                        key={pair}
                                        onClick={() => { onSelectPair(pair); setIsPairDropdownOpen(false); }}
                                        className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors
                                            ${selectedPair === pair ? 'bg-blue-600 text-white font-medium' : 'text-gray-300'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{pair.replace("USDT", "/USDT")}</span>
                                            <span className="text-xs text-gray-400">BINANCE</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Timeframe Quick Select & Dropdown */}
                <div ref={timeframeDropdownRef} className="relative">
                     <button
                        onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                        className="px-2.5 py-1.5 text-xs rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        title={`Current timeframe: ${currentIntervalLabel}`}
                        aria-label={`Current timeframe: ${currentIntervalLabel}, click to change`}
                        aria-expanded={isTimeframeDropdownOpen}
                        aria-haspopup="true"
                    >
                        <span>{currentIntervalLabel}</span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                    {isTimeframeDropdownOpen && (
                         <div className="absolute left-0 mt-1 w-56 bg-gray-750 border border-gray-600 rounded-md shadow-lg z-50 max-h-72 overflow-y-auto scrollbar-thin">
                            {Object.entries(detailedTimeframesList.reduce((acc, tf) => {
                                (acc[tf.category] = acc[tf.category] || []).push(tf);
                                return acc;
                            }, {} as Record<TimeframeDefinition['category'], TimeframeDefinition[]>)).map(([category, tfs]) => (
                                <div key={category} className="py-1">
                                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{category}</div>
                                {tfs.map(tf => (
                                    <button
                                    key={tf.value}
                                    onClick={() => { onSelectInterval(tf.value); setIsTimeframeDropdownOpen(false); }}
                                    className={`block w-full text-left px-3 py-1.5 text-sm 
                                        ${selectedInterval === tf.value 
                                        ? 'bg-blue-600 text-white font-medium' 
                                        : 'hover:bg-gray-600'} 
                                    `}
                                    >
                                    {tf.label}
                                    </button>
                                ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {quickIntervalsList.map(intervalVal => (
                    <button
                        key={intervalVal}
                        onClick={() => onSelectInterval(intervalVal)}
                        className={`px-2.5 py-1.5 text-xs rounded-md disabled:opacity-50 disabled:cursor-not-allowed
                            ${selectedInterval === intervalVal ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                        title={detailedTimeframesList.find(tf => tf.value === intervalVal)?.label || intervalVal}
                         aria-label={`Select timeframe ${detailedTimeframesList.find(tf => tf.value === intervalVal)?.label || intervalVal}`}
                    >
                        {intervalVal}
                    </button>
                ))}

                <div className="h-6 border-l border-gray-600 mx-1"></div>
                <IconWrapper icon={BarChart2} tooltip="Indicators" onClick={onToggleIndicatorModal} className="p-1.5 hover:bg-gray-700 rounded-md" />
                <IconWrapper icon={SlidersHorizontal} tooltip="Indicator Templates (Not Implemented)" className="p-1.5 hover:bg-gray-700 rounded-md" />
                <IconWrapper icon={AlertTriangle} tooltip="Create Alert (Not Implemented)" className="p-1.5 hover:bg-gray-700 rounded-md" />
                <IconWrapper icon={PieChart} tooltip="Performance Analytics" onClick={() => setShowPerformanceAnalytics(true)} className="p-1.5 hover:bg-gray-700 rounded-md" />
                <IconWrapper icon={UndoIconLucide} tooltip="Undo Drawing" onClick={onUndo} className="p-1.5 hover:bg-gray-700 rounded-md" disabled={!canUndo}/>
                <IconWrapper icon={RedoIconLucide} tooltip="Redo Drawing" onClick={onRedo} className="p-1.5 hover:bg-gray-700 rounded-md" disabled={!canRedo}/>
                <IconWrapper 
                    icon={showPerformanceAnalytics ? TrendingUp : PieChart} 
                    tooltip={showPerformanceAnalytics ? "Hide Performance Analytics" : "Show Performance Analytics"} 
                    onClick={() => setShowPerformanceAnalytics(!showPerformanceAnalytics)} 
                    className="p-1.5 hover:bg-gray-700 rounded-md"
                />
            </div>

            {/* Center Section: OHLC Data or Replay Message removed */}

            {/* Right Section: Layout, Settings, Fullscreen, Snapshot, Publish */}
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    defaultValue="Unnamed"
                    className="bg-gray-700 text-center text-sm px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-40"
                    aria-label="Layout name"
                />
                <IconWrapper icon={LayoutDashboard} tooltip="Layouts (Not Implemented)" className="p-1.5 hover:bg-gray-700 rounded-md"/>
                <IconWrapper icon={Settings2} tooltip="Chart Settings (Not Implemented)" className="p-1.5 hover:bg-gray-700 rounded-md"/>
                <IconWrapper icon={Maximize2} tooltip="Fullscreen mode (Not Implemented)" className="p-1.5 hover:bg-gray-700 rounded-md"/>
                <IconWrapper icon={Share2} tooltip="Take a snapshot (Not Implemented)" className="p-1.5 hover:bg-gray-700 rounded-md"/>
                <IconWrapper 
                    icon={Palette} 
                    tooltip="Theme Manager" 
                    onClick={() => setShowThemeManager(true)} 
                    className="p-1.5 hover:bg-gray-700 rounded-md"
                />
                <IconWrapper 
                    icon={currentTheme === 'dark' ? Sun : Moon} 
                    tooltip={currentTheme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"} 
                    onClick={onToggleTheme} 
                    className="p-1.5 hover:bg-gray-700 rounded-md"
                />
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 sm:px-4 py-1.5 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Publish chart (Not Implemented)"
                >
                    Publish
                </button>
            </div>

            {/* Performance Analytics Modal */}
            <PerformanceAnalytics
                isOpen={showPerformanceAnalytics}
                onClose={() => setShowPerformanceAnalytics(false)}
                trades={[]}
            />

            {/* Theme Manager Modal */}
            <ThemeManager
                isOpen={showThemeManager}
                onClose={() => setShowThemeManager(false)}
                currentTheme={currentTheme}
                onThemeChange={onToggleTheme}
            />
        </div>
    );
};

export default Header;
