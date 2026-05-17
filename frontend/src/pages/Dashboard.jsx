import { useState, useEffect } from 'react';
import { PoundSterling, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../api';
import Header from '../components/layout/Header';
import KPICard from '../components/dashboard/KPICard';
import RevenueChart from '../components/dashboard/RevenueChart';
import MonthFilter from '../components/dashboard/MonthFilter';
import LowStockTable from '../components/dashboard/LowStockTable';
import TopProductsTable from '../components/dashboard/TopProductsTable';

const Dashboard = () => {
  const [revenue, setRevenue] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revRes, stockRes, topRes] = await Promise.all([
          api.get('/api/kpis/revenue'),
          api.get('/api/kpis/low-stock'),
          api.get('/api/kpis/top-products'),
        ]);
        setRevenue(revRes.data);
        setLowStock(stockRes.data);
        setTopProducts(topRes.data);
      } catch (err) {
        console.error('Failed to fetch KPI data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const fetchFiltered = async () => {
      try {
        const params = selectedMonth ? { month: selectedMonth } : {};
        const [revRes, topRes] = await Promise.all([
          api.get('/api/kpis/revenue', { params }),
          api.get('/api/kpis/top-products', { params }),
        ]);
        setRevenue(revRes.data);
        setTopProducts(topRes.data);
      } catch (err) {
        console.error('Failed to fetch filtered data:', err);
      }
    };
    fetchFiltered();
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const availableMonths = revenue?.monthly?.map((m) => m.month) || [];

  const currentRevenue = revenue?.current
    ? `£${parseFloat(revenue.current.total_revenue).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`
    : '—';

  const profitMargin = revenue?.current?.profit_margin_pct
    ? `${revenue.current.profit_margin_pct}% profit margin`
    : '';

  const revenueChange = revenue?.percentChange
    ? `${revenue.percentChange > 0 ? '↑' : '↓'} ${revenue.percentChange > 0 ? '+' : ''}${revenue.percentChange}% from previous month`
    : '';

  const revenueDesc = [profitMargin, revenueChange].filter(Boolean).join(' · ');

  const topProductName = topProducts?.topProduct?.name || '—';
  const topProductUnits = topProducts?.topProduct
    ? `${topProducts.topProduct.total_units_sold} units sold`
    : '';

  const lowStockCount = lowStock?.count ?? 0;
  const lowStockDesc = lowStockCount > 0
    ? 'Requires immediate reorder'
    : 'All stock levels healthy';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-start justify-between animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h2>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Here is what is happening with your store today.</p>
          </div>
          <MonthFilter
            months={availableMonths}
            selected={selectedMonth}
            onChange={setSelectedMonth}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
          <div className="animate-fade-in animate-fade-in-delay-1 flex">
            <KPICard
              title="Total Monthly Revenue"
              value={currentRevenue}
              description={revenueDesc}
              textColor="text-emerald-600"
              icon={PoundSterling}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
          </div>
          <div className="animate-fade-in animate-fade-in-delay-2 flex">
            <KPICard
              title="Top-Selling Product"
              value={topProductName}
              description={topProductUnits}
              textColor="text-blue-600"
              icon={TrendingUp}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
          </div>
          <div className="animate-fade-in animate-fade-in-delay-3 flex">
            <KPICard
              title="Low Stock Alerts"
              value={`${lowStockCount} Items`}
              description={lowStockDesc}
              textColor={lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}
              icon={AlertTriangle}
              iconBg={lowStockCount > 0 ? 'bg-red-100' : 'bg-emerald-100'}
              iconColor={lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}
            />
          </div>
        </div>

        <div className="mb-8 animate-fade-in animate-fade-in-delay-4">
          <RevenueChart data={revenue?.monthly} />
        </div>

        <div className="animate-fade-in animate-fade-in-delay-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Reports</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LowStockTable items={lowStock?.items} />
            <TopProductsTable rankings={topProducts?.rankings} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
