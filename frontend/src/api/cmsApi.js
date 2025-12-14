// src/api/cmsApi.js
import { API_URL } from '../config';

// Get page content by slug
export const getPageContent = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/api/cms/pages/${slug}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
};

// Get all blog posts
export const getBlogPosts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/api/cms/blog?${queryParams}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

// Get single blog post by slug
export const getBlogPost = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/api/cms/blog/${slug}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
};

// Get blog categories
export const getBlogCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/api/cms/blog/categories`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    throw error;
  }
};

// Get blog tags
export const getBlogTags = async () => {
  try {
    const response = await fetch(`${API_URL}/api/cms/blog/tags`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    throw error;
  }
};

