// Test script for admin API endpoints
const API_BASE = 'http://localhost:5000/api/admin';

// Test function
async function testAPI() {
  try {
    // Test basic connection
    const response = await fetch(`${API_BASE}/test`);
    console.log('API connection test:', response.status);

    if (response.ok) {
      const data = await response.text();
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testAPI();
