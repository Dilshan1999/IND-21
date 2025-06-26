import React, { useState, useMemo, useCallback } from 'react';
import { Trade, KeyStats, AppSection, PerformanceByDay, OptionType, DailyWinLoss } from '../types';
import { MONTHS, DAYS_OF_WEEK, SHORT_DAYS_OF_WEEK } from '../constants';
import { CustomDonutChart, EquityCurveChart } from './Charts';
import TradeForm from './TradeForm';

interface DashboardProps {
  currentView: AppSection;
  trades: Trade[];
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
}

const calculateKeyStats = (trades: Trade[]): KeyStats => {
  const closedTrades = trades.filter(t => typeof t.pnl === 'number');
  const totalTrades = closedTrades.length;
  if (totalTrades === 0) {
    return { totalNetPnl: 0, overallWinRate: 0, averageWinningTrade: 0, averageLosingTrade: 0, profitFactor: 0, totalTrades: 0 };
  }

  const totalNetPnl = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);

  const overallWinRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  
  const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));

  const averageWinningTrade = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const averageLosingTrade = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0; // Absolute value

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);

  return {
    totalNetPnl,
    overallWinRate,
    averageWinningTrade,
    averageLosingTrade,
    profitFactor,
    totalTrades
  };
};

const calculatePerformanceByDay = (trades: Trade[]): PerformanceByDay[] => {
  const performanceMap: { [key: string]: { wins: number; losses: number; netPnl: number } } = {};
  DAYS_OF_WEEK.forEach(day => {
    performanceMap[day] = { wins: 0, losses: 0, netPnl: 0 };
  });

  trades.forEach(trade => {
    if (trade.closedDate && typeof trade.pnl === 'number') {
      const dayName = DAYS_OF_WEEK[new Date(trade.closedDate).getDay()];
      if (performanceMap[dayName]) {
        performanceMap[dayName].netPnl += trade.pnl;
        if (trade.pnl > 0) performanceMap[dayName].wins++;
        else if (trade.pnl < 0) performanceMap[dayName].losses++;
      }
    }
  });
  return DAYS_OF_WEEK.map(day => ({ day, ...performanceMap[day] }));
};


const StatCard: React.FC<{ title: string; value: string | number; className?: string; isCurrency?: boolean; positiveIsGood?: boolean }> = ({ title, value, className, isCurrency = true, positiveIsGood = true }) => {
  let valueColor = 'text-brand-text';
  if (typeof value === 'number') {
    if (value > 0) valueColor = positiveIsGood ? 'text-brand-win' : 'text-brand-loss';
    if (value < 0) valueColor = positiveIsGood ? 'text-brand-loss' : 'text-brand-win';
  }

  const displayValue = isCurrency && typeof value === 'number'
    ? `${value < 0 ? '-' : ''}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : (typeof value === 'number' ? value.toFixed(2) : value);

  return (
    <div className={`bg-brand-bg p-4 rounded-lg shadow ${className}`}>
      <h4 className="text-sm text-brand-text-muted font-medium">{title}</h4>
      <p className={`text-2xl font-bold ${valueColor}`}>{displayValue}</p>
    </div>
  );
};


const TradeLogRow: React.FC<{trade: Trade, onEdit: (trade: Trade) => void, onDelete: (tradeId: string) => void, showStrategy?: boolean}> = React.memo(({ trade, onEdit, onDelete, showStrategy = false }) => {
  const pnlColor = trade.status === 'WIN' ? 'text-brand-win' : trade.status === 'LOSS' ? 'text-brand-loss' : 'text-brand-text-muted';
  return (
    <tr className="border-b border-brand-bg-light hover:bg-slate-700 transition-colors">
      <td className={`px-4 py-3 whitespace-nowrap font-semibold ${trade.status === 'WIN' ? 'bg-emerald-600/20 text-brand-win' : trade.status === 'LOSS' ? 'bg-red-600/20 text-brand-loss' : 'text-brand-text-muted'}`}>
        {trade.status || 'N/A'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{trade.enteredDate}</td>
      <td className="px-4 py-3 whitespace-nowrap">{trade.symbol}</td>
      <td className="px-4 py-3 whitespace-nowrap">{trade.entryPrice.toFixed(2)}</td>
      <td className="px-4 py-3 whitespace-nowrap">{trade.exitPrice !== undefined ? trade.exitPrice.toFixed(2) : '-'}</td>
      <td className="px-4 py-3 whitespace-nowrap">{trade.size}</td>
      <td className="px-4 py-3 whitespace-nowrap">{trade.optionType !== OptionType.NONE ? trade.optionType : '-'}</td>
      <td className={`px-4 py-3 whitespace-nowrap font-semibold ${pnlColor}`}>
        {trade.returnPercentage !== undefined ? `${trade.returnPercentage.toFixed(2)}%` : '-'}
      </td>
      <td className={`px-4 py-3 whitespace-nowrap font-semibold ${pnlColor}`}>
        {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : '-'}
      </td>
      {showStrategy && (
        <td className="px-4 py-3 whitespace-nowrap">{trade.strategyUsed || '-'}</td>
      )}
      <td className="px-4 py-3 whitespace-nowrap">
        <button onClick={() => onEdit(trade)} className="text-brand-accent hover:text-blue-300 mr-2 text-xs">Edit</button>
        <button onClick={() => onDelete(trade.id)} className="text-brand-loss hover:text-red-300 text-xs">Delete</button>
      </td>
    </tr>
  );
});


const Dashboard: React.FC<DashboardProps> = ({ currentView, trades, setTrades }) => {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  // Filters state
  const [dateRangeStart, setDateRangeStart] = useState<string>('2024-01-01'); // Example start date
  const [dateRangeEnd, setDateRangeEnd] = useState<string>(new Date().toISOString().split('T')[0]); // Today
  const [selectedMonth, setSelectedMonth] = useState<string>('All'); // Default to 'All Months'
  const [selectedDay, setSelectedDay] = useState<string>('All');


  const filteredTrades = useMemo(() => {
    console.log('Filtering trades:', trades);
    console.log('Filter criteria:', { dateRangeStart, dateRangeEnd, selectedMonth, selectedDay });
    
    const filtered = trades.filter(trade => {
      const tradeDate = new Date(trade.enteredDate);
      console.log('Checking trade:', trade.symbol, 'Date:', trade.enteredDate, 'Parsed:', tradeDate);
      
      if (dateRangeStart && new Date(dateRangeStart) > tradeDate) {
        console.log('Filtered out by start date:', trade.symbol);
        return false;
      }
      if (dateRangeEnd && new Date(dateRangeEnd) < tradeDate) {
        console.log('Filtered out by end date:', trade.symbol);
        return false;
      }
      if (selectedMonth !== 'All' && MONTHS[tradeDate.getMonth()] !== selectedMonth) {
        console.log('Filtered out by month:', trade.symbol, MONTHS[tradeDate.getMonth()], selectedMonth);
        return false;
      }
      if (selectedDay !== 'All' && SHORT_DAYS_OF_WEEK[tradeDate.getDay()] !== selectedDay) {
        console.log('Filtered out by day:', trade.symbol);
        return false;
      }
      console.log('Trade passed filters:', trade.symbol);
      return true;
    });
    
    console.log('Filtered trades result:', filtered);
    return filtered;
  }, [trades, dateRangeStart, dateRangeEnd, selectedMonth, selectedDay]);

  const keyStats = useMemo(() => calculateKeyStats(filteredTrades), [filteredTrades]);
  // const performanceByDay = useMemo(() => calculatePerformanceByDay(filteredTrades), [filteredTrades]); // Not used in simplified view
  
  const successfulRateData = useMemo(() => {
    const wins = filteredTrades.filter(t => t.status === 'WIN').length;
    const losses = filteredTrades.filter(t => t.status === 'LOSS').length;
    if (wins === 0 && losses === 0) return [{ name: 'N/A', value: 1 }]; // Placeholder for empty data
    return [
      { name: 'WIN', value: wins },
      { name: 'LOSS', value: losses },
    ];
  }, [filteredTrades]);

  const dailyWinLossRates = useMemo(() => {
    const rates: Record<string, DailyWinLoss> = {};
    SHORT_DAYS_OF_WEEK.slice(1,6).forEach(day => rates[day] = { wins: 0, losses: 0 }); // Mon-Fri

    filteredTrades.forEach(trade => {
      if (trade.closedDate && (trade.status === 'WIN' || trade.status === 'LOSS')) {
        const dayOfWeek = SHORT_DAYS_OF_WEEK[new Date(trade.closedDate).getDay()];
        if (rates[dayOfWeek]) {
          if (trade.status === 'WIN') rates[dayOfWeek].wins++;
          else rates[dayOfWeek].losses++;
        }
      }
    });
    return rates;
  }, [filteredTrades]);


  const handleAddTrade = (trade: Trade) => {
    setTrades(prev => [...prev, trade]);
    setShowTradeForm(false);
    setEditingTrade(null);
  };

  const handleUpdateTrade = (updatedTrade: Trade) => {
    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
    setShowTradeForm(false);
    setEditingTrade(null);
  };

  const openEditModal = (trade: Trade) => {
    setEditingTrade(trade);
    setShowTradeForm(true);
  };
  
  const handleDeleteTrade = useCallback((tradeId: string) => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
        setTrades(prev => prev.filter(t => t.id !== tradeId));
    }
  }, [setTrades]);


  const renderFilters = () => (
    <div className="mb-6 p-4 bg-brand-bg rounded-lg shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <div>
        <label className="text-xs text-brand-text-muted block mb-1">Date Range Start</label>
        <input type="date" value={dateRangeStart} onChange={e => setDateRangeStart(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:ring-brand-accent outline-none" />
      </div>
      <div>
        <label className="text-xs text-brand-text-muted block mb-1">Date Range End</label>
        <input type="date" value={dateRangeEnd} onChange={e => setDateRangeEnd(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:ring-brand-accent outline-none" />
      </div>
      <div>
        <label className="text-xs text-brand-text-muted block mb-1">Month</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:ring-brand-accent outline-none">
          <option value="All">All Months</option>
          {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-brand-text-muted block mb-1">Day</label>
        <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded focus:ring-brand-accent outline-none">
          <option value="All">All Days</option>
          {SHORT_DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
        </select>
      </div>
    </div>
  );
  
  const renderDashboardOverview = () => (
    <>
      {renderFilters()}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2"> {/* Main content area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard title="Total Net P&L" value={keyStats.totalNetPnl} />
            <StatCard title="Win Rate" value={`${keyStats.overallWinRate.toFixed(2)}%`} isCurrency={false}/>
            <div className="md:col-span-1 h-48">
                 <CustomDonutChart data={successfulRateData} title="Successful Rate" />
            </div>
          </div>
          <div className="mb-6">
            <EquityCurveChart trades={filteredTrades} />
          </div>
          <div className="bg-brand-bg p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-brand-text-muted uppercase bg-brand-bg-light">
                        <tr>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Entered</th>
                            <th className="px-4 py-3">Symbol</th>
                            <th className="px-4 py-3">Entry</th>
                            <th className="px-4 py-3">Exit</th>
                            <th className="px-4 py-3">Size</th>
                            <th className="px-4 py-3">O_Type</th>
                            <th className="px-4 py-3">Return%</th>
                            <th className="px-4 py-3">Return$</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrades.slice(0, 10).map(trade => <TradeLogRow key={trade.id} trade={trade} onEdit={openEditModal} onDelete={handleDeleteTrade} />)}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-4"> {/* Sidebar area */}
            {SHORT_DAYS_OF_WEEK.slice(1,6).map(day => { // Mon-Fri
                const dayData = dailyWinLossRates[day];
                const chartData = (dayData.wins === 0 && dayData.losses === 0) ? [{name: 'N/A', value: 1}] : [
                    { name: 'WIN', value: dayData.wins },
                    { name: 'LOSS', value: dayData.losses }
                ];
                return <CustomDonutChart key={day} data={chartData} title={`${day} Rate`} />;
            })}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <StatCard title="Avg Win" value={keyStats.averageWinningTrade} />
            <StatCard title="Avg Loss" value={keyStats.averageLosingTrade * -1} positiveIsGood={false}/>
            <StatCard title="Profit Factor" value={isFinite(keyStats.profitFactor) ? keyStats.profitFactor.toFixed(2) : 'N/A'} isCurrency={false}/>
            <StatCard title="Total Trades" value={keyStats.totalTrades} isCurrency={false}/>
      </div>
    </>
  );

  const renderTradeLogSection = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-brand-text">Full Trade Log</h2>
        <button 
            onClick={() => { setEditingTrade(null); setShowTradeForm(true); }}
            className="px-4 py-2 bg-brand-accent hover:bg-blue-500 rounded text-white transition-colors"
        >
            Add New Trade
        </button>
      </div>
      {renderFilters()}
      <div className="bg-brand-bg p-4 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-brand-text-muted uppercase bg-brand-bg-light">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Entered</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Entry</th>
              <th className="px-4 py-3">Exit</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">O_Type</th>
              <th className="px-4 py-3">Return%</th>
              <th className="px-4 py-3">Return$</th>
              <th className="px-4 py-3">Strategy</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map(trade => (
                <TradeLogRow key={trade.id} trade={trade} onEdit={openEditModal} onDelete={handleDeleteTrade} showStrategy={true} />
            ))}
          </tbody>
        </table>
        {filteredTrades.length === 0 && <p className="text-center py-8 text-brand-text-muted">No trades match current filters or no trades logged yet.</p>}
      </div>
    </>
  );

  const renderAnalyticsSection = () => {
    // Debug logging
    console.log('Analytics Section - Total trades:', trades.length);
    console.log('Analytics Section - Filtered trades:', filteredTrades.length);
    console.log('Analytics Section - Key stats:', keyStats);
    console.log('Analytics Section - Filters:', { selectedMonth, selectedDay, dateRangeStart, dateRangeEnd });

    return (
      <>
        <h2 className="text-2xl font-semibold text-brand-text mb-6">Performance Analytics</h2>
        {renderFilters()}
        
        {/* Debug Information */}
        <div className="mb-6 p-4 bg-slate-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Debug Info</h3>
          <p className="text-green-400">Total Trades: {trades.length}</p>
          <p className="text-blue-400">Filtered Trades: {filteredTrades.length}</p>
          <p className="text-yellow-400">Total Net P&L: ${keyStats.totalNetPnl.toFixed(2)}</p>
          <p className="text-purple-400">Win Rate: {keyStats.overallWinRate.toFixed(1)}%</p>
        </div>
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Net P&L" value={keyStats.totalNetPnl} />
          <StatCard title="Win Rate" value={`${keyStats.overallWinRate.toFixed(1)}%`} isCurrency={false} />
          <StatCard title="Profit Factor" value={isFinite(keyStats.profitFactor) ? keyStats.profitFactor.toFixed(2) : 'N/A'} isCurrency={false} />
          <StatCard title="Total Trades" value={keyStats.totalTrades} isCurrency={false} />
        </div>

        {/* Simple Recent Trades List */}
        <div className="bg-brand-bg p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Recent Trades (Debug)</h3>
          {filteredTrades.length === 0 ? (
            <p className="text-red-400">No trades found with current filters!</p>
          ) : (
            <div className="space-y-2">
              {filteredTrades.slice(0, 5).map(trade => (
                <div key={trade.id} className="flex justify-between items-center p-2 bg-brand-bg-light rounded">
                  <span className="text-brand-text">{trade.symbol}</span>
                  <span className={trade.status === 'WIN' ? 'text-green-400' : 'text-red-400'}>
                    {trade.pnl ? `$${trade.pnl.toFixed(0)}` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderPlaceholderSection = (title: string) => (
    <div className="p-6 bg-brand-bg rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-brand-text mb-4">{title}</h2>
      <p className="text-brand-text-muted">This section is under development. Content for {title.toLowerCase()} will be available soon.</p>
      <div className="mt-6 space-y-4">
        <div className="h-32 bg-brand-bg-light rounded animate-pulse"></div>
        <div className="h-24 bg-brand-bg-light rounded animate-pulse"></div>
      </div>
    </div>
  );


  let content;
  switch (currentView) {
    case 'DASHBOARD_OVERVIEW':
      content = renderDashboardOverview();
      break;
    case 'TRADE_LOG':
      content = renderTradeLogSection();
      break;
    case 'ANALYTICS':
      content = renderAnalyticsSection();
      break;
    case 'PLAYBOOK':
      content = renderPlaceholderSection('Trading Playbook & Rules');
      break;
    case 'REVIEW':
      content = renderPlaceholderSection('Weekly/Monthly Review');
      break;
    default:
      content = renderDashboardOverview();
  }

  return (
    <div className="p-4 md:p-6">
      {content}
      {showTradeForm && (
        <TradeForm 
          onSubmit={editingTrade ? handleUpdateTrade : handleAddTrade} 
          onClose={() => { setShowTradeForm(false); setEditingTrade(null); }}
          initialTrade={editingTrade}
        />
      )}
    </div>
  );
};

export default Dashboard;
