// Test script for Properties API integration
import { getAllProperties } from './api/api.js';
import { performSuperSearch } from './api/recommendationApi.js';

// Test function to validate API integration
export const testPropertiesAPI = async () => {
  console.log('🧪 Testing Properties API Integration...');

  try {
    // Test 1: Get all properties without filters
    console.log('\n📋 Test 1: Getting all properties...');
    const allProperties = await getAllProperties({});
    console.log(
      `✅ Successfully fetched ${
        allProperties?.properties?.length || allProperties?.length || 0
      } properties`
    );

    // Test 2: Get properties with location filter
    console.log('\n📍 Test 2: Getting properties with location filter...');
    const locationProperties = await getAllProperties({
      location: 'Kathmandu',
    });
    console.log(
      `✅ Successfully fetched ${
        locationProperties?.properties?.length ||
        locationProperties?.length ||
        0
      } properties in Kathmandu`
    );

    // Test 3: Get properties with type filter
    console.log('\n🏠 Test 3: Getting properties with type filter...');
    const roomProperties = await getAllProperties({ type: 'room' });
    console.log(
      `✅ Successfully fetched ${
        roomProperties?.properties?.length || roomProperties?.length || 0
      } room properties`
    );

    // Test 4: Get properties with price range
    console.log('\n💰 Test 4: Getting properties with price range...');
    const priceRangeProperties = await getAllProperties({
      minPrice: 5000,
      maxPrice: 15000,
    });
    console.log(
      `✅ Successfully fetched ${
        priceRangeProperties?.properties?.length ||
        priceRangeProperties?.length ||
        0
      } properties in price range 5000-15000`
    );

    // Test 5: Test SuperSearch
    console.log('\n🔍 Test 5: Testing SuperSearch...');
    const superSearchResults = await performSuperSearch('room under 10k');
    console.log(
      `✅ SuperSearch returned ${superSearchResults?.length || 0} results`
    );

    console.log('\n🎉 All API tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ API Test failed:', error);
    return false;
  }
};

// Function to run tests from browser console
window.testPropertiesAPI = testPropertiesAPI;
