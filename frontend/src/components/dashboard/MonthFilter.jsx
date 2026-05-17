import { Calendar } from 'lucide-react';

const MonthFilter = ({ months, selected, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar size={16} className="text-gray-400 dark:text-slate-500" />
      <select
        id="month-filter"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Filter by month"
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
