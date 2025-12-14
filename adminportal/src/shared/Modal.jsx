import { useAppContext } from '../context/AppContext';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  isDark
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
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className={contentStyles} onClick={e => e.stopPropagation()}>
          {title && (
            <h3 className="text-lg font-medium leading-6 mb-4">
              {title}
            </h3>
          )}
          <div className="mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;