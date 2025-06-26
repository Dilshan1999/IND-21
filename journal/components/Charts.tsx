
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { DONUT_CHART_COLORS } from '../constants';
import { Trade, PerformanceByDay, KeyStats } from '../types';

interface DonutChartProps {
  data: { name: string; value: number }[];
  title: string;
}

export const CustomDonutChart: React.FC<DonutChartProps> = ({ data, title }) => {
  return (
    <div className="p-4 bg-brand-bg rounded-lg shadow h-full flex flex-col items-center">
      <h3 className="text-md font-semibold text-brand-text-muted mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={DONUT_CHART_COLORS[index % DONUT_CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '0.5rem' }}
            itemStyle={{ color: '#E2E8F0' }}
          />
          <Legend
             wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }}
             formatter={(value, entry) => {
                const { color } = entry;
                const itemValue = entry?.payload?.value;
                const total = data.reduce((sum, item) => sum + item.value, 0);
                const percentage = total > 0 ? ((itemValue / total) * 100).toFixed(0) : 0;
                return <span style={{ color }}>{value} ({itemValue} - {percentage}%)</span>;
             }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface EquityCurveChartProps {
  trades: Trade[];
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ trades }) => {
  const data = trades
    .filter(trade => trade.closedDate && typeof trade.pnl === 'number')
    .sort((a, b) => new Date(a.closedDate!).getTime() - new Date(b.closedDate!).getTime())
    .reduce((acc, trade, index) => {
      const cumulativePnl = (acc[index - 1]?.cumulativePnl || 0) + (trade.pnl || 0);
      acc.push({
        date: new Date(trade.closedDate!).toLocaleDateString('en-CA'), // YYYY-MM-DD for sorting/display
        cumulativePnl,
      });
      return acc;
    }, [] as { date: string; cumulativePnl: number }[]);

  if (data.length === 0) {
    return <div className="p-4 bg-brand-bg rounded-lg shadow text-center text-brand-text-muted">No closed trades with P&L to display equity curve.</div>;
  }
  
  return (
    <div className="p-4 bg-brand-bg rounded-lg shadow h-80">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Equity Curve</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toLocaleString()}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '0.5rem' }}
            itemStyle={{ color: '#E2E8F0' }}
            labelStyle={{ color: '#CBD5E1' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Cumulative P&L"]}
          />
          <Legend wrapperStyle={{ fontSize: '0.9rem' }} />
          <Line type="monotone" dataKey="cumulativePnl" stroke="#60A5FA" strokeWidth={2} dot={false} name="Cumulative P&L" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};


interface PerformanceByDayChartProps {
  data: PerformanceByDay[];
}

export const PerformanceByDayBarChart: React.FC<PerformanceByDayChartProps> = ({ data }) => {
  return (
    <div className="p-4 bg-brand-bg rounded-lg shadow h-80">
      <h3 className="text-lg font-semibold text-brand-text mb-4">Performance by Day of Week</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toLocaleString()}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '0.5rem' }}
            itemStyle={{ color: '#E2E8F0' }}
            labelStyle={{ color: '#CBD5E1' }}
             formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'netPnl' ? 'Net P&L' : name ]}
          />
          <Legend wrapperStyle={{ fontSize: '0.9rem' }} />
          <Bar dataKey="netPnl" name="Net P&L">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.netPnl >= 0 ? DONUT_CHART_COLORS[0] : DONUT_CHART_COLORS[1]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
