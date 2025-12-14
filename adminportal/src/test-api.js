// Simple API test script
import { getPages } from './utils/pageApi.js';

// Test the API
const testAPI = async () => {
  try {
    console.log('Testing API...');
    const pages = await getPages();
    console.log('Pages retrieved:', pages);
    console.log('Number of pages:', pages.length);
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Run the test when this script is loaded
testAPI();
