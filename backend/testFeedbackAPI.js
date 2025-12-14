// Test script to verify feedback API endpoints
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

// Test get all feedback (admin)
const testGetAllFeedback = async () => {
  try {
    console.log('Testing GET /api/admin/feedback...');
    const response = await fetch(`${API_URL}/api/admin/feedback`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ GET feedback successful');
      console.log(`Found ${data.count} feedback entries`);
      if (data.data && data.data.length > 0) {
        console.log('Sample feedback:', {
          id: data.data[0]._id,
          subject: data.data[0].subject,
          status: data.data[0].status,
          featured: data.data[0].featured,
          showOnFrontend: data.data[0].showOnFrontend,
        });
      }
    } else {
      console.log('❌ GET feedback failed:', data.message);
    }
  } catch (error) {
    console.log('❌ GET feedback error:', error.message);
  }
};

// Test get public feedback
const testGetPublicFeedback = async () => {
  try {
    console.log('\nTesting GET /api/feedback/public...');
    const response = await fetch(`${API_URL}/api/feedback/public?limit=5`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ GET public feedback successful');
      console.log(`Found ${data.count} public feedback entries`);
    } else {
      console.log('❌ GET public feedback failed:', data.message);
    }
  } catch (error) {
    console.log('❌ GET public feedback error:', error.message);
  }
};

// Test update feedback (requires a valid feedback ID)
const testUpdateFeedback = async () => {
  try {
    console.log('\nTesting PUT /api/admin/feedback/:id...');

    // First get a feedback ID
    const getFeedbackResponse = await fetch(
      `${API_URL}/api/admin/feedback?limit=1`
    );
    const getFeedbackData = await getFeedbackResponse.json();

    if (
      !getFeedbackResponse.ok ||
      !getFeedbackData.data ||
      getFeedbackData.data.length === 0
    ) {
      console.log('❌ Cannot test update - no feedback found');
      return;
    }

    const feedbackId = getFeedbackData.data[0]._id;
    const updateData = {
      featured: !getFeedbackData.data[0].featured,
      showOnFrontend: !getFeedbackData.data[0].showOnFrontend,
    };

    const response = await fetch(
      `${API_URL}/api/admin/feedback/${feedbackId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ PUT feedback successful');
      console.log('Updated fields:', {
        featured: data.data.featured,
        showOnFrontend: data.data.showOnFrontend,
      });
    } else {
      console.log('❌ PUT feedback failed:', data.message);
    }
  } catch (error) {
    console.log('❌ PUT feedback error:', error.message);
  }
};

// Run all tests
const runTests = async () => {
  console.log('🧪 Testing Feedback API Integration...\n');

  await testGetAllFeedback();
  await testGetPublicFeedback();
  await testUpdateFeedback();

  console.log('\n✨ API testing completed!');
};

runTests();
