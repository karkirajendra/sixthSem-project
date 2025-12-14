import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  percentage, 
  isIncrease = true, 
  isDark = false,
  trendData = []
}) => {
  const TrendIndicator = () => {
    if (!trendData || trendData.length === 0) return null;
    
    return (
      <div className="mt-2">
        <div className={`overflow-hidden h-2 mb-1 text-xs flex rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full ${
              isIncrease ? 'bg-gradient-to-r from-blue-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
            }`}
            style={{ width: `${Math.min(percentage || 70, 100)}%` }}
          ></div>
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          vs. last month
        </p>
      </div>
    );
  };

  return (
    <div className={`rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </h3>
          <div className="mt-2 flex items-baseline">
            <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {percentage && (
              <span
                className={`ml-2 flex items-center text-xs font-medium ${
                  isIncrease ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {isIncrease ? (
                  <FiArrowUp className="mr-0.5" />
                ) : (
                  <FiArrowDown className="mr-0.5" />
                )}
                {percentage}%
              </span>
            )}
          </div>
        </div>
        <div
          className={`p-3 rounded-lg ${
            isDark ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}
        >
          {icon}
        </div>
      </div>
      <TrendIndicator />
    </div>
  );
};

export default StatsCard;