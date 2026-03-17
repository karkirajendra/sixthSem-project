// src/api/cmsApi.js
import { API_URL } from '../config';

const DEFAULT_PAGES = {
  about: {
    slug: 'about',
    title: 'About RoomSathi',
    content: `
      <h2>About RoomSathi</h2>
      <p>
        RoomSathi helps you find rooms, flats, and apartments across Nepal. Browse listings,
        save your favorites, and contact owners directly.
      </p>
      <h3>Our mission</h3>
      <p>
        Make it easy and trustworthy to find a place to live.
      </p>
    `,
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    content: `
      <h2>Privacy Policy</h2>
      <p>This is a default privacy policy placeholder. Please update it from the Admin Portal CMS.</p>
    `,
  },
  terms: {
    slug: 'terms',
    title: 'Terms & Conditions',
    content: `
      <h2>Terms & Conditions</h2>
      <p>This is a default terms placeholder. Please update it from the Admin Portal CMS.</p>
    `,
  },
};

// Get page content by slug
export const getPageContent = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/api/cms/pages/${slug}`);

    if (!response.ok) {
      // If CMS page doesn't exist yet, return a safe default for key pages
      if (response.status === 404 && DEFAULT_PAGES[slug]) {
        return DEFAULT_PAGES[slug];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching page content:', error);
    // Network errors etc: fallback if available
    if (DEFAULT_PAGES[slug]) {
      return DEFAULT_PAGES[slug];
    }
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

