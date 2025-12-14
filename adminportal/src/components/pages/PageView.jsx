import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { PAGE_TYPES } from '../../utils/constants';

const PageView = ({ page, isDark, onEdit }) => {
  const navigate = useNavigate();

  if (!page) {
    return (
      <div
        className={`rounded-xl shadow-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6`}
      >
        <div className="text-center py-8">
          <p
            className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Page not found
          </p>
          <button
            onClick={() => navigate('/pages')}
            className={`mt-4 inline-flex items-center ${
              isDark
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-blue-600 hover:text-blue-800'
            } transition-colors duration-200`}
          >
            <FiArrowLeft className="mr-2" />
            Back to Pages
          </button>
        </div>
      </div>
    );
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case PAGE_TYPES.ABOUT:
        return 'About Us';
      case PAGE_TYPES.TERMS:
        return 'Terms & Conditions';
      case PAGE_TYPES.PRIVACY:
        return 'Privacy Policy';
      case PAGE_TYPES.BLOG:
        return 'Blog Post';
      case PAGE_TYPES.CUSTOM:
        return 'Custom Page';
      default:
        return type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`rounded-xl shadow-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/pages')}
            className={`flex items-center ${
              isDark
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-blue-600 hover:text-blue-800'
            } transition-colors duration-200`}
          >
            <FiArrowLeft className="mr-2" />
            Back to Pages
          </button>
          <button
            onClick={() => onEdit(page)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isDark
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } transition-colors duration-200`}
          >
            <FiEdit2 className="mr-2" />
            Edit Page
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h1
              className={`text-3xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-4`}
            >
              {page.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  page.status === 'published'
                    ? isDark
                      ? 'bg-green-900/50 text-green-300'
                      : 'bg-green-100 text-green-800'
                    : page.status === 'archived'
                    ? isDark
                      ? 'bg-gray-900/50 text-gray-300'
                      : 'bg-gray-100 text-gray-800'
                    : isDark
                    ? 'bg-yellow-900/50 text-yellow-300'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {page.status.charAt(0).toUpperCase() +
                  page.status.slice(1).toLowerCase()}
              </span>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {getTypeLabel(page.type)}
              </span>
              <span
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Last updated:{' '}
                {new Date(page.lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {page.featuredImage && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={page.featuredImage}
                alt={page.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
            <div
              className={`${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } leading-relaxed`}
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageView;
