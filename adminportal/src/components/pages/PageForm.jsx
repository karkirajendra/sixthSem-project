import { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { validatePage } from '../../utils/pageValidation';
import { PAGE_TYPE_OPTIONS, PAGE_STATUS_OPTIONS } from '../../utils/constants';

const PageForm = ({ initialData, onSave, onCancel, isDark, isLoading }) => {
  const [page, setPage] = useState(
    initialData || {
      title: '',
      type: 'about',
      content: '',
      status: 'draft',
      featuredImage: null,
      seoMeta: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
      },
    }
  );
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setPage(initialData);
      setImagePreview(initialData.featuredImage || null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('seoMeta.')) {
      const field = name.split('.')[1];
      setPage((prev) => ({
        ...prev,
        seoMeta: {
          ...prev.seoMeta,
          [field]:
            field === 'keywords'
              ? value
                  .split(',')
                  .map((k) => k.trim())
                  .filter((k) => k)
              : value,
        },
      }));
    } else {
      setPage((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleContentChange = (content) => {
    setPage((prev) => ({ ...prev, content }));
    // Clear content error when user starts typing
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setPage((prev) => ({ ...prev, featuredImage: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setPage((prev) => ({ ...prev, featuredImage: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validatePage(page);
    setErrors(validationErrors);

    if (isValid) {
      await onSave(page);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'align',
    'color',
    'background',
    'script',
    'direction',
  ];

  return (
    <div
      className={`rounded-xl shadow-xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } p-6`}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Title Field */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Page Title *
          </label>
          <input
            type="text"
            name="title"
            value={page.title || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Enter page title"
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Type and Status Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Page Type *
            </label>
            <select
              name="type"
              value={page.type || 'about'}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${errors.type ? 'border-red-500' : ''}`}
              disabled={isLoading}
            >
              {PAGE_TYPE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Status *
            </label>
            <select
              name="status"
              value={page.status || 'draft'}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={isLoading}
            >
              {PAGE_STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Image Field */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Featured Image
          </label>
          <div className="flex items-start space-x-4">
            {imagePreview && (
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-lg border-2 border-gray-300 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4'
                    : 'bg-white border-gray-300 text-gray-900 file:bg-gray-100 file:text-gray-700 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4'
                }`}
                disabled={isLoading}
              />
              <p
                className={`mt-1 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Content Field */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Page Content *
          </label>
          <div
            className={`${
              errors.content ? 'border-red-500 border rounded-lg' : ''
            }`}
          >
            <ReactQuill
              theme="snow"
              value={page.content || ''}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              className={`${isDark ? 'quill-dark' : ''}`}
              style={{
                backgroundColor: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
              }}
              readOnly={isLoading}
            />
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        {/* SEO Metadata Section */}
        <div
          className={`rounded-lg border p-4 ${
            isDark
              ? 'border-gray-600 bg-gray-700/50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <h3
            className={`text-lg font-medium mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            SEO Metadata
          </h3>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Meta Title
              </label>
              <input
                type="text"
                name="seoMeta.metaTitle"
                value={page.seoMeta?.metaTitle || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="SEO title for search engines"
                maxLength="60"
                disabled={isLoading}
              />
              <p
                className={`mt-1 text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Recommended: 50-60 characters. Currently:{' '}
                {page.seoMeta?.metaTitle?.length || 0}/60
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Meta Description
              </label>
              <textarea
                name="seoMeta.metaDescription"
                value={page.seoMeta?.metaDescription || ''}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Brief description of the page for search engines"
                maxLength="160"
                disabled={isLoading}
              />
              <p
                className={`mt-1 text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Recommended: 150-160 characters. Currently:{' '}
                {page.seoMeta?.metaDescription?.length || 0}/160
              </p>
            </div>

            {/* Keywords */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Keywords
              </label>
              <input
                type="text"
                name="seoMeta.keywords"
                value={page.seoMeta?.keywords?.join(', ') || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter keywords separated by commas"
                disabled={isLoading}
              />
              <p
                className={`mt-1 text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Separate multiple keywords with commas (e.g., rooms, rental,
                accommodation)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-2 border rounded-lg font-medium transition-colors duration-200 ${
              isDark
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
            disabled={isLoading}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isLoading
              ? 'Saving...'
              : initialData?.id
              ? 'Update Page'
              : 'Create Page'}
          </button>
        </div>
      </form>

      {/* Custom CSS for dark mode Quill editor */}
      <style jsx>{`
        .quill-dark .ql-toolbar {
          background-color: #4b5563;
          border-color: #6b7280;
        }
        .quill-dark .ql-toolbar .ql-stroke {
          stroke: #e5e7eb;
        }
        .quill-dark .ql-toolbar .ql-fill {
          fill: #e5e7eb;
        }
        .quill-dark .ql-toolbar .ql-picker-label {
          color: #e5e7eb;
        }
        .quill-dark .ql-container {
          background-color: #374151;
          border-color: #6b7280;
          color: #e5e7eb;
        }
        .quill-dark .ql-editor {
          color: #e5e7eb;
        }
        .quill-dark .ql-editor.ql-blank::before {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default PageForm;
