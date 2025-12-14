import { useState, useEffect } from 'react';
import { FaList, FaEye, FaEnvelope, FaRegChartBar } from 'react-icons/fa';
import { getSellerDashboardStats } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SellerDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // In a real app, we would pass the current user ID
        const data = await getSellerDashboardStats(currentUser?.id || 2);
        setStats(data);
      } catch (error) {
        console.error('Error loading seller stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [currentUser]);

  // Chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Property Views',
        data: stats?.viewsChartData || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#3b82f6',
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Views Over Last 7 Days',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {currentUser?.name || 'User'}</h1>
        <p className="text-gray-600">Here's how your properties are performing</p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-lg shadow-sm animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Listings" 
            value={stats?.totalListings || 0} 
            icon={<FaList className="text-xl" />} 
            color="blue"
          />
          
          <StatCard 
            title="Total Views" 
            value={stats?.totalViews || 0} 
            icon={<FaEye className="text-xl" />} 
            color="green"
            change={15}
          />
          
          <StatCard 
            title="Total Inquiries" 
            value={stats?.totalInquiries || 0} 
            icon={<FaEnvelope className="text-xl" />} 
            color="purple"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Property Views Trend</h2>
            <div className="flex items-center text-sm text-gray-500">
              <span>Last 7 days</span>
            </div>
          </div>
          
          {loading ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
              <FaRegChartBar className="text-4xl text-gray-300" />
            </div>
          ) : (
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
        
        {/* View Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Views Breakdown</h2>
          
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse h-4 bg-gray-300 rounded w-full mb-6"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                      View Distribution
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primary-600">
                      {stats?.totalViews || 0} total views
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: `${stats?.loggedInViews ? (stats.loggedInViews / stats.totalViews) * 100 : 0}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                  <div 
                    style={{ width: `${stats?.anonymousViews ? (stats.anonymousViews / stats.totalViews) * 100 : 0}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h4 className="text-sm font-medium text-gray-700">Logged In Views</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 mt-2">{stats?.loggedInViews || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.loggedInViews && stats?.totalViews
                      ? Math.round((stats.loggedInViews / stats.totalViews) * 100)
                      : 0}% of total
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <h4 className="text-sm font-medium text-gray-700">Anonymous Views</h4>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 mt-2">{stats?.anonymousViews || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.anonymousViews && stats?.totalViews
                      ? Math.round((stats.anonymousViews / stats.totalViews) * 100)
                      : 0}% of total
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex items-center border-b border-gray-100 pb-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <FaEye className="text-green-600" />
                </div>
                <div>
                  <p className="text-gray-700">Someone viewed your Modern Apartment</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FaEnvelope className="text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-700">New inquiry for Spacious Family House</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <FaEye className="text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-700">3 people viewed your Luxury Villa</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <FaList className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-gray-700">You added Studio Apartment listing</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;