import { useState, useEffect } from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import ChartPlaceholder from '../components/dashboard/ChartPlaceholder';
import RecentListings from '../components/dashboard/RecentListings';
import { useAppContext } from '../context/AppContext';
import { adminApi } from '../utils/adminApi';
import {
  FiUsers,
  FiHome,
  FiUserCheck,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = ({ isDark }) => {
  const { properties, fetchProperties } = useAppContext();
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalVisits: 0,
    activeSellers: 0,
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Helper function to add delay between API calls
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        // Fetch dashboard stats first
        const stats = await adminApi.getDashboardStats();
        // Ensure we always have a valid stats object
        if (stats && typeof stats === 'object') {
          setDashboardStats({
            totalUsers: stats.totalUsers || 0,
            totalListings: stats.totalListings || 0,
            totalVisits: stats.totalVisits || 0,
            activeSellers: stats.activeSellers || 0,
          });
        } else {
          // Use fallback data if stats is null/undefined
          setDashboardStats({
            totalUsers: 1845,
            totalListings: 672,
            totalVisits: 9243,
            activeSellers: 328,
          });
        }

        // Add delay before next API call
        await delay(500);

        // Fetch analytics data
        const analytics = await adminApi.getAnalytics();
        setAnalyticsData(analytics);

        // Add delay before next API call
        await delay(500);

        // Fetch recent listings
        const listings = await adminApi.getRecentListings(4);
        setRecentListings(listings);

        // Add delay before properties fetch
        await delay(500);

        // Fetch properties separately to avoid dependency issues
        try {
          await fetchProperties();
        } catch (error) {
          console.error('Error fetching properties:', error);
          // Don't fail the entire dashboard if properties fail
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use fallback data
        setDashboardStats({
          totalUsers: 1845,
          totalListings: 672,
          totalVisits: 9243,
          activeSellers: 328,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array - only run once on mount

  // Use analytics data or fallback to mock data
  const weeklyPerformanceData = analyticsData?.dailyVisits
    ? analyticsData.weeklyLabels?.map((label, index) => ({
        name: label,
        users: analyticsData.dailyVisits[index] || 0,
      }))
    : [
        { name: 'Sun', users: 120 },
        { name: 'Mon', users: 210 },
        { name: 'Tue', users: 180 },
        { name: 'Wed', users: 250 },
        { name: 'Thu', users: 220 },
        { name: 'Fri', users: 300 },
        { name: 'Sat', users: 280 },
      ];

  const listingsByLocationData = analyticsData?.topCities || [
    { name: 'Bhaktapur', value: 185 },
    { name: 'Lalitpur', value: 142 },
    { name: 'Boudha', value: 98 },
    { name: 'Chabahil', value: 76 },
    { name: 'Gokarna', value: 63 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

  return (
    <div
      className={`p-6 ${
        isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Welcome back! Here's what's happening with your platform today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={(dashboardStats?.totalUsers || 0).toLocaleString()}
              icon={<FiUsers className="h-5 w-5" />}
              percentage={12.5}
              isIncrease={true}
              isDark={isDark}
            />
            <StatsCard
              title="Total Listings"
              value={(dashboardStats?.totalListings || 0).toLocaleString()}
              icon={<FiHome className="h-5 w-5" />}
              percentage={8.2}
              isIncrease={true}
              isDark={isDark}
            />
            <StatsCard
              title="Active Sellers"
              value={(dashboardStats?.activeSellers || 0).toLocaleString()}
              icon={<FiUserCheck className="h-5 w-5" />}
              percentage={5.1}
              isIncrease={true}
              isDark={isDark}
            />
            <StatsCard
              title="Total Visits"
              value={(dashboardStats?.totalVisits || 0).toLocaleString()}
              icon={<FiActivity className="h-5 w-5" />}
              percentage={15.3}
              isIncrease={true}
              isDark={isDark}
            />
          </div>

          {/* Charts & Recent Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div
                className={`rounded-xl shadow-sm p-6 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className="text-lg font-semibold mb-4">
                  User Growth (This Week)
                </h3>
                <div className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={weeklyPerformanceData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? '#4B5563' : '#E5E7EB'}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={isDark ? '#9CA3AF' : '#6B7280'}
                      />
                      <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Tooltip
                        contentStyle={
                          isDark
                            ? {
                                backgroundColor: '#1F2937',
                                borderColor: '#374151',
                                borderRadius: '0.5rem',
                              }
                            : null
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div
                className={`rounded-xl shadow-sm p-6 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className="text-lg font-semibold mb-4">
                  Listings by Location
                </h3>
                <div className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={listingsByLocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {listingsByLocationData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={
                          isDark
                            ? {
                                backgroundColor: '#1F2937',
                                borderColor: '#374151',
                                borderRadius: '0.5rem',
                              }
                            : null
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div>
              <RecentListings
                listings={recentListings}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Weekly Performance */}
          <div
            className={`rounded-xl shadow-sm p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={weeklyPerformanceData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#4B5563' : '#E5E7EB'}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                  />
                  <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip
                    contentStyle={
                      isDark
                        ? {
                            backgroundColor: '#1F2937',
                            borderColor: '#374151',
                            borderRadius: '0.5rem',
                          }
                        : null
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="users"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
