import { useState, useEffect } from 'react';
import AnalyticsCharts from '../components/analytics/AnalyticsCharts';
import RealtimeAnalytics from '../components/analytics/RealtimeAnalytics';
import AdvancedAnalytics from '../components/analytics/AdvancedAnalytics';
import {
  getAnalyticsData,
  getRealtimeAnalytics,
  getVisitorAnalytics,
  getPropertyAnalytics,
} from '../utils/adminApi';
import { usePageView } from '../hooks/useAnalytics';
import {
  FiActivity,
  FiUsers,
  FiBarChart2,
  FiCalendar,
  FiMonitor,
  FiRefreshCw,
  FiTrendingUp,
} from 'react-icons/fi';

const Analytics = () => {
  // Track page view
  usePageView('Analytics Dashboard');

  const [timeRange, setTimeRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [visitorData, setVisitorData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [analytics, realtime, visitors, properties] = await Promise.all([
        getAnalyticsData(timeRange),
        getRealtimeAnalytics(),
        getVisitorAnalytics(timeRange),
        getPropertyAnalytics(timeRange),
      ]);

      setAnalyticsData(analytics);
      setRealtimeData(realtime);
      setVisitorData(visitors);
      setPropertyData(properties);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);

      // Fallback to mock data
      setAnalyticsData({
        dailyVisits: [450, 680, 520, 750, 630, 820, 950],
        weeklyLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        totalVisitors: 15672,
        totalPageViews: 42893,
        conversionRate: 3.2,
        avgSessionTime: '4m 32s',
        topCities: [
          { city: 'Kathmandu', visits: 4500 },
          { city: 'Pokhara', visits: 3200 },
          { city: 'Lalitpur', visits: 2800 },
          { city: 'Bhaktapur', visits: 2300 },
          { city: 'Biratnagar', visits: 2100 },
        ],
        deviceStats: {
          mobile: 45,
          desktop: 40,
          tablet: 15,
        },
        topProperties: [
          { title: 'Luxury Downtown Apartment', views: 1850 },
          { title: 'Modern Studio Near Campus', views: 1560 },
          { title: 'Cozy 2BR in Suburbs', views: 1340 },
          { title: 'Penthouse with City View', views: 1220 },
          { title: 'Shared Student Housing', views: 980 },
        ],
      });

      setRealtimeData({
        activeSessions: 24,
        recentPageViews: 156,
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // Auto-refresh realtime data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const realtime = await getRealtimeAnalytics();
        setRealtimeData(realtime);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error refreshing realtime data:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">
            View site performance and visitor insights
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400">
                Last updated: {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>

          <div className="inline-flex bg-white rounded-md shadow-sm">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                timeRange === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                timeRange === 'year'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Real-time metrics bar */}
      {realtimeData && (
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
              <div>
                <span className="text-xs text-blue-100">Active Sessions</span>
                <p className="text-lg font-bold">
                  {realtimeData.activeSessions || 0}
                </p>
              </div>
              <div>
                <span className="text-xs text-blue-100">Page Views (24h)</span>
                <p className="text-lg font-bold">
                  {realtimeData.recentPageViews || 0}
                </p>
              </div>
            </div>
            <FiMonitor className="h-8 w-8 text-blue-200" />
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card bg-blue-50 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Visitors</p>
              <p className="text-xl font-bold">
                {analyticsData?.totalVisitors?.toLocaleString() || '15,672'}
              </p>
              <p className="text-xs text-blue-500">+12.5% from last week</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-green-50 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FiActivity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Page Views</p>
              <p className="text-xl font-bold">
                {analyticsData?.totalPageViews?.toLocaleString() || '42,893'}
              </p>
              <p className="text-xs text-green-500">+8.2% from last week</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-purple-50 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <FiBarChart2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">
                Conversion Rate
              </p>
              <p className="text-xl font-bold">
                {analyticsData?.conversionRate || '3.2'}%
              </p>
              <p className="text-xs text-purple-500">+0.8% from last week</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-amber-50 border border-amber-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 mr-4">
              <FiCalendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600">
                Avg. Session Time
              </p>
              <p className="text-xl font-bold">
                {analyticsData?.avgSessionTime || '4m 32s'}
              </p>
              <p className="text-xs text-amber-500">+12s from last week</p>
            </div>
          </div>
        </div>
      </div>

      <AnalyticsCharts
        analyticsData={analyticsData}
        realtimeData={realtimeData}
        visitorData={visitorData}
        propertyData={propertyData}
        timeRange={timeRange}
      />

      {/* Advanced Analytics Section */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiTrendingUp className="mr-2" />
            Advanced Analytics
          </h2>
          <p className="text-sm text-gray-500">
            Detailed insights and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time analytics takes 1 column */}
          <div>
            <RealtimeAnalytics />
          </div>

          {/* Advanced analytics takes 2 columns */}
          <div className="lg:col-span-2">
            <AdvancedAnalytics timeRange={timeRange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
