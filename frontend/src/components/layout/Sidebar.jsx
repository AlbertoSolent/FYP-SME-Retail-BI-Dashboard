import { BarChart3 } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 flex flex-col">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-gray-900">Retail BI</h1>
        <p className="text-xs text-gray-400 mt-1">SME Dashboard</p>
      </div>

      <nav className="flex-1">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-blue-50 text-blue-700">
          <BarChart3 size={18} />
          Dashboard
        </div>
      </nav>

      <div className="pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">FYP Project v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
