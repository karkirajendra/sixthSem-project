// src/pages/BlogPostPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPost } from '../../api/cmsApi';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import { FaCalendar, FaFolder, FaTags, FaArrowLeft, FaUser, FaClock } from 'react-icons/fa';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getBlogPost(slug);
        setPost(data);
      } catch (error) {
        console.error('Error loading blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return {
      __html: DOMPurify.sanitize(htmlContent || '')
    };
  };

  // Estimate reading time
  const estimateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      {/* Enhanced Header with Back Button */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 py-8 shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl"
          >
            <FaArrowLeft className="mr-3" />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-8 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-xl w-3/4 mb-8"></div>
              <div className="flex gap-4 mb-8">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ) : post ? (
            <article className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300">
              {/* Article Header */}
              <div className="p-8 md:p-12 border-b-2 border-gray-100">
                <header className="mb-8">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">{post.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                      <FaCalendar className="mr-2 text-blue-500" />
                      <span className="font-medium text-blue-700">
                        {format(new Date(post.publishedAt || post.createdAt || post.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    
                    {post.category && (
                      <div className="flex items-center bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                        <FaFolder className="mr-2 text-green-500" />
                        <span className="font-medium text-green-700">{post.category}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                      <FaClock className="mr-2 text-purple-500" />
                      <span className="font-medium text-purple-700">
                        {estimateReadingTime(post.content)} min read
                      </span>
                    </div>
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-start gap-3 mt-6">
                      <div className="flex items-center text-orange-600 font-medium">
                        <FaTags className="mr-2" />
                        <span>Tags:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <span
                            key={tag}
                            className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium border border-orange-200 hover:bg-orange-100 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </header>

                {post.featuredImage && (
                  <div className="mb-8">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-2xl shadow-xl border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none prose-p:mb-6 prose-p:leading-relaxed prose-h1:mb-8 prose-h1:text-gray-800 prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-4 prose-h2:mb-6 prose-h2:mt-10 prose-h2:text-blue-700 prose-h2:border-l-4 prose-h2:border-blue-300 prose-h2:pl-4 prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-gray-700 prose-ul:my-6 prose-li:mb-3 prose-ol:my-6 prose-strong:text-blue-600">
                  <div 
                    dangerouslySetInnerHTML={createMarkup(post.content)} 
                    className="blog-content space-y-6 [&>p]:mb-6 [&>p]:leading-relaxed [&>p]:text-gray-700 [&>h1]:mb-8 [&>h1]:mt-0 [&>h1]:text-gray-800 [&>h1]:border-b [&>h1]:border-gray-200 [&>h1]:pb-4 [&>h2]:mb-6 [&>h2]:mt-10 [&>h2]:text-blue-700 [&>h2]:border-l-4 [&>h2]:border-blue-300 [&>h2]:pl-4 [&>h2]:bg-blue-50 [&>h2]:py-3 [&>h2]:rounded-r-lg [&>h3]:mb-4 [&>h3]:mt-8 [&>h3]:text-gray-700 [&>h3]:font-semibold [&>ul]:my-6 [&>ul]:space-y-2 [&>ul>li]:mb-3 [&>ul>li]:pl-2 [&>ol]:my-6 [&>ol>li]:mb-3 [&>ol>li]:pl-2 [&>strong]:text-blue-600 [&>strong]:font-semibold [&>em]:text-gray-600 [&>blockquote]:border-l-4 [&>blockquote]:border-blue-300 [&>blockquote]:bg-blue-50 [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:my-6 [&>blockquote]:rounded-r-lg [&>img]:rounded-xl [&>img]:shadow-lg [&>img]:border-2 [&>img]:border-gray-200 [&>img]:my-8"
                  />
                </div>
              </div>

              {/* Author Section */}
              <footer className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 md:p-12 border-t-2 border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Author')}&background=3B82F6&color=ffffff&size=128`}
                      alt={post.author?.name || 'Author'}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <FaUser className="text-blue-500" />
                      <h3 className="text-xl font-bold text-gray-800">{post.author?.name || 'RoomSathi Team'}</h3>
                    </div>
                    <p className="text-blue-600 font-medium mb-3">{post.author?.role || 'Real Estate Expert'}</p>
                    {post.author?.bio && (
                      <p className="text-gray-600 leading-relaxed">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              </footer>

              {/* Back to Blog CTA */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Enjoyed this article?</h3>
                <p className="text-blue-100 mb-6">Explore more insights and tips on our blog</p>
                <Link
                  to="/blog"
                  className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:bg-blue-50 shadow-lg hover:shadow-xl"
                >
                  <FaArrowLeft className="mr-3" />
                  <span>View All Posts</span>
                </Link>
              </div>
            </article>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-8 md:p-12 text-center">
              <div className="bg-red-50 border-4 border-red-300 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h2>
              <div className="w-24 h-1 bg-red-400 mx-auto mb-6"></div>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Link 
                to="/blog" 
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaArrowLeft className="mr-3" />
                Return to Blog
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;