import React, { useState } from 'react';
import {
    Palette, Monitor, Sun, Moon, Sunset, Eye, EyeOff, Zap,
    Paintbrush, RotateCcw, Download, Upload, Star, Sparkles
} from 'lucide-react';
import { Theme as AppTheme } from '../../types';
import { formatPriceWithCurrency, formatPercentageChange, formatVolume } from '../../utils/priceFormatting';

interface ThemeColors {
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    bull: string;
    bear: string;
    volume: string;
    grid: string;
}

interface Theme {
    id: string;
    name: string;
    description: string;
    colors: ThemeColors;
    category: 'default' | 'dark' | 'light' | 'colorful' | 'custom';
    premium?: boolean;
}

interface ThemeManagerProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: AppTheme;
    onThemeChange: () => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({
    isOpen,
    onClose,
    currentTheme,
    onThemeChange
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('default');
    const [customColors, setCustomColors] = useState<ThemeColors>({
        background: '#1a1a1a',
        surface: '#2d2d2d',
        surfaceHover: '#404040',
        border: '#525252',
        text: '#ffffff',
        textSecondary: '#a1a1aa',
        accent: '#3b82f6',
        accentHover: '#2563eb',
        bull: '#10b981',
        bear: '#ef4444',
        volume: '#8b5cf6',
        grid: '#374151'
    });

    const predefinedThemes: Theme[] = [        {
            id: 'professional-dark',
            name: 'Professional Dark',
            description: 'Classic dark theme for trading',
            category: 'default',
            colors: {
                background: '#131722',
                surface: '#1e222d',
                surfaceHover: '#2a2e39',
                border: '#363a45',
                text: '#d1d4dc',
                textSecondary: '#787b86',
                accent: '#2962ff',
                accentHover: '#1e53e5',
                bull: '#26a69a',
                bear: '#ef5350',
                volume: '#2962ff',
                grid: '#363a45'
            }
        },        {
            id: 'professional-light',
            name: 'Professional Light',
            description: 'Clean light theme for day trading',
            category: 'light',
            colors: {
                background: '#ffffff',
                surface: '#f7f8fa',
                surfaceHover: '#f0f3fa',
                border: '#e0e3eb',
                text: '#2a2e39',
                textSecondary: '#6a7187',
                accent: '#2962ff',
                accentHover: '#1e53e5',
                bull: '#00897b',
                bear: '#f23645',
                volume: '#9598a1',
                grid: '#e0e3eb'
            }
        },
        {
            id: 'midnight-pro',
            name: 'Midnight Pro',
            description: 'Deep black professional theme',
            category: 'dark',
            premium: true,
            colors: {
                background: '#0a0a0a',
                surface: '#1a1a1a',
                surfaceHover: '#2a2a2a',
                border: '#3a3a3a',
                text: '#ffffff',
                textSecondary: '#a0a0a0',
                accent: '#00d4aa',
                accentHover: '#00c49a',
                bull: '#00ff88',
                bear: '#ff4757',
                volume: '#7f8fa6',
                grid: '#2a2a2a'
            }
        },
        {
            id: 'cyber-neon',
            name: 'Cyber Neon',
            description: 'Futuristic neon-inspired theme',
            category: 'colorful',
            premium: true,
            colors: {
                background: '#0f0f23',
                surface: '#1a1a3a',
                surfaceHover: '#252550',
                border: '#3d3d7a',
                text: '#e0e0ff',
                textSecondary: '#8080ff',
                accent: '#00ffff',
                accentHover: '#00e6e6',
                bull: '#39ff14',
                bear: '#ff1744',
                volume: '#ff006e',
                grid: '#2d2d5a'
            }
        },
        {
            id: 'forest-green',
            name: 'Forest Green',
            description: 'Nature-inspired green theme',
            category: 'colorful',
            colors: {
                background: '#0d1b0d',
                surface: '#1a2e1a',
                surfaceHover: '#234023',
                border: '#2d4f2d',
                text: '#e8f5e8',
                textSecondary: '#90c490',
                accent: '#4caf50',
                accentHover: '#43a047',
                bull: '#66bb6a',
                bear: '#ef5350',
                volume: '#81c784',
                grid: '#2d4f2d'
            }
        },
        {
            id: 'golden-hour',
            name: 'Golden Hour',
            description: 'Warm sunset-inspired theme',
            category: 'colorful',
            colors: {
                background: '#1a1612',
                surface: '#2d2720',
                surfaceHover: '#3d3528',
                border: '#4d4238',
                text: '#fff8e1',
                textSecondary: '#dcc48a',
                accent: '#ff9800',
                accentHover: '#f57c00',
                bull: '#4caf50',
                bear: '#f44336',
                volume: '#ffc107',
                grid: '#3d3528'
            }
        }
    ];

    const categories = [
        { id: 'default', name: 'Default', icon: Monitor },
        { id: 'dark', name: 'Dark', icon: Moon },
        { id: 'light', name: 'Light', icon: Sun },
        { id: 'colorful', name: 'Colorful', icon: Sparkles },
        { id: 'custom', name: 'Custom', icon: Paintbrush }
    ];

    const filteredThemes = predefinedThemes.filter(theme => 
        selectedCategory === 'default' || theme.category === selectedCategory
    );    const isThemeActive = (themeId: string): boolean => {        if (themeId === 'professional-dark' && currentTheme === 'dark') return true;
        if (themeId === 'professional-light' && currentTheme === 'light') return true;
        if (themeId.includes('light') && currentTheme === 'light') return true;
        if (!themeId.includes('light') && themeId !== 'tradingview-light' && currentTheme === 'dark') return true;
        return false;
    };

    const handleThemeSelect = (themeId: string) => {
        // For now, we'll map complex theme IDs to the simple dark/light system
        if (themeId === 'tradingview-light' || themeId.includes('light')) {
            if (currentTheme === 'dark') {
                onThemeChange(); // Toggle to light
            }
        } else {
            if (currentTheme === 'light') {
                onThemeChange(); // Toggle to dark
            }
        }
    };

    const createCustomTheme = () => {
        // For custom themes, we'll default to dark mode for now
        if (currentTheme === 'light') {
            onThemeChange();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-[1000px] h-[700px] border border-gray-700">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <Palette className="w-6 h-6 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Theme Manager</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-white p-2 rounded" title="Import Theme">
                            <Upload className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white p-2 rounded" title="Export Theme">
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1 rounded"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(100%-60px)]">
                    
                    {/* Left Panel - Categories */}
                    <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
                        <h4 className="text-white font-medium mb-4">Categories</h4>
                        
                        <div className="space-y-1">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                                        selectedCategory === category.id 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <category.icon className="w-5 h-5" />
                                    <span>{category.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Theme Preview */}
                        <div className="mt-6">
                            <h5 className="text-sm text-gray-400 mb-3">Preview</h5>                            <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-green-400 text-sm">BTC/USDT</span>
                                    <span className="text-white text-sm font-mono">{formatPriceWithCurrency(45234.6)}</span>
                                </div>
                                <div className="w-full h-20 bg-gradient-to-r from-green-500/20 to-red-500/20 rounded mb-2"></div>                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>24h: {formatPercentageChange(2.34)}</span>
                                    <span>Vol: {formatVolume(1200000)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Themes */}
                    <div className="flex-1 p-4">
                        
                        {selectedCategory === 'custom' ? (
                            /* Custom Theme Editor */
                            <div>
                                <h4 className="text-white font-medium mb-4">Custom Theme Editor</h4>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h5 className="text-gray-300 font-medium">Base Colors</h5>
                                        {Object.entries(customColors).slice(0, 6).map(([key, value]) => (
                                            <div key={key} className="flex items-center space-x-3">
                                                <label className="text-sm text-gray-400 w-24 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                                <input
                                                    type="color"
                                                    value={value}
                                                    onChange={(e) => setCustomColors(prev => ({
                                                        ...prev,
                                                        [key]: e.target.value
                                                    }))}
                                                    className="w-12 h-8 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => setCustomColors(prev => ({
                                                        ...prev,
                                                        [key]: e.target.value
                                                    }))}
                                                    className="bg-gray-700 text-white px-2 py-1 rounded text-sm flex-1"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h5 className="text-gray-300 font-medium">Accent Colors</h5>
                                        {Object.entries(customColors).slice(6).map(([key, value]) => (
                                            <div key={key} className="flex items-center space-x-3">
                                                <label className="text-sm text-gray-400 w-24 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                                <input
                                                    type="color"
                                                    value={value}
                                                    onChange={(e) => setCustomColors(prev => ({
                                                        ...prev,
                                                        [key]: e.target.value
                                                    }))}
                                                    className="w-12 h-8 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => setCustomColors(prev => ({
                                                        ...prev,
                                                        [key]: e.target.value
                                                    }))}
                                                    className="bg-gray-700 text-white px-2 py-1 rounded text-sm flex-1"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex space-x-3">
                                    <button
                                        onClick={createCustomTheme}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        Apply Custom Theme
                                    </button>
                                    <button
                                        onClick={() => setCustomColors(predefinedThemes[0].colors)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Reset</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Predefined Themes */
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-white font-medium">
                                        {categories.find(c => c.id === selectedCategory)?.name} Themes
                                    </h4>
                                    <span className="text-sm text-gray-400">
                                        {filteredThemes.length} themes
                                    </span>
                                </div>                                <div className="grid grid-cols-2 gap-4 max-h-[520px] overflow-y-auto">
                                    {filteredThemes.map((theme) => (
                                        <div
                                            key={theme.id}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                isThemeActive(theme.id)
                                                    ? 'border-blue-500 bg-blue-500/10'
                                                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                                            }`}
                                            onClick={() => handleThemeSelect(theme.id)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="text-white font-medium flex items-center space-x-2">
                                                        <span>{theme.name}</span>
                                                        {theme.premium && (
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        )}
                                                    </h5>
                                                    <p className="text-sm text-gray-400">{theme.description}</p>
                                                </div>
                                            </div>

                                            {/* Theme Colors Preview */}
                                            <div className="flex space-x-1 mb-3">
                                                <div 
                                                    className="w-6 h-6 rounded" 
                                                    style={{ backgroundColor: theme.colors.background }}
                                                    title="Background"
                                                />
                                                <div 
                                                    className="w-6 h-6 rounded" 
                                                    style={{ backgroundColor: theme.colors.surface }}
                                                    title="Surface"
                                                />
                                                <div 
                                                    className="w-6 h-6 rounded" 
                                                    style={{ backgroundColor: theme.colors.accent }}
                                                    title="Accent"
                                                />
                                                <div 
                                                    className="w-6 h-6 rounded" 
                                                    style={{ backgroundColor: theme.colors.bull }}
                                                    title="Bull"
                                                />
                                                <div 
                                                    className="w-6 h-6 rounded" 
                                                    style={{ backgroundColor: theme.colors.bear }}
                                                    title="Bear"
                                                />
                                            </div>

                                            {isThemeActive(theme.id) && (
                                                <div className="text-blue-400 text-sm flex items-center space-x-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>Active</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeManager;
