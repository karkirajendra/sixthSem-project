import { useAppContext } from '../context/AppContext';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600',
  loading = false,
  isDark,
}) => {
  if (!isOpen) return null;

  const dialogStyles = `fixed inset-0 z-50 overflow-y-auto transition-all duration-200 ${
    isDark ? 'bg-gray-900 bg-opacity-80' : 'bg-black bg-opacity-50'
  }`;

  const contentStyles = `inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform ${
    isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
  } shadow-xl rounded-2xl`;

  return (
    <div className={dialogStyles}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className={contentStyles}>
          <h3 className="text-lg font-medium leading-6 mb-4">{title}</h3>
          <div className="mt-2">
            <p className="text-sm">{message}</p>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${confirmButtonClass} ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
