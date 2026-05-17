const KPICard = ({ title, value, description, textColor = 'text-gray-900', icon: Icon, iconBg = 'bg-blue-100', iconColor = 'text-blue-600' }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-200 w-full">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 ${iconBg} dark:bg-opacity-20 rounded-lg flex items-center justify-center`}>
            <Icon size={20} className={iconColor} />
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      {description && (
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">{description}</p>
      )}
    </div>
  );
};

export default KPICard;
