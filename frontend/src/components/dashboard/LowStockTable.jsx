const LowStockTable = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Low Stock Items</h3>
        <p className="text-gray-600 italic">All products are sufficiently stocked.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Low Stock Items</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700">Product</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-right">Current Stock</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-right">Threshold</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const ratio = item.current_stock / item.low_stock_threshold;
              const statusColor = ratio < 0.5 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
              const statusText = ratio < 0.5 ? 'Critical' : 'Low';

              return (
                <tr key={item.product_id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-gray-600">{item.category_name}</td>
                  <td className="py-3 px-4 text-gray-900 text-right font-medium">{item.current_stock}</td>
                  <td className="py-3 px-4 text-gray-600 text-right">{item.low_stock_threshold}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                      {statusText}
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
