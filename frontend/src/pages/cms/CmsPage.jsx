import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getPageContent } from '../../api/cmsApi';

const CmsPage = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPageContent(slug);
        setContent(data);
      } catch (e) {
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) load();
  }, [slug]);

  const createMarkup = (htmlContent) => ({
    __html: DOMPurify.sanitize(htmlContent || ''),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        ) : content ? (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 md:p-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {content.title || slug}
              </h1>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={createMarkup(content.content)}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Page not found
            </h1>
            <p className="text-gray-600">
              This page isn’t published yet (or the slug is wrong).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CmsPage;

