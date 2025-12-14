// src/pages/TermsPage.js
import { useState, useEffect } from 'react';
import { getPageContent } from '../../api/cmsApi';
import DOMPurify from 'dompurify';

const TermsPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await getPageContent('terms');
        setContent(data);
      } catch (error) {
        console.error('Error loading terms & conditions content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return {
      __html: DOMPurify.sanitize(htmlContent)
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 py-20 text-white shadow-2xl">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms & Conditions</h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-xl md:text-xl max-w-xl mx-auto leading-relaxed font-regular">
            Understanding the terms that govern your use of RoomSathi services
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 border border-gray-300"></div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full border border-gray-300"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 border border-gray-300"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 border border-gray-300"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-1/4 border border-gray-300"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full border border-gray-300"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 border border-gray-300"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 border border-gray-300"></div>
                </div>
              </div>
            </div>
          ) : content ? (
            <>
              {/* Main Terms Content */}
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden mb-8 hover:shadow-3xl">
                <div className="p-8 md:p-12">
                  <article className="prose prose-lg max-w-none prose-p:mb-6 prose-p:leading-relaxed prose-h1:mb-8 prose-h1:text-gray-800 prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-4 prose-h2:mb-6 prose-h2:mt-10 prose-h2:text-blue-700 prose-h2:border-l-4 prose-h2:border-blue-300 prose-h2:pl-4 prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-gray-700 prose-ul:my-6 prose-li:mb-3 prose-ol:my-6 prose-strong:text-blue-600">
                    <div 
                      dangerouslySetInnerHTML={createMarkup(content.content)} 
                      className="terms-content space-y-8 [&>p]:mb-6 [&>p]:leading-relaxed [&>p]:text-gray-700 [&>h1]:mb-8 [&>h1]:mt-0 [&>h1]:text-gray-800 [&>h1]:border-b [&>h1]:border-gray-200 [&>h1]:pb-4 [&>h2]:mb-6 [&>h2]:mt-10 [&>h2]:text-blue-700 [&>h2]:border-l-4 [&>h2]:border-blue-300 [&>h2]:pl-4 [&>h2]:bg-blue-50 [&>h2]:py-3 [&>h2]:rounded-r-lg [&>h3]:mb-4 [&>h3]:mt-8 [&>h3]:text-gray-700 [&>h3]:font-semibold [&>ul]:my-6 [&>ul]:space-y-2 [&>ul>li]:mb-3 [&>ul>li]:pl-2 [&>ol]:my-6 [&>ol>li]:mb-3 [&>ol>li]:pl-2 [&>strong]:text-blue-600 [&>strong]:font-semibold [&>em]:text-gray-600 [&>blockquote]:border-l-4 [&>blockquote]:border-blue-300 [&>blockquote]:bg-blue-50 [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:my-6 [&>blockquote]:rounded-r-lg"
                    />
                  </article>
                </div>
              </div>

              {/* Legal Notice Card */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white rounded-2xl shadow-2xl border-4 border-blue-700 p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Questions About Our Terms?</h2>
                  <div className="w-16 h-1 bg-white mx-auto mb-6"></div>
                  <p className="text-lg mb-6 leading-relaxed">
                    If you have any questions about these Terms & Conditions or need legal clarification, please contact us.
                  </p>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <p className="text-white/90 mb-2">Email us at:</p>
                    <p className="text-xl font-semibold">legal@roomsathi.com</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-8 text-center">
              <div className="bg-red-50 border-4 border-red-300 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Not Found</h2>
              <div className="w-24 h-1 bg-red-400 mx-auto mb-4"></div>
              <p className="text-gray-600 leading-relaxed">
                The terms & conditions content is currently unavailable. Please try again later or contact support if the issue persists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsPage;