import { AlertTriangle } from 'lucide-react';

const LowStockTable = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Items</h3>
        <p className="text-gray-600 dark:text-slate-400 italic">All products are sufficiently stocked.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Items</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-600">
              <th className="py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Product</th>
              <th className="py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Category</th>
              <th className="py-3 px-4 font-semibold text-gray-700 dark:text-slate-300 text-right">Stock</th>
              <th className="py-3 px-4 font-semibold text-gray-700 dark:text-slate-300 text-right">Threshold</th>
              <th className="py-3 px-4 font-semibold text-gray-700 dark:text-slate-300 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const ratio = item.current_stock / item.low_stock_threshold;
              const isCritical = ratio < 0.5;

              return (
                <tr key={item.product_id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-slate-200 font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-slate-400">{item.category_name}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-slate-200 text-right font-medium">{item.current_stock}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-slate-400 text-right">{item.low_stock_threshold}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isCritical
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {isCritical ? 'Critical' : 'Low'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockTable;
