const TopProductsTable = ({ rankings }) => {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Selling Products</h3>
        <p className="text-gray-600 italic">No sales data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Selling Products</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700 w-12">Rank</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Product</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-right">Units Sold</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((item, index) => (
              <tr key={item.product_id} className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-900 font-medium">{item.name}</td>
                <td className="py-3 px-4 text-gray-600">{item.category_name}</td>
                <td className="py-3 px-4 text-gray-900 text-right font-medium">
                  {parseInt(item.total_units_sold).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-gray-900 text-right">
                  £{parseFloat(item.total_revenue).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProductsTable;
