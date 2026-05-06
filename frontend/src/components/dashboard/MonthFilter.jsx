const MonthFilter = ({ months, selected, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="month-filter" className="text-sm font-medium text-gray-700">
        Filter by month:
      </label>
      <select
        id="month-filter"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Time</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {new Date(m + '-01').toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthFilter;
