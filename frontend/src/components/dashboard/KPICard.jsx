const KPICard = ({ title, value, description, textColor = 'text-gray-900' }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      {description && (
        <p className="text-sm text-gray-400 mt-2">{description}</p>
      )}
    </div>
  );
};

export default KPICard;
