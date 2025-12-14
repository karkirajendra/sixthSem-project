import { useState, useEffect } from 'react';
import {
  getVisitorAnalytics,
  getPropertyAnalytics,
} from '../../utils/adminApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiGlobe,
  FiHome,
  FiEye,
} from 'react-icons/fi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdvancedAnalytics = ({ timeRange }) => {
  const [visitorData, setVisitorData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [visitors, properties] = await Promise.all([
          getVisitorAnalytics(timeRange),
          getPropertyAnalytics(timeRange),
        ]);

        setVisitorData(visitors);
        setPropertyData(properties);
      } catch (error) {
        console.error('Error fetching advanced analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="dashboard-card"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const GeographicDistribution = () => {
    if (!visitorData?.geographic || visitorData.geographic.length === 0) {
      return (
        <div className="dashboard-card">
          <h3 className="text-base font-medium mb-4">
            Geographic Distribution
          </h3>
          <p className="text-gray-500 text-center py-8">
            No geographic data available
          </p>
        </div>
      );
    }

    const pieData = visitorData.geographic.slice(0, 5).map((item, index) => ({
      name: `${item._id.city}, ${item._id.country}`,
      value: item.visitors,
      color: COLORS[index % COLORS.length],
    }));

    return (
      <div className="dashboard-card">
        <h3 className="text-base font-medium mb-4">Geographic Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {pieData.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span>{entry.name}</span>
              </div>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const VisitorMetrics = () => {
    const uniqueVisitors = visitorData?.unique || 0;
    const returningVisitors = visitorData?.returning || 0;
    const totalVisitors = uniqueVisitors + returningVisitors;
    const returnRate =
      totalVisitors > 0
        ? ((returningVisitors / totalVisitors) * 100).toFixed(1)
        : 0;

    return (
      <div className="dashboard-card">
        <h3 className="text-base font-medium mb-4">Visitor Metrics</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FiUsers className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{uniqueVisitors}</p>
            <p className="text-sm text-gray-600">New Visitors</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FiTrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {returningVisitors}
            </p>
            <p className="text-sm text-gray-600">Returning</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Return Rate</span>
            <span className="text-lg font-bold text-purple-600">
              {returnRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${returnRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const PropertyPerformance = () => {
    if (!propertyData?.mostViewed || propertyData.mostViewed.length === 0) {
      return (
        <div className="dashboard-card">
          <h3 className="text-base font-medium mb-4">Property Performance</h3>
          <p className="text-gray-500 text-center py-8">
            No property data available
          </p>
        </div>
      );
    }

    return (
      <div className="dashboard-card">
        <h3 className="text-base font-medium mb-4">Top Properties</h3>
        <div className="space-y-4">
          {propertyData.mostViewed.slice(0, 5).map((property, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{property.title}</p>
                  {property.location && (
                    <p className="text-xs text-gray-500">{property.location}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold flex items-center">
                  <FiEye className="h-3 w-3 mr-1" />
                  {property.views}
                </p>
                {property.price && (
                  <p className="text-xs text-gray-500">
                    Rs. {property.price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ConversionAnalytics = () => {
    if (
      !propertyData?.highestConversion ||
      propertyData.highestConversion.length === 0
    ) {
      return (
        <div className="dashboard-card">
          <h3 className="text-base font-medium mb-4">Conversion Analytics</h3>
          <p className="text-gray-500 text-center py-8">
            No conversion data available
          </p>
        </div>
      );
    }

    return (
      <div className="dashboard-card">
        <h3 className="text-base font-medium mb-4">
          Best Converting Properties
        </h3>
        <div className="space-y-4">
          {propertyData.highestConversion.slice(0, 3).map((property, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium">Property #{property._id}</p>
                <span className="text-sm font-bold text-green-600">
                  {property.conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Views: {property.views}</div>
                <div>Conversions: {property.conversions}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <VisitorMetrics />
      <PropertyPerformance />
      <GeographicDistribution />
      <ConversionAnalytics />
    </div>
  );
};

export default AdvancedAnalytics;
