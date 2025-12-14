import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useParams } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import PageStats from '../components/pages/PageStats';
import PageForm from '../components/pages/PageForm';
import PageTable from '../components/pages/PageTable';
import PageView from '../components/pages/PageView';
import { getPages, getPageById, savePage, deletePage } from '../utils/pageApi';

const Pages = ({ isDark }) => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true);
        const data = await getPages();
        setPages(data);
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleSave = async (pageData) => {
    try {
      setIsSaving(true);
      const savedPage = await savePage(pageData);
      if (pageData.id) {
        setPages(
          pages.map((page) => (page.id === pageData.id ? savedPage : page))
        );
      } else {
        setPages([...pages, savedPage]);
      }
      navigate('/pages');
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        setIsDeleting(true);
        await deletePage(pageId);
        setPages(pages.filter((page) => page.id !== pageId));
        navigate('/pages');
      } catch (error) {
        console.error('Error deleting page:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (page) => {
    navigate(`/pages/edit/${page.id}`);
  };

  const handleView = (page) => {
    navigate(`/pages/view/${page.id}`);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-full border-4 ${
                isDark ? 'border-blue-900' : 'border-blue-200'
              }`}
            ></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Loading pages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <Routes>
        <Route
          path="/view/:id"
          element={
            <PageViewWrapper
              pages={pages}
              isDark={isDark}
              onEdit={handleEdit}
            />
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PageEditWrapper
              pages={pages}
              isDark={isDark}
              onSave={handleSave}
              navigate={navigate}
              isSaving={isSaving}
            />
          }
        />
        <Route
          path="/add"
          element={
            <PageAddWrapper
              isDark={isDark}
              onSave={handleSave}
              navigate={navigate}
              isSaving={isSaving}
            />
          }
        />
        <Route
          path="/"
          element={
            <PageListWrapper
              pages={pages}
              isDark={isDark}
              navigate={navigate}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          }
        />
      </Routes>
    </div>
  );
};

// Wrapper component for page view
const PageViewWrapper = ({ pages, isDark, onEdit }) => {
  const { id } = useParams();
  const page = pages.find((page) => page.id === id);

  return (
    <PageView
      page={page}
      isDark={isDark}
      onEdit={onEdit}
    />
  );
};

// Wrapper component for page edit
const PageEditWrapper = ({ pages, isDark, onSave, navigate, isSaving }) => {
  const { id } = useParams();
  const page = pages.find((page) => page.id === id);

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
            }`}
          >
            Back to Pages
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        <h1
          className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Edit Page
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
      </div>
      <PageForm
        initialData={page}
        onSave={onSave}
        onCancel={() => navigate('/pages')}
        isDark={isDark}
        isLoading={isSaving}
      />
    </>
  );
};

// Wrapper component for page add
const PageAddWrapper = ({ isDark, onSave, navigate, isSaving }) => {
  return (
    <>
      <div className="flex flex-col space-y-4">
        <h1
          className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Add New Page
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
      </div>
      <PageForm
        initialData={{
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
        }}
        onSave={onSave}
        onCancel={() => navigate('/pages')}
        isDark={isDark}
        isLoading={isSaving}
      />
    </>
  );
};

// Wrapper component for page list
const PageListWrapper = ({
  pages,
  isDark,
  navigate,
  onEdit,
  onView,
  onDelete,
  isDeleting,
}) => {
  return (
    <>
      <div className="flex flex-col space-y-4">
        <div>
          <h1
            className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Page Management
          </h1>
          <p
            className={`text-lg ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mt-2`}
          >
            Create and manage all website pages and content
          </p>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/pages/add')}
            className="btn-primary flex items-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add New Page
          </button>
        </div>
      </div>

      <PageStats
        pages={pages}
        isDark={isDark}
      />

      <div
        className={`rounded-xl shadow-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } overflow-hidden`}
      >
        <div
          className={`px-6 py-4 border-b ${
            isDark
              ? 'border-gray-700 bg-gray-900/50'
              : 'border-gray-200 bg-gray-50/50'
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            All Pages
          </h2>
          <p
            className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mt-1`}
          >
            Manage website pages, content, and status
          </p>
        </div>
        <PageTable
          pages={pages}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          isDark={isDark}
          isLoading={isDeleting}
        />
      </div>
    </>
  );
};

export default Pages;
