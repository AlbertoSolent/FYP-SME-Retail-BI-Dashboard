import { BarChart3, Package, TrendingUp, AlertTriangle } from 'lucide-react';

const navItems = [
  { icon: BarChart3, label: 'Dashboard', active: true },
  { icon: TrendingUp, label: 'Revenue' },
  { icon: Package, label: 'Inventory' },
  { icon: AlertTriangle, label: 'Alerts' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 flex flex-col">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-gray-900">Retail BI</h1>
        <p className="text-xs text-gray-400 mt-1">SME Dashboard</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">FYP Project v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
