import { useState, useEffect } from 'react';
import UserTable from '../components/users/UserTable';
import { useAppContext } from '../context/AppContext';
import { FiUsers, FiUserCheck, FiTrendingUp, FiActivity } from 'react-icons/fi';

const Users = ({ isDark }) => {
  const { users, fetchUsers } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    growthRate: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        await fetchUsers();
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fetchUsers]);

  useEffect(() => {
    // Calculate user statistics
    if (users && users.length > 0) {
      const total = users.length;
      const active = users.filter((user) => user.status === 'active').length;

      const currentDate = new Date();
      const newThisMonth = users.filter((user) => {
        const userDate = new Date(user.createdAt);
        return (
          userDate.getMonth() === currentDate.getMonth() &&
          userDate.getFullYear() === currentDate.getFullYear()
        );
      }).length;

      const lastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1
      );
      const newLastMonth = users.filter((user) => {
        const userDate = new Date(user.createdAt);
        return (
          userDate.getMonth() === lastMonth.getMonth() &&
          userDate.getFullYear() === lastMonth.getFullYear()
        );
      }).length;

      const growthRate =
        newLastMonth > 0
          ? ((newThisMonth - newLastMonth) / newLastMonth) * 100
          : newThisMonth > 0
          ? 100
          : 0;

      setUserStats({
        total,
        active,
        newThisMonth,
        growthRate,
      });
    }
  }, [users]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: userStats.total,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      textColor: isDark ? 'text-blue-400' : 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: userStats.active,
      icon: FiUserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
      textColor: isDark ? 'text-green-400' : 'text-green-600',
    },
    {
      title: 'New This Month',
      value: userStats.newThisMonth,
      icon: FiActivity,
      color: 'from-purple-500 to-purple-600',
      bgColor: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
      textColor: isDark ? 'text-purple-400' : 'text-purple-600',
    },
    {
      title: 'Growth Rate',
      value: `${
        userStats.growthRate > 0 ? '+' : ''
      }${userStats.growthRate.toFixed(1)}%`,
      icon: FiTrendingUp,
      color:
        userStats.growthRate >= 0
          ? 'from-teal-500 to-teal-600'
          : 'from-red-500 to-red-600',
      bgColor: isDark
        ? userStats.growthRate >= 0
          ? 'bg-teal-900/20'
          : 'bg-red-900/20'
        : userStats.growthRate >= 0
        ? 'bg-teal-50'
        : 'bg-red-50',
      textColor: isDark
        ? userStats.growthRate >= 0
          ? 'text-teal-400'
          : 'text-red-400'
        : userStats.growthRate >= 0
        ? 'text-teal-600'
        : 'text-red-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1
            className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Users Management
          </h1>
          <p
            className={`text-lg ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mt-2`}
          >
            Monitor and manage all platform users with comprehensive insights
          </p>
        </div>

        {/* Decorative Element */}
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`${
                stat.bgColor
              } border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor} mb-2`}>
                    {stat.title}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                >
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div
        className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-xl border ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        } overflow-hidden`}
      >
        <div className="p-6">
          <UserTable isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default Users;
