import { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/layout/Sidebar';
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

  // Fetch all data on mount
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

  // Re-fetch revenue and top products when month filter changes
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
      <div className="flex bg-slate-50 min-h-screen font-sans items-center justify-center">
        <p className="text-gray-700">Loading dashboard...</p>
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
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
              <p className="text-gray-600 mt-1">Here is what is happening with your store today.</p>
            </div>
            <MonthFilter
              months={availableMonths}
              selected={selectedMonth}
              onChange={setSelectedMonth}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="Total Monthly Revenue"
              value={currentRevenue}
              description={revenueDesc}
              textColor="text-emerald-600"
            />
            <KPICard
              title="Top-Selling Product"
              value={topProductName}
              description={topProductUnits}
              textColor="text-blue-600"
            />
            <KPICard
              title="Low Stock Alerts"
              value={`${lowStockCount} Items`}
              description={lowStockDesc}
              textColor={lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}
            />
          </div>

          <div className="mb-8">
            <RevenueChart data={revenue?.monthly} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LowStockTable items={lowStock?.items} />
            <TopProductsTable rankings={topProducts?.rankings} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
