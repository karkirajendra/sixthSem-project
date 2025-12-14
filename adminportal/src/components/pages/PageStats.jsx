import { FiFileText, FiGlobe, FiBook, FiLock } from 'react-icons/fi';

const PageStats = ({ pages, isDark }) => {
  const stats = [
    {
      title: 'Total Pages',
      value: pages.length,
      icon: FiFileText,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Published',
      value: pages.filter((page) => page.status === 'published').length,
      icon: FiGlobe,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Drafts',
      value: pages.filter((page) => page.status === 'draft').length,
      icon: FiBook,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Legal Pages',
      value: pages.filter((page) => ['terms', 'privacy'].includes(page.type))
        .length,
      icon: FiLock,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            } border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  } mb-2`}
                >
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
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}
              >
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PageStats;
