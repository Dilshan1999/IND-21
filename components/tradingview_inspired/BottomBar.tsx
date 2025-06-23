import React, { useState } from 'react';
import { Calendar, Maximize2, Settings2 } from 'lucide-react';
import IconWrapper from './IconWrapper';

const BottomBar: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Trading Panel');
    const mainTabs = ['Crypto Pairs Screener', 'Pine Editor', 'Strategy Tester', 'Trading Panel'];
    const dateRanges = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'];
    const [selectedRange, setSelectedRange] = useState('1Y');
    const [currentTime, setCurrentTime] = useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-gray-800 text-gray-300 p-1.5 flex items-center justify-between border-t border-gray-700 text-xs h-10">
            <div className="flex items-center space-x-1">
                {dateRanges.map(range => (
                    <button 
                        key={range} 
                        onClick={() => setSelectedRange(range)}
                        className={`px-2 py-1 rounded-md ${selectedRange === range ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
                        aria-pressed={selectedRange === range}
                        aria-label={`Set date range to ${range}`}
                    >
                        {range}
                    </button>
                ))}
                <IconWrapper icon={Calendar} tooltip="Select Date Range (Not Implemented)" className="p-1 hover:bg-gray-600 rounded-md" />
                <IconWrapper icon={Maximize2} tooltip="Maximize Chart (Not Implemented)" className="p-1 hover:bg-gray-600 rounded-md" />
            </div>
            <div className="flex items-center space-x-1">
                {mainTabs.map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded-md ${activeTab === tab ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-600'}`}
                        aria-pressed={activeTab === tab}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="flex items-center space-x-2">
                <span>{currentTime.toLocaleTimeString('en-GB', { timeZone: 'UTC' })} UTC</span>
                <IconWrapper icon={Settings2} tooltip="Settings (Not Implemented)" className="p-1 hover:bg-gray-600 rounded-md" />
            </div>
        </div>
    );
};

export default BottomBar;
