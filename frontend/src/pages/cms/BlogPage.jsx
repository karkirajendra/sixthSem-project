// src/pages/BlogPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts, getBlogCategories, getBlogTags } from '../../api/cmsApi';
import { format } from 'date-fns';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        const [postsData, categoriesData, tagsData] = await Promise.all([
          getBlogPosts(),
          getBlogCategories(),
          getBlogTags()
        ]);
        
        // Adjust based on your API response structure
        setPosts(postsData.data || postsData.posts || []);
        setCategories(categoriesData.data || categoriesData || []);
        setTags(tagsData.data || tagsData || []);
      } catch (error) {
        console.error('Error loading blog data:', error);
        // Fallback to empty arrays
        setPosts([]);
        setCategories([]);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    const matchesSearch = !searchQuery || 
      (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 py-20 text-white shadow-2xl">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">RoomSathi Blog</h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-xl md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed font-reugular">
            Expert advice, market trends, and tips for finding your perfect home in Nepal
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-lg mx-auto relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blog posts..."
                className="w-full px-6 py-4 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl border-2 border-white/20 backdrop-blur-sm bg-white/95"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute right-4 top-4 h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7l2 2-2 2-2-2 2-2zM5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Categories
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    !selectedCategory
                      ? 'bg-blue-100 text-blue-700 shadow-md border-2 border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm border-2 border-transparent'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700 shadow-md border-2 border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm border-2 border-transparent'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 font-medium border-2 ${
                      selectedTag === tag
                        ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Blog Posts */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-xl w-3/4 mb-6"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-8">
                {filteredPosts.map(post => (
                  <article key={post._id || post.id} className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden hover:shadow-2xl group">
                    {post.featuredImage && (
                      <div className="h-64 sm:h-80 bg-gray-200 overflow-hidden relative">
                        <img 
                          src={post.featuredImage} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                          <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span className="font-medium">{format(new Date(post.publishedAt || post.createdAt || post.date), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-200">
                          {post.category}
                        </div>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
                        <Link 
                          to={`/blog/${post.slug}`}
                          className="hover:text-blue-600 transition-colors duration-300"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed text-lg">{post.excerpt}</p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {post.tags && post.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag}
                              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags && post.tags.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        <Link
                          to={`/blog/${post.slug}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                        >
                          Read More
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-12 text-center">
                <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <svg
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No Posts Found</h2>
                <div className="w-16 h-1 bg-gray-300 mx-auto mb-6"></div>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  We couldn't find any posts matching your criteria. Try adjusting your filters or search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedTag(null);
                    setSearchQuery('');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;