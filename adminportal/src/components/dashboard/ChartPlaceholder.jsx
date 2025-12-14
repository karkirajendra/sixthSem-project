import { 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp,
  FiRefreshCw 
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 600 },
  { name: 'Mar', value: 800 },
  { name: 'Apr', value: 1000 },
  { name: 'May', value: 1200 },
  { name: 'Jun', value: 1400 },
];

const ChartPlaceholder = ({ 
  title, 
  type = 'line', 
  height = 'h-80',
  isDark = false 
}) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <div className="flex items-center justify-center h-full">
            <FiBarChart2 className="mx-auto h-10 w-10 text-gray-400" />
          </div>
        );
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <FiPieChart className="mx-auto h-10 w-10 text-gray-400" />
          </div>
        );
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDark ? '#4B5563' : '#E5E7EB'} 
              />
              <XAxis 
                dataKey="name" 
                stroke={isDark ? '#9CA3AF' : '#6B7280'} 
              />
              <YAxis 
                stroke={isDark ? '#9CA3AF' : '#6B7280'} 
              />
              <Tooltip 
                contentStyle={isDark ? { 
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '0.5rem'
                } : null}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                fill="#93C5FD" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className={`rounded-xl shadow-sm p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <button 
          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          aria-label="Refresh chart"
        >
          <FiRefreshCw className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      </div>
      <div className={height}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartPlaceholder;