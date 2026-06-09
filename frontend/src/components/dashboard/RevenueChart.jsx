import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'Margin' ? `${entry.value}%` : `£${entry.value.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
        </p>
      ))}
    </div>
  );
};

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 h-80 flex items-center justify-center">
        <p className="text-gray-400 dark:text-slate-500 italic">Loading chart data...</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-GB', {
      month: 'short',
      year: '2-digit',
    }),
    Revenue: parseFloat(item.total_revenue),
    Profit: parseFloat(item.total_profit),
    Margin: parseFloat(item.profit_margin_pct),
  }));

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        Revenue vs. Profit
      </h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-5">
        Blue bars show total revenue, green bars show gross profit, and the amber line indicates profit margin percentage
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
          <Bar yAxisId="left" dataKey="Profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
          <Line yAxisId="right" type="monotone" dataKey="Margin" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
