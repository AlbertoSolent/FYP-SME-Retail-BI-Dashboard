import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import KPICard from '../components/dashboard/KPICard';
import RevenueChart from '../components/dashboard/RevenueChart';

const Dashboard = () => {
  const [revenue, setRevenue] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revRes, stockRes, topRes] = await Promise.all([
          axios.get('/api/kpis/revenue'),
          axios.get('/api/kpis/low-stock'),
          axios.get('/api/kpis/top-products'),
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

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-screen font-sans items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const currentRevenue = revenue?.current
    ? `£${parseFloat(revenue.current.total_revenue).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`
    : '—';

  const revenueChange = revenue?.percentChange
    ? `${revenue.percentChange > 0 ? '↑' : '↓'} ${revenue.percentChange > 0 ? '+' : ''}${revenue.percentChange}% from last month`
    : '';

  const topProductName = topProducts?.topProduct?.name || '—';
  const topProductUnits = topProducts?.topProduct
    ? `${topProducts.topProduct.total_units_sold} units sold total`
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
            <p className="text-gray-500 mt-1">Here is what is happening with your store today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="Total Monthly Revenue"
              value={currentRevenue}
              description={revenueChange}
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
              textColor={lowStockCount > 0 ? 'text-red-500' : 'text-emerald-600'}
            />
          </div>

          <RevenueChart data={revenue?.monthly} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
