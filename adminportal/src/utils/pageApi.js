import { PAGE_STATUS } from './constants';

// API Configuration
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to ensure admin is authenticated
const ensureAuthenticated = async () => {
  const token = getAuthToken();
  if (!token) {
    try {
      // Try to auto-login with test admin
      const response = await fetch(`${API_URL}/api/admin/test-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.token;
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
    }
  }
  return token;
};

// Helper function to create headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// API Functions

export const getPages = async () => {
  try {
    // Ensure authentication before making request
    await ensureAuthenticated();

    const response = await fetch(`${API_URL}/api/admin/cms/pages`, {
      method: 'GET',
      headers: createHeaders(true), // Admin endpoint requires auth
    });

    const result = await handleApiResponse(response);

    // Transform backend data to match frontend expectations
    const transformedData = result.data.map((page) => ({
      id: page._id,
      title: page.title,
      type: page.type,
      content: page.content,
      lastUpdated: new Date(page.updatedAt).toISOString().split('T')[0],
      status: page.status, // Keep original case
      featuredImage: page.featuredImage,
      slug: page.slug,
      author: page.author,
      publishedAt: page.publishedAt,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      seoMeta: page.seoMeta,
    }));

    return transformedData;
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

export const getPageById = async (id) => {
  try {
    // Ensure authentication before making request
    await ensureAuthenticated();

    const response = await fetch(`${API_URL}/api/admin/cms/pages/${id}`, {
      method: 'GET',
      headers: createHeaders(true), // Admin endpoint requires auth
    });

    const result = await handleApiResponse(response);

    // Transform backend data to match frontend expectations
    const page = result.data;
    return {
      id: page._id,
      title: page.title,
      type: page.type,
      content: page.content,
      lastUpdated: new Date(page.updatedAt).toISOString().split('T')[0],
      status: page.status, // Keep original case
      featuredImage: page.featuredImage,
      slug: page.slug,
      author: page.author,
      publishedAt: page.publishedAt,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      seoMeta: page.seoMeta,
    };
  } catch (error) {
    console.error('Error fetching page by ID:', error);
    throw error;
  }
};

export const getPageBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/cms/pages/${slug}`, {
      method: 'GET',
      headers: createHeaders(true), // Admin endpoint requires auth
    });

    const result = await handleApiResponse(response);

    // Transform backend data to match frontend expectations
    const page = result.data;
    return {
      id: page._id,
      title: page.title,
      type: page.type,
      content: page.content,
      lastUpdated: new Date(page.updatedAt).toISOString().split('T')[0],
      status: page.status, // Keep original case
      featuredImage: page.featuredImage,
      slug: page.slug,
      author: page.author,
      publishedAt: page.publishedAt,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      seoMeta: page.seoMeta,
    };
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    throw error;
  }
};

export const savePage = async (pageData) => {
  try {
    // Ensure authentication before making request
    await ensureAuthenticated();

    const isUpdate = pageData.id && pageData.id !== '';
    const method = isUpdate ? 'PUT' : 'POST';
    const url = isUpdate
      ? `${API_URL}/api/admin/cms/pages/${pageData.id}`
      : `${API_URL}/api/admin/cms/pages`;

    // Transform frontend data to match backend expectations
    const payload = {
      title: pageData.title,
      slug: pageData.slug || generateSlug(pageData.title),
      content: pageData.content,
      type: pageData.type,
      status: pageData.status?.toLowerCase() || 'draft',
      featuredImage: pageData.featuredImage,
      seoMeta: pageData.seoMeta || {},
    };

    const response = await fetch(url, {
      method,
      headers: createHeaders(true),
      body: JSON.stringify(payload),
    });

    const result = await handleApiResponse(response);

    // Transform backend response to match frontend expectations
    const savedPage = result.data;
    return {
      id: savedPage._id,
      title: savedPage.title,
      type: savedPage.type,
      content: savedPage.content,
      lastUpdated: new Date(savedPage.updatedAt).toISOString().split('T')[0],
      status: savedPage.status, // Keep original case
      featuredImage: savedPage.featuredImage,
      slug: savedPage.slug,
      author: savedPage.author,
      publishedAt: savedPage.publishedAt,
      createdAt: savedPage.createdAt,
      updatedAt: savedPage.updatedAt,
      seoMeta: savedPage.seoMeta,
    };
  } catch (error) {
    console.error('Error saving page:', error);
    throw error;
  }
};

export const deletePage = async (id) => {
  try {
    // Ensure authentication before making request
    await ensureAuthenticated();

    const response = await fetch(`${API_URL}/api/admin/cms/pages/${id}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    await handleApiResponse(response);
    return true;
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
};
