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
      image: "./pemba.jpg",
       imagePosition: "object-top"
     
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      {/* Enhanced Hero Section */}
      <div className="relative py-20 text-white shadow-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500">
        <div className="container relative z-10 px-4 mx-auto text-center">
          <h1 className="mb-6 text-3xl font-bold md:text-4xl">About RoomSathi</h1>
          <div className="w-24 h-1 mx-auto mb-6 bg-white"></div>
          <p className="max-w-3xl mx-auto text-xl leading-relaxed md:text-xl font-regular">
            Your trusted partner for finding rooms, flats, and apartments across Nepal
          </p>
        </div>
      </div>

      <div className="container px-4 py-12 mx-auto sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="p-8 bg-white border-2 border-gray-100 shadow-2xl rounded-2xl animate-pulse">
              <div className="w-1/4 h-8 mb-6 bg-gray-200 border border-gray-300 rounded"></div>
              <div className="space-y-4">
                <div className="w-3/4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                <div className="w-5/6 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                <div className="w-2/3 h-4 bg-gray-200 border border-gray-300 rounded"></div>
              </div>
            </div>
          ) : content ? (
            <>
              {/* Enhanced Main Content Card */}
              <div className="mb-12 overflow-hidden transition-all duration-300 bg-white border-2 border-gray-200 shadow-2xl rounded-2xl hover:border-blue-300 hover:shadow-3xl">
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
              <div className="relative px-8 py-12 mb-12 overflow-hidden border-2 border-gray-200 shadow-xl bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(59, 130, 246, 0.1) 35px, rgba(59, 130, 246, 0.1) 70px)`
                  }}></div>
                </div>
                
                <div className="relative z-10">
                  <div className="mb-12 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-gray-800">Our Team</h2>
                    <div className="w-24 h-1 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-teal-500"></div>
                    <p className="max-w-2xl mx-auto text-gray-600">Meet the dedicated professionals behind RoomSathi</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="overflow-hidden transition-all duration-300 bg-white border-2 border-gray-200 shadow-lg rounded-xl hover:border-blue-400 hover:shadow-2xl group">
                        <div className="relative h-56 sm:h-64 overflow-hidden border-b-2 border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200">
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${member.imagePosition || 'object-contain pt-4'} `}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <div className="relative p-6 text-center">
                          <div className="absolute top-0 transform -translate-x-1/2 -translate-y-1/2 left-1/2">
                            <div className="w-4 h-4 rotate-45 bg-blue-500 border-2 border-white"></div>
                          </div>
                          <h3 className="mt-2 mb-2 text-xl font-semibold text-gray-900">{member.name}</h3>
                          <div className="inline-block px-3 py-1 mb-3 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full">
                            {member.position}
                          </div>
                          <p className="leading-relaxed text-gray-600">{member.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Mission Section */}
              <div className="relative p-8 overflow-hidden text-white border-4 border-blue-700 shadow-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 rounded-2xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-white/10"></div>
                
                {/* Border accents */}
                <div className="absolute w-12 h-12 border-t-4 border-l-4 rounded-tl-lg top-4 left-4 border-white/40"></div>
                <div className="absolute w-12 h-12 border-t-4 border-r-4 rounded-tr-lg top-4 right-4 border-white/40"></div>
                <div className="absolute w-12 h-12 border-b-4 border-l-4 rounded-bl-lg bottom-4 left-4 border-white/40"></div>
                <div className="absolute w-12 h-12 border-b-4 border-r-4 rounded-br-lg bottom-4 right-4 border-white/40"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                  <div className="p-6 border-2 border-white/30 rounded-xl backdrop-blur-sm bg-white/10">
                    <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
                    <div className="w-16 h-1 mx-auto mb-6 bg-yellow-400"></div>
                    <p className="text-lg font-medium leading-relaxed">
                      To make finding rental properties in Nepal simple, transparent, and stress-free for everyone.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-white border-2 border-red-200 shadow-2xl rounded-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 border-4 border-red-300 rounded-full">
                <span className="text-2xl text-red-500">⚠</span>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Content Not Found</h2>
              <div className="w-24 h-1 mx-auto mb-4 bg-red-400"></div>
              <p className="inline-block pl-4 text-gray-600 border-l-4 border-red-300">
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