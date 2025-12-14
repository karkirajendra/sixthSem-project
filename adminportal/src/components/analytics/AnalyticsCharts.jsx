import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FiUsers,
  FiMapPin,
  FiHome,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiTrendingUp,
  FiEye,
} from 'react-icons/fi';

const DeviceStats = ({ data }) => {
  // Provide default data if not available
  const deviceData = data || { mobile: 0, desktop: 0, tablet: 0 };

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-medium mb-4">Traffic by Device</h3>
      <div className="flex flex-col space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <div className="flex items-center">
              <FiSmartphone className="mr-2 text-primary-600" />
              <span className="text-sm font-medium">Mobile</span>
            </div>
            <span className="text-sm font-medium">
              {deviceData.mobile || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${deviceData.mobile || 0}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <div className="flex items-center">
              <FiMonitor className="mr-2 text-secondary-600" />
              <span className="text-sm font-medium">Desktop</span>
            </div>
            <span className="text-sm font-medium">
              {deviceData.desktop || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-secondary-600 h-2 rounded-full"
              style={{ width: `${deviceData.desktop || 0}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <div className="flex items-center">
              <FiTablet className="mr-2 text-accent-600" />
              <span className="text-sm font-medium">Tablet</span>
            </div>
            <span className="text-sm font-medium">
              {deviceData.tablet || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-accent-600 h-2 rounded-full"
              style={{ width: `${deviceData.tablet || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopCities = ({ data }) => {
  // Ensure data exists and is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="text-base font-medium mb-4">Top Cities</h3>
        <p className="text-gray-500 text-center py-4">No city data available</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-medium mb-4">Top Cities</h3>
      {data.map((city, index) => (
        <div
          key={index}
          className="mb-4 last:mb-0"
        >
          <div className="flex justify-between mb-1">
            <div className="flex items-center">
              <FiMapPin className="mr-2 text-primary-600" />
              <span className="text-sm font-medium">
                {city.city || city.name || 'Unknown'}
              </span>
            </div>
            <span className="text-sm font-medium">
              {(city.visits || city.value || 0).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{
                width: `${
                  data[0] && (city.visits || city.value)
                    ? ((city.visits || city.value) /
                        (data[0].visits || data[0].value)) *
                      100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TopProperties = ({ data }) => {
  // Ensure data exists and is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="text-base font-medium mb-4">Top Properties</h3>
        <p className="text-gray-500 text-center py-4">
          No property data available
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-medium mb-4">Top Properties</h3>
      {data.map((property, index) => (
        <div
          key={index}
          className="flex items-center justify-between mb-4 last:mb-0"
        >
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold mr-3">
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium">
                {property.title || 'Unknown Property'}
              </p>
              <p className="text-xs text-gray-500">
                {(property.views || 0).toLocaleString()} views
              </p>
            </div>
          </div>
          <div>
            <FiHome className="h-5 w-5 text-primary-600" />
          </div>
        </div>
      ))}
    </div>
  );
};

const VisitorsStats = ({ data }) => {
  // Ensure data exists and has required properties
  if (!data || !data.dailyVisits || !data.weeklyLabels) {
    return (
      <div className="dashboard-card">
        <h3 className="text-base font-medium mb-4">Visitors & Page Views</h3>
        <p className="text-gray-500 text-center py-8">
          No visitor data available
        </p>
      </div>
    );
  }

  const chartData = data.dailyVisits.map((value, index) => ({
    name: data.weeklyLabels[index] || `Day ${index + 1}`,
    visits: value || 0,
    pageViews: data.dailyPageViews
      ? data.dailyPageViews[index]
      : (value || 0) * 2.8,
  }));

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-medium mb-4">Visitors & Page Views</h3>
      <div className="h-64">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="#0284c7"
              strokeWidth={2}
              name="Visitors"
            />
            <Line
              type="monotone"
              dataKey="pageViews"
              stroke="#10b981"
              strokeWidth={2}
              name="Page Views"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PropertyPerformance = ({ data }) => {
  if (!data || !data.mostViewed) return null;

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-medium mb-4">Property Performance</h3>
      <div className="space-y-4">
        {data.mostViewed.slice(0, 5).map((property, index) => (
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
                <p className="text-xs text-gray-500">{property.location}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{property.views} views</p>
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

const VisitorInsights = ({ data }) => {
  if (!data) return null;

  return (
    <div className="dashboard-card">
      <h3 className="text-base font-medium mb-4">Visitor Insights</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <FiUsers className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{data.unique || 0}</p>
          <p className="text-sm text-gray-600">Unique Visitors</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <FiTrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">
            {data.returning || 0}
          </p>
          <p className="text-sm text-gray-600">Returning Visitors</p>
        </div>
      </div>

      {data.geographic && data.geographic.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Top Locations</h4>
          <div className="space-y-2">
            {data.geographic.slice(0, 3).map((location, index) => (
              <div
                key={index}
                className="flex justify-between items-center"
              >
                <span className="text-sm">
                  {location._id.city}, {location._id.country}
                </span>
                <span className="text-sm font-medium">{location.visitors}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsCharts = ({
  analyticsData,
  realtimeData,
  visitorData,
  propertyData,
  timeRange,
}) => {
  if (!analyticsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="dashboard-card">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Visitors Chart - Takes 2 columns on large screens */}
      <div className="lg:col-span-2">
        <VisitorsStats data={analyticsData} />
      </div>

      {/* Device Stats */}
      <DeviceStats data={analyticsData.deviceStats} />

      {/* Top Cities */}
      <TopCities data={analyticsData.topCities} />

      {/* Visitor Insights */}
      {visitorData && <VisitorInsights data={visitorData} />}

      {/* Property Performance */}
      {propertyData && <PropertyPerformance data={propertyData} />}

      {/* Top Properties - Takes full width */}
      <div className="lg:col-span-3">
        <TopProperties data={analyticsData.topProperties} />
      </div>
    </div>
  );
};

export default AnalyticsCharts;
