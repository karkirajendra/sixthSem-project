import { useState, useEffect } from 'react';
import { getFeedback, updateFeedback, deleteFeedback } from '../utils/adminApi';
import {
  FiThumbsUp,
  FiThumbsDown,
  FiStar,
  FiCheck,
  FiTrash2,
} from 'react-icons/fi';

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const feedbackData = await getFeedback();
        // Transform the data to match frontend expectations
        const transformedFeedback = feedbackData.map((item) => ({
          id: item._id,
          user: item.user?.name || 'Unknown User',
          rating: item.rating || 5,
          comment: item.message || item.comment,
          date: new Date(item.createdAt).toLocaleDateString(),
          status:
            item.status === 'resolved'
              ? 'Approved'
              : item.status === 'pending'
              ? 'Pending'
              : item.status === 'dismissed'
              ? 'Rejected'
              : 'Pending',
          featured: item.featured || false,
          showOnFrontend: item.showOnFrontend || false,
        }));
        setFeedback(transformedFeedback);
      } catch (error) {
        console.error('Error fetching feedback data:', error);
        // Fallback to dummy data
        setFeedback([
          {
            id: 1,
            user: 'John Doe',
            rating: 5,
            comment: 'Great service! Found my dream apartment quickly.',
            date: '2024-02-20',
            status: 'Approved',
            featured: true,
            showOnFrontend: true,
          },
          {
            id: 2,
            user: 'Jane Smith',
            rating: 4,
            comment:
              'Very helpful platform, but could use some improvements in the search filters.',
            date: '2024-02-19',
            status: 'Pending',
            featured: false,
            showOnFrontend: false,
          },
          {
            id: 3,
            user: 'Mike Johnson',
            rating: 5,
            comment: "The best property rental platform I've used!",
            date: '2024-02-18',
            status: 'Approved',
            featured: true,
            showOnFrontend: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Convert frontend status to backend format
      const backendStatus =
        newStatus === 'Approved'
          ? 'resolved'
          : newStatus === 'Pending'
          ? 'pending'
          : newStatus === 'Rejected'
          ? 'dismissed'
          : 'pending';
      await updateFeedback(id, { status: backendStatus });
      setFeedback(
        feedback.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating feedback status:', error);
      // Optimistic update for fallback
      setFeedback(
        feedback.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    }
  };

  const handleFeatureToggle = async (id) => {
    try {
      const feedbackItem = feedback.find((item) => item.id === id);
      await updateFeedback(id, { featured: !feedbackItem.featured });
      setFeedback(
        feedback.map((item) =>
          item.id === id ? { ...item, featured: !item.featured } : item
        )
      );
    } catch (error) {
      console.error('Error updating feedback feature status:', error);
      // Optimistic update for fallback
      setFeedback(
        feedback.map((item) =>
          item.id === id ? { ...item, featured: !item.featured } : item
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  const handleFrontendDisplay = async (id) => {
    try {
      const feedbackItem = feedback.find((item) => item.id === id);
      await updateFeedback(id, {
        showOnFrontend: !feedbackItem.showOnFrontend,
      });
      setFeedback(
        feedback.map((item) =>
          item.id === id
            ? { ...item, showOnFrontend: !item.showOnFrontend }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating feedback frontend display:', error);
      // Optimistic update for fallback
      setFeedback(
        feedback.map((item) =>
          item.id === id
            ? { ...item, showOnFrontend: !item.showOnFrontend }
            : item
        )
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this feedback? This action cannot be undone.'
      )
    ) {
      try {
        const result = await deleteFeedback(id);
        if (result.success) {
          setFeedback(feedback.filter((item) => item.id !== id));
        } else {
          alert('Failed to delete feedback: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Error deleting feedback. Please try again.');
      }
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'featured') return item.featured;
    if (filter === 'frontend') return item.showOnFrontend;
    if (filter === 'approved') return item.status === 'Approved';
    if (filter === 'pending') return item.status === 'Pending';
    if (filter === 'rejected') return item.status === 'Rejected';
    return item.status.toLowerCase() === filter;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Feedback Management
        </h1>
        <p className="text-sm text-gray-500">
          Review and manage customer feedback
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {feedback.length}
          </div>
          <div className="text-sm text-gray-500">Total Feedback</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {feedback.filter((f) => f.status === 'Approved').length}
          </div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {feedback.filter((f) => f.status === 'Pending').length}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {feedback.filter((f) => f.featured).length}
          </div>
          <div className="text-sm text-gray-500">Featured</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {feedback.filter((f) => f.showOnFrontend).length}
          </div>
          <div className="text-sm text-gray-500">On Frontend</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Feedback</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="featured">Featured</option>
            <option value="frontend">Showing on Frontend</option>
          </select>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className="p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="font-medium text-gray-900">{item.user}</div>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="text-sm text-gray-500">{item.date}</div>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="flex">
                      {[...Array(item.rating)].map((_, i) => (
                        <FiStar
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{item.comment}</p>
                </div>
                <div className="ml-4 flex space-x-2">
                  {item.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(item.id, 'Approved')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="Approve feedback"
                      >
                        <FiThumbsUp className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'Rejected')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Reject feedback"
                      >
                        <FiThumbsDown className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleFeatureToggle(item.id)}
                        className={`p-2 rounded-full ${
                          item.featured
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={
                          item.featured
                            ? 'Remove from featured'
                            : 'Add to featured'
                        }
                      >
                        <FiStar
                          className={`h-5 w-5 ${
                            item.featured ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleFrontendDisplay(item.id)}
                        className={`p-2 rounded-full ${
                          item.showOnFrontend
                            ? 'text-purple-600 hover:bg-purple-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={
                          item.showOnFrontend
                            ? 'Remove from frontend'
                            : 'Show on frontend'
                        }
                      >
                        <FiCheck
                          className={`h-5 w-5 ${
                            item.showOnFrontend ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Delete feedback"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.status}
                </span>
                {item.featured && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
                {item.showOnFrontend && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    On Frontend
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
