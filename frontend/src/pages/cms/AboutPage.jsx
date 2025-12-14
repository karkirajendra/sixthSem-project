// src/pages/AboutPage.jsx
import { useState, useEffect } from 'react';
import { getPageContent } from '../../api/cmsApi';
import DOMPurify from 'dompurify';

const AboutPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await getPageContent('about');
        setContent(data);
      } catch (error) {
        console.error('Error loading about page content:', error);
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

  // Team members data
  const teamMembers = [
    {
      name: "Rajendra Karki",
      position: "Student",
      bio: "A student of Tribhuwan University Studying Bachelor's in computer application.",
      image: "./rk.jpg"
    },
    {
      name: "Pemba Sherpa",
      position: "Student",
      bio: "A student of Tribhuwan University Studying Bachelor's in computer application.",
      image: "./pemba.jpg"
     
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 py-20 text-white shadow-2xl">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">About RoomSathi</h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-xl md:text-xl max-w-3xl mx-auto leading-relaxed font-regular">
            Your trusted partner for finding rooms, flats, and apartments across Nepal
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 border border-gray-300"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 border border-gray-300"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 border border-gray-300"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 border border-gray-300"></div>
              </div>
            </div>
          ) : content ? (
            <>
              {/* Enhanced Main Content Card */}
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden mb-12 hover:shadow-3xl">
                <div className="p-8 md:p-10">
                  <article className="prose prose-lg max-w-none prose-p:mb-6 prose-p:leading-relaxed prose-h1:mb-6 prose-h2:mb-4 prose-h2:mt-8 prose-h3:mb-3 prose-h3:mt-6 prose-ul:my-6 prose-li:mb-2">
                    <div 
                      dangerouslySetInnerHTML={createMarkup(content.content)} 
                      className="space-y-6 [&>p]:mb-6 [&>p]:leading-relaxed [&>h1]:mb-6 [&>h1]:mt-0 [&>h2]:mb-4 [&>h2]:mt-8 [&>h3]:mb-3 [&>h3]:mt-6 [&>ul]:my-6 [&>ul>li]:mb-2 [&>ol]:my-6 [&>ol>li]:mb-2"
                    />
                  </article>
                </div>
              </div>
              
              {/* Enhanced Team Section */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 px-8 py-12 rounded-2xl mb-12 shadow-xl relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(59, 130, 246, 0.1) 35px, rgba(59, 130, 246, 0.1) 70px)`
                  }}></div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Team</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto">Meet the dedicated professionals behind RoomSathi</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden relative border-b-2 border-gray-200">
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <div className="p-6 text-center relative">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 bg-blue-500 rotate-45 border-2 border-white"></div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-2">{member.name}</h3>
                          <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-3 border border-blue-200">
                            {member.position}
                          </div>
                          <p className="text-gray-600 leading-relaxed">{member.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Mission Section */}
              <div className="relative p-8 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white rounded-2xl shadow-2xl border-4 border-blue-700 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                {/* Border accents */}
                <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-white/40 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-white/40 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-white/40 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-white/40 rounded-br-lg"></div>
                
                <div className="max-w-3xl mx-auto text-center relative z-10">
                  <div className="border-2 border-white/30 rounded-xl p-6 backdrop-blur-sm bg-white/10">
                    <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                    <div className="w-16 h-1 bg-yellow-400 mx-auto mb-6"></div>
                    <p className="text-lg leading-relaxed font-medium">
                      To make finding rental properties in Nepal simple, transparent, and stress-free for everyone.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-8 text-center">
              <div className="border-4 border-red-300 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl text-red-500">⚠</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Not Found</h2>
              <div className="w-24 h-1 bg-red-400 mx-auto mb-4"></div>
              <p className="text-gray-600 border-l-4 border-red-300 pl-4 inline-block">
                The page content is currently unavailable. Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;