import React, { useState } from 'react';
import {
    MousePointer2, Move, Dot, ArrowUpRight, TrendingUp, Compass, Layers, Edit3, 
    Zap, DollarSign, Eye, GitCompareArrows, Palette, Star, List, Trash2,
    Ruler, Triangle, Square, Circle, Slash, RotateCcw, Magnet,
    Target, Crosshair, PenTool, Type, Minus
} from 'lucide-react';
import IconWrapper from './IconWrapper';
import { DrawingTool } from '../../types';

interface SubToolItem {
    icon: React.ElementType;
    name: string;
    toolName?: DrawingTool;
    isNew?: boolean;
    action?: () => void;
}

interface ToolItem {
    icon: React.ElementType;
    tooltip: string;
    toolName?: DrawingTool;
    subTools?: SubToolItem[];
    action?: () => void;
    isActive?: boolean;
}

interface LeftToolbarProps {
    currentDrawingTool: DrawingTool;
    onSetDrawingTool: (tool: DrawingTool) => void;
    onClearDrawings: () => void;
}

const LeftToolbar: React.FC<LeftToolbarProps> = ({ currentDrawingTool, onSetDrawingTool, onClearDrawings }) => {
    const [openSubMenuKey, setOpenSubMenuKey] = useState<string | null>(null);
    const [magnetMode, setMagnetMode] = useState(false);

    const handleToolSelect = (tool: DrawingTool) => {
        onSetDrawingTool(tool);
        setOpenSubMenuKey(null);
    };

    const tools: ToolItem[] = [
        { 
            icon: MousePointer2, 
            tooltip: 'Cursor', 
            toolName: 'none', 
            action: () => handleToolSelect('none'),
            isActive: currentDrawingTool === 'none'
        },
        { 
            icon: Move, 
            tooltip: 'Hand Tool (Pan)', 
            action: () => {/* Pan tool logic */}
        },
        { 
            icon: Crosshair, 
            tooltip: 'Cross Line Tool', 
            action: () => {/* Cross line tool logic */}
        },
        {
            icon: TrendingUp,
            tooltip: 'Trend Lines',
            subTools: [
                { icon: TrendingUp, name: 'Trend Line', toolName: 'trendline' },
                { icon: Minus, name: 'Horizontal Line' },
                { icon: Slash, name: 'Vertical Line' },
                { icon: ArrowUpRight, name: 'Ray' },
                { icon: ArrowUpRight, name: 'Extended Line' },
                { icon: TrendingUp, name: 'Parallel Channel' },
                { icon: TrendingUp, name: 'Disjoint Channel', isNew: true },
            ]
        },
        {
            icon: Compass,
            tooltip: 'Gann and Fibonacci Tools',
            subTools: [
                { icon: Compass, name: 'Fibonacci Retracement' },
                { icon: Compass, name: 'Fibonacci Extension' },
                { icon: Compass, name: 'Fibonacci Fan' },
                { icon: Compass, name: 'Fibonacci Arc' },
                { icon: Compass, name: 'Fibonacci Spiral' },
                { icon: Compass, name: 'Fibonacci Time Zone' },
                { icon: Compass, name: 'Gann Fan' },
                { icon: Compass, name: 'Gann Square' },
            ]
        },
        {
            icon: Layers,
            tooltip: 'Geometric Shapes',
            subTools: [
                { icon: Square, name: 'Rectangle' },
                { icon: Circle, name: 'Circle' },
                { icon: Triangle, name: 'Triangle' },
                { icon: Square, name: 'Rotated Rectangle' },
                { icon: Circle, name: 'Ellipse' },
                { icon: Target, name: 'Arc' },
            ]
        },
        {
            icon: Edit3,
            tooltip: 'Annotation Tools',
            subTools: [
                { icon: Type, name: 'Text' },
                { icon: Edit3, name: 'Note' },
                { icon: Target, name: 'Anchored Note' },
                { icon: PenTool, name: 'Callout' },
                { icon: Edit3, name: 'Price Label' },
                { icon: ArrowUpRight, name: 'Arrow' },
            ]
        },
        {
            icon: Zap,
            tooltip: 'Patterns',
            subTools: [
                { icon: Zap, name: 'Head and Shoulders' },
                { icon: Zap, name: 'Triangle Pattern' },
                { icon: Zap, name: 'Flag/Pennant' },
                { icon: Zap, name: 'Wedge' },
                { icon: Zap, name: 'Channel' },
            ]
        },
        {
            icon: DollarSign,
            tooltip: 'Prediction and Measurement Tools',
            subTools: [
                { icon: Ruler, name: 'Ruler' },
                { icon: DollarSign, name: 'Price Range' },
                { icon: DollarSign, name: 'Date Range' },
                { icon: DollarSign, name: 'Price/Date Range' },
                { icon: Target, name: 'Bars Pattern' },
                { icon: Target, name: 'Ghost Feed' },
            ]
        },
        { 
            icon: Eye, 
            tooltip: 'Hide/Show Drawings', 
            action: () => {/* Toggle visibility logic */}
        },
        { 
            icon: GitCompareArrows, 
            tooltip: 'Compare Symbols', 
            action: () => {/* Compare symbols logic */}
        },
        { 
            icon: Palette, 
            tooltip: 'Chart Themes', 
            action: () => {/* Theme selection logic */}
        },
    ];

    const bottomTools = [
        { 
            icon: Magnet, 
            tooltip: 'Magnet Mode', 
            action: () => setMagnetMode(!magnetMode),
            isActive: magnetMode
        },
        { 
            icon: RotateCcw, 
            tooltip: 'Auto Scale', 
            action: () => {/* Auto scale logic */}
        },
        { 
            icon: Trash2, 
            tooltip: 'Remove All Drawings', 
            action: onClearDrawings 
        },
        { 
            icon: Star, 
            tooltip: 'Favorites' 
        },
        { 
            icon: List, 
            tooltip: 'Object Tree' 
        },
    ];

    return (
        <div className="bg-gray-800 p-1.5 flex flex-col items-center border-r border-gray-700 w-14">
            {/* Main Tools */}
            <div className="flex flex-col space-y-1">
                {tools.map((tool) => (
                    <div key={tool.tooltip} className="relative">
                        <IconWrapper
                            icon={tool.icon}
                            tooltip={tool.tooltip}
                            className={`p-2.5 rounded-lg w-10 h-10 flex items-center justify-center transition-all duration-200
                                ${tool.isActive || (tool.toolName && currentDrawingTool === tool.toolName) 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                }
                                ${tool.subTools ? 'relative' : ''}
                            `}
                            onClick={() => {
                                if (tool.action) tool.action();
                                else if (tool.subTools) setOpenSubMenuKey(prevKey => prevKey === tool.tooltip ? null : tool.tooltip);
                                else if (tool.toolName) handleToolSelect(tool.toolName);
                            }}
                        />
                        
                        {/* Submenu indicator */}
                        {tool.subTools && (
                            <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-500 rounded-full opacity-60"></div>
                        )}
                        
                        {/* Submenu */}
                        {tool.subTools && openSubMenuKey === tool.tooltip && (
                            <div className="absolute left-full top-0 ml-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-20 py-2">
                                <div className="px-3 py-2 border-b border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-200">{tool.tooltip}</h3>
                                </div>
                                {tool.subTools.map((subTool) => (
                                    <div
                                        key={subTool.name}
                                        className={`flex items-center px-3 py-2.5 hover:bg-gray-700 cursor-pointer text-gray-200 text-sm transition-colors
                                            ${subTool.toolName && currentDrawingTool === subTool.toolName ? 'bg-blue-600' : ''}
                                        `}
                                        onClick={() => { 
                                            if (subTool.action) subTool.action();
                                            else if (subTool.toolName) handleToolSelect(subTool.toolName); 
                                            setOpenSubMenuKey(null); 
                                        }}
                                    >
                                        <subTool.icon className="w-4 h-4 mr-3 text-gray-400" />
                                        <span className="flex-1">{subTool.name}</span>
                                        {subTool.isNew && (
                                            <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-sm font-medium">NEW</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Spacer */}
            <div className="flex-grow"></div>
            
            {/* Bottom Tools */}
            <div className="flex flex-col space-y-1">
                {bottomTools.map((tool) => (
                    <IconWrapper
                        key={tool.tooltip}
                        icon={tool.icon}
                        tooltip={tool.tooltip}
                        className={`p-2.5 rounded-lg w-10 h-10 flex items-center justify-center transition-all duration-200
                            ${tool.isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300 hover:text-white'}
                        `}
                        onClick={tool.action}
                    />
                ))}
            </div>
        </div>
    );
};

export default LeftToolbar;
