import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <p className="text-gray-400 italic">Loading chart data...</p>
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
  }));

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-700 mb-6">
        Revenue vs. Profit Margin
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `£${v.toLocaleString()}`} />
          <Tooltip
            formatter={(value) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
          />
          <Legend />
          <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
