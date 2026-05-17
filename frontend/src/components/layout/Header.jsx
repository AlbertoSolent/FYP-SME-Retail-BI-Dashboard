import { useState, useEffect } from 'react';
import { BarChart3, Sun, Moon } from 'lucide-react';

const Header = () => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-8 py-4 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Retail BI</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">SME Dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-slate-300 hidden sm:block">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
