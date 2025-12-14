import { useState, useEffect } from 'react';
import { getRealtimeAnalytics } from '../../utils/adminApi';
import {
  FiUsers,
  FiEye,
  FiActivity,
  FiClock,
  FiTrendingUp,
} from 'react-icons/fi';

const RealtimeAnalytics = () => {
  const [realtimeData, setRealtimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRealtimeData = async () => {
    try {
      const data = await getRealtimeAnalytics();
      setRealtimeData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching realtime data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRealtimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !realtimeData) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Real-time Activity</h3>
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <FiUsers className="h-6 w-6 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-blue-600">
            {realtimeData.activeSessions || 0}
          </p>
          <p className="text-xs text-gray-600">Active Users</p>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <FiEye className="h-6 w-6 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-600">
            {realtimeData.recentPageViews || 0}
          </p>
          <p className="text-xs text-gray-600">Views (24h)</p>
        </div>
      </div>

      {realtimeData.topPages && realtimeData.topPages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Most Viewed Pages</h4>
          <div className="space-y-2">
            {realtimeData.topPages.slice(0, 3).map((page, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600 truncate">
                  {page._id || 'Homepage'}
                </span>
                <span className="font-medium">{page.views}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {lastUpdated && (
        <div className="mt-4 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default RealtimeAnalytics;
